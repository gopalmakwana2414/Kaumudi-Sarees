import { Request, Response } from "express";

import { User } from "../models/User";
import { Product } from "../models/Product";
import { Order } from "../models/Order";

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const totalUsers = await User.countDocuments();

    const totalProducts = await Product.countDocuments();

    const totalOrders = await Order.countDocuments();

    // Only count revenue from orders that are actually paid or confirmed —
    // a pending/unpaid order shouldn't inflate revenue figures.
    const revenueResult = await Order.aggregate([
      {
        $match: {
          $or: [
            { paymentStatus: "paid" },
            { orderStatus: { $in: ["confirmed", "processing", "shipped", "delivered"] } },
          ],
        },
      },
      {
        $group: {
          _id: null,
          revenue: { $sum: "$totalAmount" },
        },
      },
    ]);

    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].revenue : 0;

    const recentOrders = await Order.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .limit(5);

    // Low stock alert (≤10 units) and out-of-stock products
    const lowStockProducts = await Product.find({
      stock: { $gt: 0, $lte: 10 },
      isActive: true,
    })
      .select("name sku stock thumbnail")
      .sort({ stock: 1 })
      .limit(10);

    const outOfStockCount = await Product.countDocuments({
      stock: 0,
      isActive: true,
    });

    const pendingOrdersCount = await Order.countDocuments({
      orderStatus: "pending",
    });

    return res.status(200).json({
      totalUsers,
      totalProducts,
      totalOrders,
      totalRevenue,
      recentOrders,
      lowStockProducts,
      outOfStockCount,
      pendingOrdersCount,
    });
  } catch (error: any) {
    return res.status(500).json({
      message: error.message,
    });
  }
};
