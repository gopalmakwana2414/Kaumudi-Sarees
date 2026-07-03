import { Request, Response } from "express";
import crypto from "crypto";
import { razorpay } from "../services/razorpayService";
import { Order } from "../models/Order";
import { Address } from "../models/Address";
import { Product } from "../models/Product";
import { Coupon } from "../models/Coupon";
import { User } from "../models/User";
import {
  sendOrderConfirmationEmail,
  sendAdminOrderAlert,
} from "../services/emailService";

const FREE_SHIPPING_THRESHOLD = 999;
const SHIPPING_FEE = 99;

// =====================================
// SERVER-SIDE TOTALS RECOMPUTATION
// =====================================
// SECURITY: never trust price/totalAmount sent by the client. Previously,
// the client computed the cart total in the browser and sent it straight
// to /payment/create-order and /payment/verify — meaning a modified request
// could create a Razorpay order for ₹1 and then submit orderData claiming
// a ₹50,000 order, and the server would have saved it as paid with no
// cross-check. This helper is the single source of truth for what an
// order actually costs: it re-fetches each product's real price and stock
// from the database and re-validates any coupon, rather than trusting
// anything the client claims about pricing.
const calculateOrderTotals = async (
  items: { product: string; quantity: number }[],
  couponCode?: string
) => {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error("Cart is empty");
  }

  const resolvedItems: { product: string; quantity: number; price: number }[] = [];
  let subtotal = 0;
  let totalItems = 0;

  for (const { product: productId, quantity } of items) {
    if (!productId || !quantity || quantity < 1) {
      throw new Error("Invalid item in cart");
    }

    const product = await Product.findById(productId);

    if (!product || !product.isActive) {
      throw new Error(`Product ${productId} is no longer available`);
    }

    if (product.stock < quantity) {
      throw new Error(`Insufficient stock for "${product.name}"`);
    }

    resolvedItems.push({
      product: product._id.toString(),
      quantity,
      price: product.salePrice, // authoritative price — never from the client
    });

    subtotal += product.salePrice * quantity;
    totalItems += quantity;
  }

  const shipping = subtotal > FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;

  let discount = 0;
  let validatedCouponCode = "";

  if (couponCode) {
    const coupon = await Coupon.findOne({
      code: String(couponCode).toUpperCase(),
      isActive: true,
    });

    if (!coupon) {
      throw new Error("Invalid coupon");
    }

    if (new Date() > coupon.expiresAt) {
      throw new Error("Coupon expired");
    }

    if (subtotal < coupon.minimumOrderAmount) {
      throw new Error("Minimum order amount not reached for this coupon");
    }

    discount = Math.round((subtotal * coupon.discountPercentage) / 100);
    validatedCouponCode = coupon.code;
  }

  const totalAmount = Math.max(subtotal + shipping - discount, 0);

  return {
    items: resolvedItems,
    totalItems,
    subtotal,
    shipping,
    discount,
    couponCode: validatedCouponCode,
    totalAmount,
  };
};

// =====================================
// HELPER — Send order emails (non-blocking)
// =====================================
const sendOrderEmails = async (order: any) => {
  try {
    const user = await User.findById(order.user);
    const address = await Address.findById(order.shippingAddress);

    if (!user || !address) return;

    const itemsWithNames = await Promise.all(
      order.items.map(async (item: any) => {
        const product = await Product.findById(item.product).select("name");
        return {
          name: product?.name || "Saree",
          quantity: item.quantity,
          price: item.price,
        };
      })
    );

    const addressString = `${address.addressLine1}${
      address.addressLine2 ? ", " + address.addressLine2 : ""
    }, ${address.city}, ${address.state} – ${address.postalCode}`;

    await sendOrderConfirmationEmail({
      to: user.email,
      customerName: user.name,
      orderId: order._id.toString(),
      items: itemsWithNames,
      totalAmount: order.totalAmount,
      paymentMethod: order.paymentMethod,
      address: addressString,
    });

    await sendAdminOrderAlert({
      orderId: order._id.toString(),
      customerName: user.name,
      customerEmail: user.email,
      totalAmount: order.totalAmount,
      paymentMethod: order.paymentMethod,
      itemCount: order.totalItems,
    });
  } catch (err: any) {
    console.error("Order email sending failed:", err.message);
  }
};

// =====================================
// CREATE RAZORPAY ORDER
// =====================================
// Client now sends only { items, couponCode } — the cart contents, not a
// price. The amount charged is entirely computed here from real product
// data, so nothing the client sends can change what Razorpay actually
// collects.
export const createRazorpayOrder = async (req: Request, res: Response) => {
  try {
    const { items, couponCode } = req.body;

    const totals = await calculateOrderTotals(items, couponCode);

    if (totals.totalAmount <= 0) {
      return res.status(400).json({ message: "Invalid order amount" });
    }

    const options = {
      amount: Math.round(totals.totalAmount * 100), // INR → paise
      currency: "INR",
      receipt: `rcpt_${Date.now()}`,
    };

    const razorpayOrder = await razorpay.orders.create(options);

    return res.status(200).json({
      success: true,
      order: razorpayOrder,
      breakdown: totals,
    });
  } catch (error: any) {
    return res.status(400).json({
      message: error.message,
    });
  }
};

