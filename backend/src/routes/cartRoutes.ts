import express from "express";

import { protect } from "../middlewares/auth.js";

import {
  addToCart,
  getCart,
  updateCartItem,
  removeCartItem,
  clearCart,
  mergeCart,
} from "../controllers/cartController.js";

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

router.patch(
  "/update-quantity",
  protect,
  updateCartItem
);

router.patch(
  "/:productId",
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

router.post(
  "/merge",
  protect,
  mergeCart
);

export default router;