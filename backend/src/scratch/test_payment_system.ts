import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import { Product } from "../models/Product.js";
import { Address } from "../models/Address.js";
import { Coupon } from "../models/Coupon.js";
import { User } from "../models/User.js";
import { Cart } from "../models/Cart.js";
import { Order } from "../models/Order.js";
import {
  createRazorpayOrder,
  verifyPaymentAndCreateOrder,
  createCODOrder,
} from "../controllers/paymentController.js";
import { handleWebhook } from "../controllers/webhookController.js";
import logger from "../utils/logger.js";
import crypto from "crypto";
import { env } from "../config/env.js";

// Mock Express Response helper
const mockResponse = () => {
  const res: any = {};
  res.statusCode = 200;
  res.status = (code: number) => {
    res.statusCode = code;
    return res;
  };
  res.json = (data: any) => {
    res.jsonData = data;
    return res;
  };
  return res;
};

const runTests = async () => {
  logger.info("🧪 Running Payment System Verification Script...");
  await connectDB();

  // Create temporary test documents
  const testUserId = new mongoose.Types.ObjectId();
  const testAddressId = new mongoose.Types.ObjectId();
  const testProductId = new mongoose.Types.ObjectId();
  
  logger.info("Creating test data...");
  
  // 1. Create a test product
  const product = await Product.create({
    _id: testProductId,
    name: "Verification Test Saree",
    slug: "verification-test-saree-" + Date.now(),
    shortDescription: "A beautiful test saree for automated system checks",
    description: "Detailed description of verification saree",
    sku: "TEST-SAREE-" + Date.now(),
    originalPrice: 1999,
    salePrice: 1499,
    stock: 10,
    category: new mongoose.Types.ObjectId(),
    isActive: true,
  });

  // 2. Create a test address
  const address = await Address.create({
    _id: testAddressId,
    user: testUserId,
    fullName: "Tester McGee",
    mobileNumber: "9999988888",
    addressLine1: "123 Test Street",
    city: "Surat",
    state: "Gujarat",
    postalCode: "395002",
    country: "India",
  });

  // 3. Create a test cart for the user
  const cart = await Cart.create({
    user: testUserId,
    items: [{ product: testProductId, quantity: 2, price: 1499 }],
    totalItems: 2,
    totalAmount: 2998,
  });

  // 4. Create a test coupon
  const couponCode = "VERIFY50";
  const coupon = await Coupon.create({
    code: couponCode,
    discountPercentage: 10,
    minimumOrderAmount: 1000,
    expiresAt: new Date(Date.now() + 86400000), // tomorrow
    isActive: true,
    usageLimit: 5,
    usedCount: 0,
  });

  try {
    // ----------------------------------------------------
    // TEST 1: Zod Payload Rejection
    // ----------------------------------------------------
    logger.info("TEST 1: Zod payload rejection...");
    const badReq = {
      user: { id: testUserId.toString() },
      body: {
        items: [{ product: "invalid-id", quantity: 0 }],
        shippingAddress: testAddressId.toString(),
      },
    } as any;
    const badRes = mockResponse();
    await createRazorpayOrder(badReq, badRes);
    if (badRes.statusCode !== 400) {
      throw new Error(`Expected 400 for bad payload, got ${badRes.statusCode}`);
    }
    logger.info("✅ TEST 1 Passed!");

    // ----------------------------------------------------
    // TEST 2: Pending Order & Stock Reservation
    // ----------------------------------------------------
    logger.info("TEST 2: Pending order creation and stock reservation...");
    const req1 = {
      user: { id: testUserId.toString() },
      body: {
        items: [{ product: testProductId.toString(), quantity: 2 }],
        shippingAddress: testAddressId.toString(),
        couponCode,
      },
    } as any;
    const res1 = mockResponse();

    await createRazorpayOrder(req1, res1);

    if (res1.statusCode !== 201) {
      throw new Error(`Expected 201 for order creation, got ${res1.statusCode}. Data: ${JSON.stringify(res1.jsonData)}`);
    }

    const rzpOrderId = res1.jsonData.order.id;
    const pendingOrder = await Order.findOne({ razorpayOrderId: rzpOrderId });
    if (!pendingOrder) {
      throw new Error("Pending order was not created in the database!");
    }
    if (pendingOrder.paymentStatus !== "pending" || pendingOrder.orderStatus !== "pending") {
      throw new Error(`Expected pending order status, got payment=${pendingOrder.paymentStatus}, order=${pendingOrder.orderStatus}`);
    }

    // Verify stock was decremented from 10 to 8
    const productAfterReserve = await Product.findById(testProductId);
    if (productAfterReserve!.stock !== 8) {
      throw new Error(`Stock reservation failed. Expected 8, got ${productAfterReserve!.stock}`);
    }
    logger.info("✅ TEST 2 Passed!");

    // ----------------------------------------------------
    // TEST 3: Concurrent Payment Verification (Distributed Locking & Idempotency)
    // ----------------------------------------------------
    logger.info("TEST 3: Concurrent verification requests...");
    const mockPaymentId = "pay_test_" + Date.now();
    const mockSignature = crypto
      .createHmac("sha256", env.RAZORPAY_KEY_SECRET)
      .update(rzpOrderId + "|" + mockPaymentId)
      .digest("hex");

    const verifyReq = {
      user: { id: testUserId.toString() },
      body: {
        razorpay_order_id: rzpOrderId,
        razorpay_payment_id: mockPaymentId,
        razorpay_signature: mockSignature,
      },
    } as any;

    const verifyRes1 = mockResponse();
    const verifyRes2 = mockResponse();

    // Call verify concurrently
    const [p1, p2] = await Promise.all([
      verifyPaymentAndCreateOrder(verifyReq, verifyRes1),
      verifyPaymentAndCreateOrder(verifyReq, verifyRes2),
    ]);

    // One must succeed (200), and the other must be locked/duplicate (409) or return success (idempotent 200/already verified)
    logger.info(`Verify 1 status: ${verifyRes1.statusCode}, Verify 2 status: ${verifyRes2.statusCode}`);
    
    const statuses = [verifyRes1.statusCode, verifyRes2.statusCode];
    if (!statuses.includes(200)) {
      throw new Error(`Expected at least one verification request to return 200, got ${statuses.join(", ")}`);
    }

    // Verify database settled properly
    const confirmedOrder = await Order.findOne({ razorpayOrderId: rzpOrderId });
    if (confirmedOrder!.paymentStatus !== "paid" || confirmedOrder!.orderStatus !== "confirmed") {
      throw new Error(`Expected order paid & confirmed, got payment=${confirmedOrder!.paymentStatus}, order=${confirmedOrder!.orderStatus}`);
    }

    // Verify coupon usage was incremented
    const updatedCoupon = await Coupon.findOne({ code: couponCode });
    if (updatedCoupon!.usedCount !== 1) {
      throw new Error(`Expected coupon usedCount 1, got ${updatedCoupon!.usedCount}`);
    }

    // Verify cart was cleared
    const updatedCart = await Cart.findOne({ user: testUserId });
    if (updatedCart!.items.length !== 0) {
      throw new Error("Expected cart to be cleared, but items still exist");
    }
    logger.info("✅ TEST 3 Passed!");

    // ----------------------------------------------------
    // TEST 4: COD Order Creation (Transaction & Stock Reserve)
    // ----------------------------------------------------
    logger.info("TEST 4: COD order creation...");
    // Repopulate cart for user
    await Cart.updateOne({ user: testUserId }, {
      $set: {
        items: [{ product: testProductId, quantity: 3, price: 1499 }],
        totalItems: 3,
        totalAmount: 4497,
      }
    });

    const codReq = {
      user: { id: testUserId.toString() },
      body: {
        items: [{ product: testProductId.toString(), quantity: 3 }],
        shippingAddress: testAddressId.toString(),
        couponCode,
      },
    } as any;

    const codRes = mockResponse();
    await createCODOrder(codReq, codRes);

    if (codRes.statusCode !== 201) {
      throw new Error(`COD placement failed with ${codRes.statusCode}: ${JSON.stringify(codRes.jsonData)}`);
    }

    const codOrder = await Order.findById(codRes.jsonData.order._id);
    if (!codOrder || codOrder.paymentMethod !== "COD") {
      throw new Error("COD Order was not saved properly");
    }

    // Verify stock decremented: was 8, should now be 5
    const productAfterCOD = await Product.findById(testProductId);
    if (productAfterCOD!.stock !== 5) {
      throw new Error(`COD Stock decrement failed. Expected 5, got ${productAfterCOD!.stock}`);
    }

    // Verify coupon usage incremented again (usedCount should be 2)
    const updatedCoupon2 = await Coupon.findOne({ code: couponCode });
    if (updatedCoupon2!.usedCount !== 2) {
      throw new Error(`Expected coupon usedCount 2, got ${updatedCoupon2!.usedCount}`);
    }
    logger.info("✅ TEST 4 Passed!");

    // ----------------------------------------------------
    // TEST 5: Webhook Verification and Failed Payment Flow
    // ----------------------------------------------------
    logger.info("TEST 5: Webhook signature verification and failure events...");
    
    // Create a new pending order
    const req2 = {
      user: { id: testUserId.toString() },
      body: {
        items: [{ product: testProductId.toString(), quantity: 2 }],
        shippingAddress: testAddressId.toString(),
      },
    } as any;
    const res2 = mockResponse();
    await createRazorpayOrder(req2, res2);
    
    const rzpOrderId2 = res2.jsonData.order.id;
    
    // Stock was 5, now should be 3
    const productAfterReserve2 = await Product.findById(testProductId);
    if (productAfterReserve2!.stock !== 3) {
      throw new Error(`Expected stock 3, got ${productAfterReserve2!.stock}`);
    }

    // Trigger payment.failed webhook
    const failedPayload = {
      event: "payment.failed",
      payload: {
        payment: {
          entity: {
            id: "pay_failed_123",
            order_id: rzpOrderId2,
          }
        }
      }
    };

    const webhookBodyStr = JSON.stringify(failedPayload);
    const webhookSignature = crypto
      .createHmac("sha256", env.RAZORPAY_WEBHOOK_SECRET)
      .update(Buffer.from(webhookBodyStr))
      .digest("hex");

    const webhookReq = {
      headers: {
        "x-razorpay-signature": webhookSignature,
      },
      rawBody: Buffer.from(webhookBodyStr),
      body: failedPayload,
    } as any;

    const webhookRes = mockResponse();
    await handleWebhook(webhookReq, webhookRes);

    if (webhookRes.statusCode !== 200) {
      throw new Error(`Expected webhook 200, got ${webhookRes.statusCode}`);
    }

    // Verify order was marked failed/cancelled
    const failedOrder = await Order.findOne({ razorpayOrderId: rzpOrderId2 });
    if (failedOrder!.paymentStatus !== "failed" || failedOrder!.orderStatus !== "cancelled") {
      throw new Error(`Expected order status cancelled/failed, got payment=${failedOrder!.paymentStatus}, order=${failedOrder!.orderStatus}`);
    }

    // Verify stock was restored: was 3, should be back to 5!
    const productAfterRestore = await Product.findById(testProductId);
    if (productAfterRestore!.stock !== 5) {
      throw new Error(`Stock restoration failed. Expected 5, got ${productAfterRestore!.stock}`);
    }
    logger.info("✅ TEST 5 Passed!");

    logger.info("🎉 All Automated Payment Verification Tests Passed Successfully!");
  } finally {
    // Cleanup temporary documents
    logger.info("Cleaning up verification test files...");
    await Product.deleteOne({ _id: testProductId });
    await Address.deleteOne({ _id: testAddressId });
    await Cart.deleteOne({ user: testUserId });
    await Coupon.deleteOne({ code: couponCode });
    await Order.deleteMany({ user: testUserId });
    await mongoose.connection.close();
  }
};

runTests().catch((err) => {
  logger.error("❌ TEST RUN FAILED:");
  logger.error(err.stack || err.message);
  process.exit(1);
});
