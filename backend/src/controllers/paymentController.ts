import { Request, Response } from "express";
import crypto from "crypto";
import mongoose from "mongoose";
import { razorpay } from "../services/razorpayService.js";
import { Order } from "../models/Order.js";
import { env } from "../config/env.js";
import { acquireLock, releaseLock } from "../services/lockService.js";
import { enqueueJob, JOB_INVOICE_AND_EMAIL, JOB_RELEASE_STOCK_RESERVATION } from "../services/queueService.js";
import {
  createRazorpayOrderSchema,
  verifyPaymentSchema,
  createCODOrderSchema,
} from "../validators/paymentValidator.js";
import logger from "../utils/logger.js";
import { processOrderCreation } from "../services/paymentService.js";
import { timingSafeEqual } from "../utils/cryptoUtils.js";
import { runTransactionWithRetry } from "../utils/dbUtils.js";


export const createRazorpayOrder = async (req: Request, res: Response) => {
  logger.info("paymentController: createRazorpayOrder start");
  const validationResult = createRazorpayOrderSchema.safeParse(req.body);
  if (!validationResult.success) {
    return res.status(400).json({
      message: "Invalid request payload",
      errors: validationResult.error.format(),
    });
  }

  const userId = (req as any).user.id;
  const { items, couponCode, shippingAddress } = validationResult.data;

  // 1. Acquire distributed lock on user ID to prevent concurrent checkout requests
  const userLockKey = `checkout:user:${userId}`;
  let userLockAcquired = false;
  try {
    userLockAcquired = await acquireLock(userLockKey, 15000);
  } catch (lockErr: any) {
    logger.error(`Lock service error during checkout: ${lockErr.message}`);
    return res.status(503).json({
      message: "Checkout service temporarily unavailable. Please try again.",
    });
  }

  if (!userLockAcquired) {
    logger.warn(`User checkout lock busy: ${userLockKey}`);
    return res.status(409).json({
      message: "Another checkout request is currently in progress. Please wait a moment.",
    });
  }

  try {
    // 2. Idempotency Check: Look for an existing pending order with the exact same items, address, and coupon in the last 15 minutes
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
    const potentialExistingOrder = await Order.findOne({
      user: userId,
      paymentMethod: "ONLINE",
      paymentStatus: "pending",
      orderStatus: "pending",
      shippingAddress,
      couponCode: couponCode || "",
      createdAt: { $gte: fifteenMinutesAgo },
    });

    if (potentialExistingOrder) {
      // Compare items arrays (products and quantities)
      const itemsMatch =
        potentialExistingOrder.items.length === items.length &&
        potentialExistingOrder.items.every((existingItem) => {
          const matchingInput = items.find(
            (inputItem) => inputItem.product === existingItem.product.toString()
          );
          return matchingInput && matchingInput.quantity === existingItem.quantity;
        });

      if (itemsMatch && potentialExistingOrder.razorpayOrderId) {
        logger.info(`Idempotency: Reusing existing Razorpay Order ${potentialExistingOrder.razorpayOrderId} for user ${userId}`);
        try {
          const rzpOrder = await razorpay.orders.fetch(potentialExistingOrder.razorpayOrderId);
          return res.status(201).json({
            success: true,
            order: rzpOrder,
            breakdown: {
              items: potentialExistingOrder.items,
              totalItems: potentialExistingOrder.totalItems,
              totalAmount: potentialExistingOrder.totalAmount,
              discount: potentialExistingOrder.discountAmount,
              couponCode: potentialExistingOrder.couponCode,
            },
          });
        } catch (fetchErr: any) {
          logger.warn(`Failed to fetch existing Razorpay order ${potentialExistingOrder.razorpayOrderId}, creating a new one: ${fetchErr.message}`);
        }
      }
    }

    // 3. Create order via transactional service
    try {
      const { order, totals, razorpayOrder } = await runTransactionWithRetry(async (session) => {
        const { order: createdOrder, totals: calculatedTotals } = await processOrderCreation(
          userId,
          items,
          couponCode,
          shippingAddress,
          "ONLINE",
          session
        );

        // Create Razorpay Order
        const options = {
          amount: Math.round(calculatedTotals.totalAmount * 100), // INR → paise
          currency: "INR",
          receipt: createdOrder._id.toString(),
        };

        const rzpOrder = await razorpay.orders.create(options);

        // Save Razorpay order ID to the pending order
        createdOrder.razorpayOrderId = rzpOrder.id;
        await createdOrder.save({ session });

        return { order: createdOrder, totals: calculatedTotals, razorpayOrder: rzpOrder };
      });

      logger.info(`Payment started: Created Pending Order ${order._id} and Razorpay Order ${razorpayOrder.id}`);

      // Schedule auto-release stock reservation job (15 mins delay)
      await enqueueJob(JOB_RELEASE_STOCK_RESERVATION, order._id.toString(), 900000);

      return res.status(201).json({
        success: true,
        order: razorpayOrder,
        breakdown: totals,
      });
    } catch (error: any) {
      throw error;
    }
  } catch (error: any) {
    logger.error(`Error in createRazorpayOrder: ${error.message}`);
    return res.status(400).json({
      message: error.message || "Failed to create checkout session",
    });
  } finally {
    try {
      await releaseLock(userLockKey);
    } catch (releaseErr: any) {
      logger.error(`Failed to release checkout lock: ${releaseErr.message}`);
    }
  }
};

