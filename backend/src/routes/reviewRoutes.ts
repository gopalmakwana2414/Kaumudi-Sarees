import express from "express";

import { protect } from "../middlewares/auth";

import {
  createReview,
  getProductReviews,
  deleteReview,
} from "../controllers/reviewController";

const router = express.Router();

// GET ALL REVIEWS OF PRODUCT (public)
router.get("/product/:productId", getProductReviews);

// ADD REVIEW (must be logged in)
router.post("/product/:productId", protect, createReview);

// DELETE REVIEW (owner or admin)
router.delete("/:reviewId", protect, deleteReview);

export default router;
