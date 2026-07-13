import { Request, Response } from "express";
import mongoose from "mongoose";
import { Cart } from "../models/Cart.js";
import { Product } from "../models/Product.js";
import logger from "../utils/logger.js";

const isMatch = (itemProduct: any, targetId: string) => {
  if (!itemProduct) return false;
  const idStr = typeof itemProduct === "object" && itemProduct._id 
    ? itemProduct._id.toString() 
    : itemProduct.toString();
  return idStr === targetId;
};

const calculateCartTotals = (cart: any) => {
  cart.totalItems = cart.items.reduce(
    (acc: number, item: any) => acc + item.quantity,
    0
  );

  cart.totalAmount = cart.items.reduce(
    (acc: number, item: any) =>
      acc + item.quantity * item.price,
    0
  );
};

export const addToCart = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = (req as any).user.id;

    const { productId, quantity } = req.body;

    if (!productId) {
      return res.status(400).json({
        message: "Product ID is required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        message: "Invalid product ID format",
      });
    }

    if (
      typeof quantity !== "number" ||
      !Number.isInteger(quantity) ||
      quantity < 1 ||
      quantity > 10000
    ) {
      return res.status(400).json({
        message: "Quantity must be a positive integer between 1 and 10000",
      });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    let cart = await Cart.findOne({
      user: userId,
    });

    if (!cart) {
      cart = await Cart.create({
        user: userId,
        items: [],
      });
    }

    const existingItem = cart.items.find(
      (item) => isMatch(item.product, productId)
    );

    const newQuantity = existingItem
      ? existingItem.quantity + quantity
      : quantity;

    if (newQuantity > product.stock) {
      return res.status(400).json({
        message: `Only ${product.stock} unit(s) of "${product.name}" left in stock`,
      });
    }

    if (existingItem) {
      existingItem.quantity = newQuantity;
    } else {
      cart.items.push({
        product: product._id,
        quantity,
        price: product.salePrice,
      });
    }

    calculateCartTotals(cart);

    await cart.save();
    await cart.populate("items.product");

    return res.status(200).json(cart);
  } catch (error: any) {
    logger.error("Error in addToCart: " + error.message, error);
    return res.status(500).json({
      message: error.message,
    });
  }
};

export const getCart = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = (req as any).user.id;

    const cart = await Cart.findOne({
      user: userId,
    })
      .populate("items.product")
      .lean();

    if (!cart) {
      return res.status(200).json({
        items: [],
        totalItems: 0,
        totalAmount: 0,
      });
    }

    return res.status(200).json(cart);
  } catch (error: any) {
    logger.error("Error in getCart: " + error.message, error);
    return res.status(500).json({
      message: error.message,
    });
  }
};

export const updateCartItem = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = (req as any).user.id;

    const { quantity } = req.body;
    const productId = req.params.productId || req.params.itemId || req.body.productId;

    if (!productId) {
      return res.status(400).json({
        message: "Product ID is required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        message: "Invalid product ID format",
      });
    }

    if (
      typeof quantity !== "number" ||
      !Number.isInteger(quantity) ||
      quantity < 1 ||
      quantity > 10000
    ) {
      return res.status(400).json({
        message: "Quantity must be a positive integer between 1 and 10000",
      });
    }

    const cart = await Cart.findOne({
      user: userId,
    });

    if (!cart) {
      return res.status(404).json({
        message: "Cart not found",
      });
    }

    const item = cart.items.find(
      (item) => isMatch(item.product, productId)
    );

    if (!item) {
      return res.status(404).json({
        message: "Item not found in cart",
      });
    }

    const product = await Product.findById(productId).select("stock name");

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    if (quantity > product.stock) {
      return res.status(400).json({
        message: `Only ${product.stock} unit(s) of "${product.name}" left in stock`,
      });
    }

    item.quantity = quantity;

    calculateCartTotals(cart);

    await cart.save();
    await cart.populate("items.product");

    return res.status(200).json(cart);
  } catch (error: any) {
    logger.error("Error in updateCartItem: " + error.message, error);
    return res.status(500).json({
      message: error.message,
    });
  }
};

export const removeCartItem = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = (req as any).user.id;

    const productId = req.params.productId || req.params.itemId;

    if (!productId) {
      return res.status(400).json({
        message: "Product ID is required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        message: "Invalid product ID format",
      });
    }

    const cart = await Cart.findOne({
      user: userId,
    });

    if (!cart) {
      return res.status(404).json({
        message: "Cart not found",
      });
    }

    cart.items = cart.items.filter(
      (item) => !isMatch(item.product, productId)
    );

    calculateCartTotals(cart);

    await cart.save();
    await cart.populate("items.product");

    return res.status(200).json({
      message: "Item removed successfully",
      cart,
    });
  } catch (error: any) {
    logger.error("Error in removeCartItem: " + error.message, error);
    return res.status(500).json({
      message: error.message,
    });
  }
};

export const clearCart = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = (req as any).user.id;

    const cart = await Cart.findOne({
      user: userId,
    });

    if (!cart) {
      return res.status(404).json({
        message: "Cart not found",
      });
    }

    cart.items = [];
    cart.totalItems = 0;
    cart.totalAmount = 0;

    await cart.save();

    return res.status(200).json({
      message: "Cart cleared successfully",
      cart,
    });
  } catch (error: any) {
    logger.error("Error in clearCart: " + error.message, error);
    return res.status(500).json({
      message: error.message,
    });
  }
};

export const mergeCart = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = (req as any).user.id;
    const { items } = req.body;

    if (!Array.isArray(items)) {
      return res.status(400).json({
        message: "Items must be an array",
      });
    }

    let cart = await Cart.findOne({
      user: userId,
    });

    if (!cart) {
      cart = await Cart.create({
        user: userId,
        items: [],
      });
    }

    for (const mergeItem of items) {
      const { productId, quantity } = mergeItem;

      if (
        !productId ||
        !mongoose.Types.ObjectId.isValid(productId) ||
        typeof quantity !== "number" ||
        !Number.isInteger(quantity) ||
        quantity < 1
      ) {
        continue;
      }

      const product = await Product.findById(productId);
      if (!product) continue;

      const existingItem = cart.items.find(
        (item) => isMatch(item.product, productId)
      );

      const currentQty = existingItem ? existingItem.quantity : 0;
      const newQuantity = currentQty + quantity;
      const cappedQuantity = Math.min(newQuantity, product.stock);

      if (cappedQuantity > 0) {
        if (existingItem) {
          existingItem.quantity = cappedQuantity;
        } else {
          cart.items.push({
            product: product._id,
            quantity: cappedQuantity,
            price: product.salePrice,
          });
        }
      }
    }

    calculateCartTotals(cart);
    await cart.save();
    await cart.populate("items.product");

    return res.status(200).json(cart);
  } catch (error: any) {
    logger.error("Error in mergeCart: " + error.message, error);
    return res.status(500).json({
      message: error.message,
    });
  }
};