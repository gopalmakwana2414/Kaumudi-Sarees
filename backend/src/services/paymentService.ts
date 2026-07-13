import mongoose from "mongoose";
import { Product } from "../models/Product.js";
import { Coupon } from "../models/Coupon.js";
import { Order, IOrder } from "../models/Order.js";
import { Address } from "../models/Address.js";
import { Cart } from "../models/Cart.js";
import logger from "../utils/logger.js";

const FREE_SHIPPING_THRESHOLD = 999;
const SHIPPING_FEE = 99;

export interface CartItemInput {
  product: string;
  quantity: number;
}

export interface CalculatedTotals {
  items: { product: string; quantity: number; price: number }[];
  totalItems: number;
  subtotal: number;
  shipping: number;
  discount: number;
  couponCode: string;
  totalAmount: number;
}

/**
 * Calculates authoritative totals for the checkout items.
 * Validates stock, product active status, and coupon restrictions.
 */
export const calculateOrderTotals = async (
  items: CartItemInput[],
  couponCode?: string,
  ignoreStockCheck: boolean = false,
  session?: mongoose.ClientSession
): Promise<CalculatedTotals> => {
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

    const product = await Product.findById(productId).session(session || null);

    if (!product || !product.isActive) {
      throw new Error(`Product ${productId} is no longer available`);
    }

    if (!ignoreStockCheck && product.stock < quantity) {
      throw new Error(`Insufficient stock for "${product.name}"`);
    }

    resolvedItems.push({
      product: product._id.toString(),
      quantity,
      price: product.salePrice, // authoritative price from the database
    });

    subtotal += product.salePrice * quantity;
    totalItems += quantity;
  }

  const shipping = subtotal > FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  let discount = 0;
  let validatedCouponCode = "";

  if (couponCode) {
    const coupon = await Coupon.findOne({
      code: String(couponCode).toUpperCase().trim(),
      isActive: true,
    }).session(session || null);

    if (!coupon) {
      throw new Error("Invalid coupon");
    }

    if (new Date() > coupon.expiresAt) {
      throw new Error("Coupon expired");
    }

    if (
      coupon.usageLimit &&
      coupon.usedCount !== undefined &&
      coupon.usedCount >= coupon.usageLimit
    ) {
      throw new Error("Coupon usage limit reached");
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

/**
 * High-performance, transactional service to create an Order.
 * Validates products, stock, coupons, address, and creates a pending/COD order.
 */
export const processOrderCreation = async (
  userId: string,
  items: CartItemInput[],
  couponCode: string | undefined,
  shippingAddress: string,
  paymentMethod: "COD" | "ONLINE",
  session: mongoose.ClientSession
): Promise<{ order: IOrder; totals: CalculatedTotals }> => {
  logger.info(`paymentService: Starting order creation inside transaction for user ${userId} (${paymentMethod})`);

  // 1. Calculate and validate totals (stock, active status, prices, coupons)
  const totals = await calculateOrderTotals(items, couponCode, false, session);

  if (totals.totalAmount <= 0) {
    throw new Error("Invalid order amount");
  }

  // 2. Validate shipping address exists and belongs to the user
  const address = await Address.findOne({
    _id: shippingAddress,
    user: userId,
  }).session(session);

  if (!address) {
    throw new Error("Shipping address not found");
  }

  // 3. Atomically reserve/decrement stock
  for (const item of totals.items) {
    const updatedProduct = await Product.findOneAndUpdate(
      { _id: item.product, stock: { $gte: item.quantity } },
      { $inc: { stock: -item.quantity } },
      { new: true, session }
    );

    if (!updatedProduct) {
      throw new Error(`Insufficient stock for product ${item.product} during reservation`);
    }
  }

  // 4. Create the Order document
  const pendingOrders = await Order.create(
    [
      {
        user: userId,
        items: totals.items,
        shippingAddress: address._id,
        totalItems: totals.totalItems,
        totalAmount: totals.totalAmount,
        couponCode: totals.couponCode,
        discountAmount: totals.discount,
        paymentMethod,
        paymentStatus: "pending",
        orderStatus: "pending",
      },
    ],
    { session }
  );

  const orderDoc = pendingOrders[0];

  // 5. If it's a COD order, finalize coupon usage and clear the cart immediately.
  // (For ONLINE orders, coupon usage and cart clearing happen when payment is verified/settled)
  if (paymentMethod === "COD") {
    if (orderDoc.couponCode) {
      const updatedCoupon = await Coupon.findOneAndUpdate(
        { code: orderDoc.couponCode, isActive: true },
        { $inc: { usedCount: 1 } },
        { new: true, session }
      );
      if (!updatedCoupon) {
        throw new Error("Coupon could not be applied or is inactive");
      }
    }

    const cart = await Cart.findOne({ user: userId }).session(session);
    if (cart) {
      cart.items = [];
      cart.totalItems = 0;
      cart.totalAmount = 0;
      await cart.save({ session });
    }
    
    logger.info(`paymentService: COD order ${orderDoc._id} created, stock reserved, coupon used, and cart cleared.`);
  } else {
    logger.info(`paymentService: ONLINE pending order ${orderDoc._id} created and stock reserved.`);
  }

  return {
    order: orderDoc,
    totals,
  };
};