// =====================================
// VERIFY PAYMENT & CREATE ORDER
// =====================================
export const verifyPaymentAndCreateOrder = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = (req as any).user.id;

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      items,
      couponCode,
      shippingAddress,
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        message: "Payment details missing",
      });
    }

    // =====================================
    // IDEMPOTENCY — a retried/duplicated verify call for a Razorpay order
    // we've already turned into an Order must not create a second one
    // (e.g. the user's network blips right after the handler fires and
    // the frontend retries, or the browser resends the request).
    // =====================================
    const existingOrder = await Order.findOne({
      razorpayOrderId: razorpay_order_id,
    });

    if (existingOrder) {
      return res.status(200).json({
        success: true,
        message: "Payment already verified",
        order: existingOrder,
      });
    }

    // =====================================
    // VERIFY SIGNATURE (SECURITY CHECK)
    // =====================================
    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment signature",
      });
    }

    // =====================================
    // RECOMPUTE THE ORDER TOTAL SERVER-SIDE, THEN CROSS-CHECK IT AGAINST
    // WHAT WAS ACTUALLY CAPTURED BY RAZORPAY.
    // =====================================
    // This is the second half of the fix: even with a valid signature, we
    // don't assume the amount that was paid matches the cart being
    // submitted (the cart could have changed between order-creation and
    // verification, or the client could simply lie). We fetch the real
    // Razorpay order and require its amount to match what we compute here.
    const totals = await calculateOrderTotals(items, couponCode);

    const razorpayOrder = await razorpay.orders.fetch(razorpay_order_id);
    const paidAmountRupees = Number(razorpayOrder.amount) / 100;

    if (Math.round(paidAmountRupees) !== Math.round(totals.totalAmount)) {
      console.error(
        `Payment amount mismatch for order ${razorpay_order_id}: paid ₹${paidAmountRupees}, expected ₹${totals.totalAmount}`
      );
      return res.status(400).json({
        message:
          "Payment amount does not match order total. Please contact support with your payment ID.",
      });
    }

    if (!shippingAddress) {
      return res.status(400).json({ message: "Shipping address is required" });
    }

    const address = await Address.findOne({
      _id: shippingAddress,
      user: userId,
    });

    if (!address) {
      return res.status(404).json({ message: "Address not found" });
    }

    // =====================================
    // CREATE ORDER IN DB (PAID ORDER) — using only server-computed values
    // =====================================
    const newOrder = await Order.create({
      user: userId,
      items: totals.items,
      shippingAddress: address._id,
      totalItems: totals.totalItems,
      totalAmount: totals.totalAmount,
      couponCode: totals.couponCode,
      discountAmount: totals.discount,
      paymentMethod: "ONLINE",
      paymentStatus: "paid",
      paymentId: razorpay_payment_id,
      razorpayOrderId: razorpay_order_id,
      orderStatus: "confirmed",
    });

    // Decrease stock for each item (non-blocking safety)
    for (const item of newOrder.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity },
      });
    }

    // Send confirmation + admin alert emails (non-blocking)
    sendOrderEmails(newOrder);

    return res.status(201).json({
      success: true,
      message: "Payment verified & order created",
      order: newOrder,
    });
  } catch (error: any) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

// =====================================
// CASH ON DELIVERY ORDER
// =====================================
export const createCODOrder = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { items, couponCode, shippingAddress } = req.body;

    if (!shippingAddress) {
      return res.status(400).json({ message: "Shipping address is required" });
    }

    const address = await Address.findOne({
      _id: shippingAddress,
      user: userId,
    });

    if (!address) {
      return res.status(404).json({ message: "Address not found" });
    }

    // Same server-side recomputation as the online-payment flow — a COD
    // order with tampered prices is just as real a loss as a tampered
    // online payment, it just shows up at the doorstep instead.
    const totals = await calculateOrderTotals(items, couponCode);

    const order = await Order.create({
      user: userId,
      items: totals.items,
      shippingAddress: address._id,
      totalItems: totals.totalItems,
      totalAmount: totals.totalAmount,
      couponCode: totals.couponCode,
      discountAmount: totals.discount,
      paymentMethod: "COD",
      paymentStatus: "pending",
      orderStatus: "pending",
    });

    // Decrease stock for each item
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity },
      });
    }

    // Send confirmation + admin alert emails (non-blocking)
    sendOrderEmails(order);

    return res.status(201).json({
      success: true,
      message: "COD order placed successfully",
      order,
    });
  } catch (error: any) {
    return res.status(400).json({
      message: error.message,
    });
  }
};
