import express from "express";

import { protect } from "../middlewares/auth";

import {
  addToWishlist,
  getWishlist,
  removeFromWishlist,
} from "../controllers/wishlistController";

const router = express.Router();

router.post(
  "/add",
  protect,
  addToWishlist
);

router.get(
  "/",
  protect,
  getWishlist
);

router.delete(
  "/remove/:productId",
  protect,
  removeFromWishlist
);

export default router;