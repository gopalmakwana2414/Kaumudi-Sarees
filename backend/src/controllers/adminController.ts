import { Request, Response } from "express";
import { Order } from "../models/Order";
import { User } from "../models/User";
import { Product } from "../models/Product";
import { sendOrderStatusEmail } from "../services/emailService";
import { runTransactionWithRetry } from "../utils/dbUtils";

// get all orders
export const getAllOrders = async (req: Request, res: Response) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Number(req.query.limit) || 20, 100);

    const [orders, totalOrders] = await Promise.all([
      Order.find()
        .populate("user", "name email")
        .populate("shippingAddress")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Order.countDocuments(),
    ]);

    return res.status(200).json({
      orders,
      currentPage: page,
      totalPages: Math.max(1, Math.ceil(totalOrders / limit)),
      totalOrders,
    });
  } catch (error: any) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

// get order by id
export const getOrderByIdAdmin = async (req: Request, res: Response) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("user", "name email")
      .populate("shippingAddress")
      .populate("items.product");

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    return res.status(200).json(order);
  } catch (error: any) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

// update order status
export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { status } = req.body;

    const allowedStatuses = [
      "pending",
      "confirmed",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid order status",
      });
    }

    const updatedOrder = await runTransactionWithRetry(async (session) => {
      const order = await Order.findById(req.params.id).session(session);

      if (!order) {
        throw new Error("Order not found");
      }

      // If status is being changed to cancelled, and it is not already cancelled, restore stock
      if (status === "cancelled" && order.orderStatus !== "cancelled") {
        logger.info(`Admin Order Cancellation: Restoring stock for Order ${order._id}`);
        for (const item of order.items) {
          await Product.findByIdAndUpdate(
            item.product,
            { $inc: { stock: item.quantity } },
            { session }
          );
        }
      }

      order.orderStatus = status;
      await order.save({ session });
      return order;
    });

    // Notify customer via email (non-blocking)
    User.findById(updatedOrder.user)
      .then((user) => {
        if (user) {
          sendOrderStatusEmail({
            to: user.email,
            customerName: user.name,
            orderId: updatedOrder._id.toString(),
            status,
          }).catch((err) =>
            console.error("Status email failed:", err.message)
          );
        }
      })
      .catch(() => {});

    return res.status(200).json({
      success: true,
      message: "Order status updated",
      order: updatedOrder,
    });
  } catch (error: any) {
    if (error.message === "Order not found") {
      return res.status(404).json({ message: "Order not found" });
    }
    return res.status(500).json({
      message: error.message,
    });
  }
};

// get all customers (users)
export const getAllCustomers = async (req: Request, res: Response) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Number(req.query.limit) || 20, 100);

    const [users, totalUsers] = await Promise.all([
      User.find()
        .select("-password")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      User.countDocuments(),
    ]);

    return res.status(200).json({
      users,
      currentPage: page,
      totalPages: Math.max(1, Math.ceil(totalUsers / limit)),
      totalUsers,
    });
  } catch (error: any) {
    return res.status(500).json({
      message: error.message,
    });
  }
};
