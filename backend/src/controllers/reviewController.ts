import { Response } from "express";
import { AuthRequest } from "../middlewares/auth";

import { Review } from "../models/Review";
import { Product } from "../models/Product";



// ==========================
// CREATE REVIEW
// ==========================
export const createReview = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { productId } = req.params;

    const { rating, comment } = req.body;

    const existingReview = await Review.findOne({
      user: req.user!._id,
      product: productId,
    });

    if (existingReview) {
      return res.status(400).json({
        message: "You have already reviewed this product",
      });
    }

    const review = await Review.create({
      user: req.user!._id,
      product: productId,
      rating,
      comment,
    });

    await updateProductRatings(productId);

    const populated = await Review.findById(review._id).populate("user", "name");

    return res.status(201).json(populated);
  } catch (error: any) {
    return res.status(500).json({
      message: error.message,
    });
  }
};



// ==========================
// GET PRODUCT REVIEWS
// ==========================
export const getProductReviews = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const reviews = await Review.find({
      product: req.params.productId,
    })
      .populate("user", "name")
      .sort({ createdAt: -1 });

    return res.status(200).json(reviews);
  } catch (error: any) {
    return res.status(500).json({
      message: error.message,
    });
  }
};



// ==========================
// DELETE REVIEW (User or Admin)
// ==========================
export const deleteReview = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const review = await Review.findById(req.params.reviewId);

    if (!review) {
      return res.status(404).json({
        message: "Review not found",
      });
    }

    // Allow admin OR the review owner to delete
    const isOwner = review.user.toString() === req.user!._id.toString();
    const isAdmin = req.user!.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        message: "Unauthorized",
      });
    }

    const productId = review.product.toString();

    await review.deleteOne();

    await updateProductRatings(productId);

    return res.status(200).json({
      success: true,
      message: "Review deleted",
    });
  } catch (error: any) {
    return res.status(500).json({
      message: error.message,
    });
  }
};



// ==========================
// UPDATE PRODUCT RATING
// ==========================
const updateProductRatings = async (productId: string) => {
  const reviews = await Review.find({
    product: productId,
  });

  const numReviews = reviews.length;

  const averageRating =
    numReviews === 0
      ? 0
      : reviews.reduce((acc, item) => acc + item.rating, 0) / numReviews;

  await Product.findByIdAndUpdate(productId, {
    averageRating: Math.round(averageRating * 10) / 10,
    numReviews,
  });
};
