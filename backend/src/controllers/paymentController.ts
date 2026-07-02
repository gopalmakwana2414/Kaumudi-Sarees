import { Request, Response } from "express";
import crypto from "crypto";
import { razorpay } from "../services/razorpayService";
import { Order } from "../models/Order";
import { Address } from "../models/Address";
import { Product } from "../models/Product";
import { User } from "../models/User";
import {
  sendOrderConfirmationEmail,
  sendAdminOrderAlert,
} from "../services/emailService";

// =====================================
// HELPER — Send order emails (non-blocking)
// =====================================
const sendOrderEmails = async (order: any) => {
  try {
    const user = await User.findById(order.user);
    const address = await Address.findById(order.shippingAddress);

    if (!user || !address) return;

    // Resolve product names for the email line items
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
export const createRazorpayOrder = async (req: Request, res: Response) => {
  try {
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        message: "Invalid amount",
      });
    }

    const options = {
      amount: Math.round(amount * 100), // INR → paise
      currency: "INR",
      receipt: `rcpt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    return res.status(200).json({
      success: true,
      order,
    });
  } catch (error: any) {
    return res.status(500).json({
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
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderData,
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        message: "Payment details missing",
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
    // CREATE ORDER IN DB (PAID ORDER)
    // =====================================
    const newOrder = await Order.create({
      ...orderData,
      paymentMethod: "ONLINE",
      paymentStatus: "paid",
      paymentId: razorpay_payment_id,
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
    const orderData = req.body;

    const order = await Order.create({
      ...orderData,
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
    return res.status(500).json({
      message: error.message,
    });
  }
};