export const verifyPaymentAndCreateOrder = async (req: Request, res: Response) => {
  logger.info("paymentController: verifyPaymentAndCreateOrder start");
  const validationResult = verifyPaymentSchema.safeParse(req.body);
  if (!validationResult.success) {
    return res.status(400).json({
      message: "Invalid request payload",
      errors: validationResult.error.format(),
    });
  }

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = validationResult.data;
  const userId = (req as any).user.id;

  // 1. Acquire distributed lock on razorpay_order_id to prevent concurrent processing
  let lockAcquired = false;
  try {
    lockAcquired = await acquireLock(razorpay_order_id, 30000);
  } catch (lockErr: any) {
    logger.error(`Lock service error during verification: ${lockErr.message}`);
    return res.status(503).json({
      message: "Payment verification service temporarily offline. Please retry.",
    });
  }

  if (!lockAcquired) {
    logger.warn(`Duplicate request detected for Razorpay Order ${razorpay_order_id}`);
    const existingOrder = await Order.findOne({ razorpayOrderId: razorpay_order_id });
    if (existingOrder && existingOrder.paymentStatus === "paid") {
      logger.info(`Payment already verified for Razorpay Order ${razorpay_order_id} (read during lock collision). Returning success.`);
      return res.status(200).json({
        success: true,
        message: "Payment already verified",
        order: existingOrder,
      });
    }
    return res.status(409).json({
      message: "Payment is already being processed. Please wait or refresh the page.",
    });
  }

  try {
    const existingOrder = await Order.findOne({ razorpayOrderId: razorpay_order_id });

    if (!existingOrder) {
      logger.error(`Pending order not found for Razorpay Order ID: ${razorpay_order_id}`);
      return res.status(404).json({
        message: "Order context not found",
      });
    }

    // Idempotency check: if order is already paid, return it immediately
    if (existingOrder.paymentStatus === "paid") {
      logger.info(`Payment already verified for Razorpay Order ${razorpay_order_id}. Returning success.`);
      return res.status(200).json({
        success: true,
        message: "Payment already verified",
        order: existingOrder,
      });
    }

    // 2. Verify signature using timing-safe comparison
    const generatedSignature = crypto
      .createHmac("sha256", env.RAZORPAY_KEY_SECRET)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    if (!timingSafeEqual(generatedSignature, razorpay_signature)) {
      logger.warn(`Invalid signature offered for payment: ${razorpay_payment_id}`);
      return res.status(400).json({
        success: false,
        message: "Invalid payment signature",
      });
    }

    // 3. Double-check with Razorpay payment details to prevent client/parameter tampering
    if (process.env.NODE_ENV === "production" || !razorpay_payment_id.startsWith("pay_test_")) {
      const paymentDetails = await razorpay.payments.fetch(razorpay_payment_id);
      if (
        paymentDetails.order_id !== razorpay_order_id ||
        Math.round(Number(paymentDetails.amount) / 100) !== Math.round(existingOrder.totalAmount) ||
        paymentDetails.currency !== "INR" ||
        !(paymentDetails.status === "captured" || paymentDetails.status === "authorized")
      ) {
        logger.error(`Security Mismatch: Payment details mismatch for order ${existingOrder._id} (Payment: ${razorpay_payment_id})`);
        return res.status(400).json({
          message: "Payment validation failed against payment gateway records. Please contact support.",
        });
      }
    } else {
      logger.info(`Skipping Razorpay fetch for mock payment ID in development/testing: ${razorpay_payment_id}`);
    }

    // 4. Run Transaction with automatic retries for payment settlement
    try {
      const updatedOrder = await runTransactionWithRetry(async (session) => {
        const order = await Order.findById(existingOrder._id).session(session);
        if (!order) {
          throw new Error("Order not found inside transaction");
        }

        if (order.paymentStatus === "paid") {
          return order;
        }

        // If order was cancelled (e.g. stock reservation expired), we try to re-reserve stock
        if (order.orderStatus === "cancelled" || order.paymentStatus === "failed") {
          logger.warn(`Order ${order._id} was cancelled, attempting to re-reserve stock during verification.`);
          const ProductModel = mongoose.model("Product");
          for (const item of order.items) {
            const updatedProduct = await ProductModel.findOneAndUpdate(
              { _id: item.product, stock: { $gte: item.quantity } },
              { $inc: { stock: -item.quantity } },
              { new: true, session }
            );
            if (!updatedProduct) {
              throw new Error("INSUFFICIENT_STOCK_FOR_RE_RESERVATION");
            }
          }
        }

        // Revalidate coupon usageLimit before settling payment
        if (order.couponCode) {
          const CouponModel = mongoose.model("Coupon");
          const coupon = await CouponModel.findOne({
            code: order.couponCode,
          }).session(session);

          if (!coupon) {
            throw new Error("Applied coupon does not exist");
          }

          if (!coupon.isActive) {
            throw new Error("Applied coupon is no longer active");
          }

          if (new Date() > coupon.expiresAt) {
            throw new Error("Applied coupon has expired");
          }

          if (
            coupon.usageLimit &&
            coupon.usedCount !== undefined &&
            coupon.usedCount >= coupon.usageLimit
          ) {
            throw new Error("Coupon usage limit has been reached");
          }

          // Increment usedCount
          coupon.usedCount = (coupon.usedCount || 0) + 1;
          await coupon.save({ session });
        }

        // Mark order as paid
        order.paymentStatus = "paid";
        order.orderStatus = "confirmed";
        order.paymentId = razorpay_payment_id;
        await order.save({ session });

        // Clear User Cart
        const cart = await mongoose.model("Cart").findOne({ user: userId }).session(session);
        if (cart) {
          cart.items = [];
          cart.totalItems = 0;
          cart.totalAmount = 0;
          await cart.save({ session });
        }

        return order;
      });

      logger.info(`Payment verified successfully for Order ${updatedOrder._id}`);

      // Enqueue Invoice & Email jobs to background processing
      await enqueueJob(JOB_INVOICE_AND_EMAIL, updatedOrder._id.toString());

      return res.status(200).json({
        success: true,
        message: "Payment verified & order confirmed",
        order: updatedOrder,
      });
    } catch (err: any) {
      throw err;
    }
  } catch (error: any) {
    if (error.message === "INSUFFICIENT_STOCK_FOR_RE_RESERVATION") {
      try {
        await Order.updateOne(
          { razorpayOrderId: razorpay_order_id },
          {
            paymentStatus: "failed",
            orderStatus: "cancelled",
            paymentId: razorpay_payment_id,
          }
        );
      } catch (dbErr: any) {
        logger.error(`Failed to update cancelled order status outside transaction: ${dbErr.message}`);
      }
      logger.error(`🚨 Verification Mismatch: Razorpay Order ${razorpay_order_id} was paid, but stock could not be re-reserved (insufficient inventory). Order remains cancelled.`);
      return res.status(400).json({
        success: false,
        message: "This order has expired and its items are now out of stock. Please contact support with payment ID for a manual refund.",
      });
    }
    logger.error(`Error in verifyPaymentAndCreateOrder: ${error.message}`);
    return res.status(500).json({
      message: error.message || "Internal server error during verification",
    });
  } finally {
    try {
      await releaseLock(razorpay_order_id);
    } catch (releaseErr: any) {
      logger.error(`Failed to release verification lock: ${releaseErr.message}`);
    }
  }
};

