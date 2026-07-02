import express from "express";

import { protect } from "../middlewares/auth";

import {
  addToCart,
  getCart,
  updateCartItem,
  removeCartItem,
  clearCart,
} from "../controllers/cartController";

const router = express.Router();

router.post(
  "/add",
  protect,
  addToCart
);

router.get(
  "/",
  protect,
  getCart
);

router.put(
  "/update",
  protect,
  updateCartItem
);

router.delete(
  "/remove/:productId",
  protect,
  removeCartItem
);

router.delete(
  "/clear",
  protect,
  clearCart
);

export default router;