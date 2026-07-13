import { Request, Response } from "express";
import crypto from "crypto";
import mongoose from "mongoose";
import { env } from "../config/env.js";
import { Order } from "../models/Order.js";
import { Coupon } from "../models/Coupon.js";
import { Cart } from "../models/Cart.js";
import { Product } from "../models/Product.js";
import { acquireLock, releaseLock } from "../services/lockService.js";
import { enqueueJob, JOB_INVOICE_AND_EMAIL } from "../services/queueService.js";
import logger from "../utils/logger.js";
import { razorpay } from "../services/razorpayService.js";
import { timingSafeEqual } from "../utils/cryptoUtils.js";
import { runTransactionWithRetry } from "../utils/dbUtils.js";


export const handleWebhook = async (req: Request, res: Response) => {
  logger.info("webhookController: Received Razorpay webhook request");
  
  const signature = req.headers["x-razorpay-signature"] as string;
  if (!signature) {
    logger.warn("Webhook request missing x-razorpay-signature header");
    return res.status(400).json({ message: "Signature missing" });
  }

  // Get raw body buffer
  const rawBody = (req as any).rawBody;
  if (!rawBody) {
    logger.error("Raw body buffer not found in request (ensure body parser verify option is working)");
    return res.status(400).json({ message: "Raw body buffer missing" });
  }

  // Verify signature using timing-safe comparison
  const expectedSignature = crypto
    .createHmac("sha256", env.RAZORPAY_WEBHOOK_SECRET)
    .update(rawBody)
    .digest("hex");

  if (!timingSafeEqual(expectedSignature, signature)) {
    logger.warn("Webhook signature validation failed");
    return res.status(400).json({ message: "Invalid signature" });
  }

  const event = req.body.event;
  const payload = req.body.payload;

  logger.info(`Webhook event verified: ${event}`);

  try {
    switch (event) {
      case "payment.captured":
      case "order.paid": {
        const paymentEntity = payload.payment.entity;
        const razorpayOrderId = paymentEntity.order_id;
        const razorpayPaymentId = paymentEntity.id;

        if (!razorpayOrderId) {
          logger.warn(`Webhook received captured payment ${razorpayPaymentId} without order_id`);
          return res.status(200).json({ success: true, message: "No order ID associated, ignoring." });
        }

        // Acquire lock
        const lockAcquired = await acquireLock(razorpayOrderId, 30000);
        if (!lockAcquired) {
          logger.warn(`Lock busy for webhook processing of Order ${razorpayOrderId}. Skipping (verify endpoint or another webhook is processing it).`);
          return res.status(200).json({ success: true, message: "Processing in progress" });
        }

        try {
          const order = await Order.findOne({ razorpayOrderId });
          if (!order) {
            logger.warn(`Order not found for Razorpay Order ID ${razorpayOrderId} in webhook`);
            break;
          }

          if (order.paymentStatus === "paid") {
            logger.info(`Webhook: Order ${order._id} is already settled. Skipping.`);
            break;
          }

          // Double check actual payment details from Razorpay to prevent tampering
          const paymentDetails = await razorpay.payments.fetch(razorpayPaymentId);
          if (
            paymentDetails.order_id !== razorpayOrderId ||
            Math.round(Number(paymentDetails.amount) / 100) !== Math.round(order.totalAmount) ||
            paymentDetails.currency !== "INR" ||
            !(paymentDetails.status === "captured" || paymentDetails.status === "authorized")
          ) {
            logger.error(`Webhook: Payment validation failed for order ${order._id} against Razorpay records. amount=${paymentDetails.amount}, currency=${paymentDetails.currency}, status=${paymentDetails.status}`);
            break;
          }

          // Run Transaction with automatic retries to settle order
          try {
            const updatedOrder = await runTransactionWithRetry(async (session) => {
              const sessionOrder = await Order.findById(order._id).session(session);
              if (!sessionOrder) throw new Error("Order not found inside session");

              if (sessionOrder.paymentStatus === "paid") {
                return sessionOrder;
              }

              // If order was cancelled (e.g. stock reservation expired), we try to re-reserve stock
              if (sessionOrder.orderStatus === "cancelled" || sessionOrder.paymentStatus === "failed") {
                logger.warn(`Webhook: Order ${sessionOrder._id} was cancelled, attempting to re-reserve stock during settlement.`);
                const ProductModel = mongoose.model("Product");
                for (const item of sessionOrder.items) {
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
              if (sessionOrder.couponCode) {
                const coupon = await Coupon.findOne({
                  code: sessionOrder.couponCode,
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

              sessionOrder.paymentStatus = "paid";
              sessionOrder.orderStatus = "confirmed";
              sessionOrder.paymentId = razorpayPaymentId;
              await sessionOrder.save({ session });

              const cart = await Cart.findOne({ user: sessionOrder.user }).session(session);
              if (cart) {
                cart.items = [];
                cart.totalItems = 0;
                cart.totalAmount = 0;
                await cart.save({ session });
              }

              return sessionOrder;
            });

            logger.info(`Webhook: Settled payment for Order ${updatedOrder._id}`);

            // Enqueue Invoice & Email jobs
            await enqueueJob(JOB_INVOICE_AND_EMAIL, updatedOrder._id.toString());
          } catch (err: any) {
            if (err.message === "INSUFFICIENT_STOCK_FOR_RE_RESERVATION") {
              try {
                await Order.updateOne(
                  { razorpayOrderId: razorpayOrderId },
                  {
                    paymentStatus: "failed",
                    orderStatus: "cancelled",
                    paymentId: razorpayPaymentId,
                  }
                );
              } catch (dbErr: any) {
                logger.error(`Failed to update cancelled order status outside transaction in webhook: ${dbErr.message}`);
              }
              logger.error(`🚨 Webhook Stock Exhausted: Razorpay Order ${razorpayOrderId} was paid, but stock could not be re-reserved (insufficient inventory). Order remains cancelled.`);
            } else {
              throw err;
            }
          }
        } finally {
          await releaseLock(razorpayOrderId);
        }
        break;
      }

      case "payment.failed": {
        const paymentEntity = payload.payment.entity;
        const razorpayOrderId = paymentEntity.order_id;
        const razorpayPaymentId = paymentEntity.id;

        if (!razorpayOrderId) break;

        const lockAcquired = await acquireLock(razorpayOrderId, 30000);
        if (!lockAcquired) break;

        try {
          const order = await Order.findOne({ razorpayOrderId });
          if (!order) break;

          if (order.paymentStatus !== "pending") {
            logger.info(`Webhook: Payment failed event received, but order ${order._id} status is ${order.paymentStatus}. Ignoring.`);
            break;
          }

          // Order is pending: mark failed/cancelled and restore stock atomically!
          // Run Transaction with automatic retries for payment failure settlement
          try {
            await runTransactionWithRetry(async (session) => {
              const sessionOrder = await Order.findById(order._id).session(session);
              if (!sessionOrder) throw new Error("Order not found inside session");

              if (sessionOrder.paymentStatus !== "pending") {
                return;
              }

              logger.info(`Webhook: Processing payment failure for order ${sessionOrder._id}. Restoring stock.`);
              for (const item of sessionOrder.items) {
                await Product.findByIdAndUpdate(
                  item.product,
                  { $inc: { stock: item.quantity } },
                  { session }
                );
              }

              sessionOrder.paymentStatus = "failed";
              sessionOrder.orderStatus = "cancelled";
              sessionOrder.paymentId = razorpayPaymentId;
              await sessionOrder.save({ session });
            });

            logger.info(`Webhook: Order ${order._id} failed & stock restored successfully.`);
          } catch (err: any) {
            throw err;
          }
        } finally {
          await releaseLock(razorpayOrderId);
        }
        break;
      }

      case "refund.processed": {
        const refundEntity = payload.refund.entity;
        const paymentId = refundEntity.payment_id;

        // Find the order by paymentId
        const order = await Order.findOne({ paymentId });
        if (!order) {
          logger.warn(`Webhook: Order with payment ID ${paymentId} not found for refund`);
          break;
        }

        if (order.paymentStatus === "refunded") {
          logger.info(`Webhook: Order ${order._id} already marked refunded.`);
          break;
        }

        order.paymentStatus = "refunded";
        order.orderStatus = "cancelled";
        await order.save();
        logger.info(`Webhook: Order ${order._id} marked as refunded.`);
        break;
      }

      case "refund.failed": {
        const refundEntity = payload.refund?.entity;
        const paymentId = refundEntity?.payment_id;
        logger.error(`🚨 Webhook: Refund failed for payment ID ${paymentId}. Refund ID: ${refundEntity?.id}`);
        break;
      }

      case "payment.disputed":
      case "payment.dispute.created": {
        const disputeEntity = payload.dispute?.entity || payload.payment?.entity;
        const paymentId = disputeEntity?.payment_id || disputeEntity?.id;
        logger.warn(`⚠️ Webhook: Payment dispute raised for payment ID ${paymentId}. Reason: ${payload.dispute?.entity?.reason}`);
        
        const order = await Order.findOne({ paymentId });
        if (!order) {
          logger.warn(`Webhook: Order with payment ID ${paymentId} not found for dispute`);
          break;
        }
        order.paymentStatus = "disputed";
        await order.save();
        logger.info(`Webhook: Order ${order._id} marked as disputed`);
        break;
      }

      case "payment.dispute.won": {
        const disputeEntity = payload.dispute?.entity;
        const paymentId = disputeEntity?.payment_id;
        logger.info(`🎉 Webhook: Dispute won for payment ID ${paymentId}`);
        
        const order = await Order.findOne({ paymentId });
        if (!order) {
          logger.warn(`Webhook: Order with payment ID ${paymentId} not found for dispute.won`);
          break;
        }
        order.paymentStatus = "paid";
        await order.save();
        logger.info(`Webhook: Order ${order._id} paymentStatus restored to paid`);
        break;
      }

      case "payment.dispute.lost": {
        const disputeEntity = payload.dispute?.entity;
        const paymentId = disputeEntity?.payment_id;
        logger.error(`🚨 Webhook: Dispute lost for payment ID ${paymentId}. Cancelling and refunding order.`);
        
        const order = await Order.findOne({ paymentId });
        if (!order) {
          logger.warn(`Webhook: Order with payment ID ${paymentId} not found for dispute.lost`);
          break;
        }
        order.paymentStatus = "refunded";
        order.orderStatus = "cancelled";
        await order.save();
        logger.info(`Webhook: Order ${order._id} cancelled and marked refunded`);
        break;
      }

      case "payment.authorized":
        logger.info(`Webhook: Payment authorized for ${payload.payment.entity.id}`);
        break;

      default:
        logger.info(`Webhook: Unhandled event ${event}`);
    }

    return res.status(200).json({ success: true });
  } catch (error: any) {
    logger.error(`Error processing webhook event ${event}: ${error.message}`);
    return res.status(500).json({ message: "Internal server error during webhook processing" });
  }
};