export const createCODOrder = async (req: Request, res: Response) => {
  logger.info("paymentController: createCODOrder start");
  const validationResult = createCODOrderSchema.safeParse(req.body);
  if (!validationResult.success) {
    return res.status(400).json({
      message: "Invalid request payload",
      errors: validationResult.error.format(),
    });
  }

  const userId = (req as any).user.id;
  const { items, couponCode, shippingAddress } = validationResult.data;

  // 1. Acquire distributed lock on user ID to prevent concurrent checkout requests
  const userLockKey = `checkout:user:${userId}`;
  let userLockAcquired = false;
  try {
    userLockAcquired = await acquireLock(userLockKey, 15000);
  } catch (lockErr: any) {
    logger.error(`Lock service error during COD order creation: ${lockErr.message}`);
    return res.status(503).json({
      message: "Checkout service temporarily offline. Please try again.",
    });
  }

  if (!userLockAcquired) {
    logger.warn(`User checkout lock busy: ${userLockKey}`);
    return res.status(409).json({
      message: "Another checkout request is currently in progress. Please wait a moment.",
    });
  }

    try {
      const { order } = await runTransactionWithRetry(async (session) => {
        return await processOrderCreation(
          userId,
          items,
          couponCode,
          shippingAddress,
          "COD",
          session
        );
      });

      logger.info(`COD Order created successfully: ${order._id}`);

      // Enqueue Invoice & Email jobs
      await enqueueJob(JOB_INVOICE_AND_EMAIL, order._id.toString());

      return res.status(201).json({
        success: true,
        message: "COD order placed successfully",
        order,
      });
    } catch (error: any) {
      logger.error(`Error in createCODOrder: ${error.message}`);
      return res.status(400).json({
        message: error.message || "Failed to place COD order",
      });
    } finally {
    try {
      await releaseLock(userLockKey);
    } catch (releaseErr: any) {
      logger.error(`Failed to release checkout lock: ${releaseErr.message}`);
    }
  }
};
