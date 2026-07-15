import express from "express";

import { protect } from "../middlewares/auth.js";
import { customerOnly } from "../middlewares/customer.js";
import { adminOnly } from "../middlewares/admin.js";

import {
  createReview,
  getProductReviews,
  deleteReview,
  toggleShowOnHomepage,
  getHomepageReviews,
} from "../controllers/reviewController.js";

const router = express.Router();

// GET HOMEPAGE REVIEWS (public, defined before param routes)
router.get("/homepage", getHomepageReviews);

// GET ALL REVIEWS OF PRODUCT (public)
router.get("/product/:productId", getProductReviews);

// ADD REVIEW (must be logged in)
router.post("/product/:productId", protect, customerOnly, createReview);

// TOGGLE SHOW ON HOMEPAGE (admin only)
router.patch("/:reviewId/homepage", protect, adminOnly, toggleShowOnHomepage);

// DELETE REVIEW (owner or admin)
router.delete("/:reviewId", protect, deleteReview);

export default router;
