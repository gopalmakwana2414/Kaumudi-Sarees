"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Heart, ShoppingCart, Zap, Star, Package, CheckCircle } from "lucide-react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";

import { Product } from "@/types/product";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { useAuthStore } from "@/store/authStore";
import api from "@/lib/api";

export default function ProductInfo({ product }: { product: Product }) {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);

  const addToCart = useCartStore((state) => state.addToCart);
  const { items: wishlistItems, toggleWishlist } = useWishlistStore();
  const isWishlisted = wishlistItems.includes(product._id);

  const [reviewText, setReviewText] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [submittingReview, setSubmittingReview] = useState(false);

  const discount = Math.round(
    ((product.originalPrice - product.salePrice) / product.originalPrice) * 100
  );

  const { data: reviews = [], refetch: refetchReviews } = useQuery({
    queryKey: ["reviews", product._id],
    queryFn: async () => {
      const res = await api.get(`/reviews/product/${product._id}`);
      return res.data;
    },
  });

  const handleAddToCart = () => {
    addToCart(product);
    toast.success(`${product.name} added to cart!`);
  };

  const handleBuyNow = () => {
    addToCart(product);
    router.push("/checkout");
  };

  const handleSubmitReview = async () => {
    if (!user) {
      toast.error("Please login to submit a review");
      router.push("/login");
      return;
    }
    if (!reviewText.trim()) {
      toast.error("Please write a review");
      return;
    }
    setSubmittingReview(true);
    try {
      await api.post(`/reviews/product/${product._id}`, {
        rating: reviewRating,
        comment: reviewText.trim(),
      });
      toast.success("Review submitted!");
      setReviewText("");
      setReviewRating(5);
      refetchReviews();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Could not submit review");
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div>
      {/* Category */}
      {product.category && (
        <p className="text-sm text-[#b8860b] font-medium uppercase tracking-widest mb-3">
          {product.category.name}
        </p>
      )}

      {/* Name */}
      <h1 className="text-3xl lg:text-4xl font-bold leading-tight">{product.name}</h1>

      {/* Rating Row */}
      <div className="flex items-center gap-3 mt-3">
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((s) => (
            <Star
              key={s}
              size={16}
              className={
                s <= Math.round(product.averageRating)
                  ? "fill-[#d4af37] text-[#d4af37]"
                  : "text-gray-300"
              }
            />
          ))}
        </div>
        <span className="text-sm text-gray-500">
          {product.averageRating > 0
            ? `${product.averageRating.toFixed(1)} (${product.numReviews} reviews)`
            : "No reviews yet"}
        </span>
      </div>

      {/* Short Description */}
      <p className="mt-4 text-gray-500 leading-7">{product.shortDescription}</p>

      {/* Price */}
      <div className="mt-6 flex items-end gap-4">
        <span className="text-4xl font-bold text-[#b8860b]">
          ₹{product.salePrice.toLocaleString()}
        </span>
        {discount > 0 && (
          <>
            <span className="text-xl text-gray-400 line-through">
              ₹{product.originalPrice.toLocaleString()}
            </span>
            <span className="bg-red-100 text-red-600 text-sm font-semibold px-2 py-0.5 rounded-lg">
              {discount}% OFF
            </span>
          </>
        )}
      </div>

      {/* Product Details */}
      <motion.div
        variants={{
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
        }}
        initial="hidden"
        animate="visible"
        className="mt-8 grid grid-cols-2 gap-4"
      >
        {[
          { label: "Fabric", value: product.fabric },
          { label: "Color", value: product.color },
          { label: "Occasion", value: product.occasion },
          {
            label: "Blouse",
            value: product.blouseIncluded ? "Included" : "Not Included",
          },
          { label: "SKU", value: product.sku },
          {
            label: "Availability",
            value: product.stock > 0 ? `In Stock (${product.stock})` : "Out of Stock",
          },
        ]
          .filter((d) => d.value)
          .map((detail) => (
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 10 },
                visible: { opacity: 1, y: 0, transition: { ease: "easeOut" } }
              }}
              whileHover={{ y: -2 }}
              key={detail.label}
              className="bg-gray-50 border border-gray-100/50 rounded-xl p-3 hover:shadow-sm transition-shadow duration-300"
            >
              <p className="text-xs text-gray-400 mb-0.5">{detail.label}</p>
              <p className="font-medium text-sm text-gray-700">{detail.value}</p>
            </motion.div>
          ))}
      </motion.div>

      {/* Stock Status */}
      <div className="mt-5 flex items-center gap-2">
        {product.stock > 0 ? (
          <>
            <CheckCircle size={16} className="text-green-500" />
            <span className="text-green-600 text-sm font-medium">In Stock — Ships in 3-5 days</span>
          </>
        ) : (
          <>
            <Package size={16} className="text-red-400" />
            <span className="text-red-500 text-sm font-medium">Out of Stock</span>
          </>
        )}
      </div>

      {/* Action Buttons */}
      <div className="mt-8 flex gap-3">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleAddToCart}
          disabled={product.stock === 0}
          className="flex-1 flex items-center justify-center gap-2 bg-[#d4af37] text-white py-4 rounded-2xl font-semibold hover:bg-[#b8860b] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          <ShoppingCart size={20} />
          Add to Cart
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleBuyNow}
          disabled={product.stock === 0}
          className="flex-1 flex items-center justify-center gap-2 bg-[#111] text-white py-4 rounded-2xl font-semibold hover:bg-[#333] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          <Zap size={20} />
          Buy Now
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => {
            toggleWishlist(product._id);
            toast.success(
              isWishlisted ? "Removed from wishlist" : "Added to wishlist!"
            );
          }}
          className={`border-2 px-4 rounded-2xl transition-colors duration-200 cursor-pointer ${
            isWishlisted
              ? "border-red-400 text-red-500 bg-red-50"
              : "border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-400"
          }`}
        >
          <Heart
            size={20}
            className="transition-transform duration-300"
            fill={isWishlisted ? "currentColor" : "none"}
          />
        </motion.button>
      </div>

      {/* Guarantees */}
      <div className="mt-6 flex flex-wrap gap-3">
        {["Free Returns", "Authentic Handwoven", "Secure Payment"].map((tag) => (
          <span
            key={tag}
            className="bg-[#fff8e7] border border-[#f0d060] text-[#b8860b] text-xs px-3 py-1.5 rounded-full font-medium"
          >
            ✓ {tag}
          </span>
        ))}
      </div>

      {/* Full Description */}
      {product.description && (
        <div className="mt-10 border-t pt-8">
          <h3 className="text-lg font-semibold mb-4">Product Description</h3>
          <p className="text-gray-600 leading-8 whitespace-pre-line">
            {product.description}
          </p>
        </div>
      )}

      {/* ── REVIEWS ── */}
      <div className="mt-10 border-t pt-8">
        <h3 className="text-lg font-semibold mb-6">
          Customer Reviews ({reviews.length})
        </h3>

        {reviews.length > 0 && (
          <div className="space-y-5 mb-8">
            {reviews.map((review: any) => (
              <div key={review._id} className="bg-gray-50 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="font-semibold text-sm">{review.user?.name || "Customer"}</p>
                    <p className="text-gray-400 text-xs">
                      {new Date(review.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        size={14}
                        className={
                          s <= review.rating
                            ? "fill-[#d4af37] text-[#d4af37]"
                            : "text-gray-300"
                        }
                      />
                    ))}
                  </div>
                </div>
                <p className="text-gray-600 text-sm leading-6">{review.comment}</p>
              </div>
            ))}
          </div>
        )}

        {/* Write Review */}
        <div className="bg-[#fff8e7] border border-[#f0d060] rounded-2xl p-5">
          <h4 className="font-semibold mb-4">Write a Review</h4>

          {!user ? (
            <p className="text-sm text-gray-500">
              <Link href="/login" className="text-[#b8860b] underline">
                Login
              </Link>{" "}
              to write a review.
            </p>
          ) : (
            <>
              <div className="flex items-center gap-1 mb-4">
                <span className="text-sm text-gray-500 mr-2">Your rating:</span>
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    onClick={() => setReviewRating(s)}
                    className="transition"
                  >
                    <Star
                      size={22}
                      className={
                        s <= reviewRating
                          ? "fill-[#d4af37] text-[#d4af37]"
                          : "text-gray-300 hover:text-[#d4af37]"
                      }
                    />
                  </button>
                ))}
              </div>

              <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                rows={3}
                placeholder="Share your experience with this saree..."
                className="w-full border bg-white p-3 rounded-xl text-sm outline-none focus:border-[#d4af37] resize-none"
              />

              <button
                onClick={handleSubmitReview}
                disabled={submittingReview}
                className="mt-3 bg-[#d4af37] text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-[#b8860b] transition disabled:opacity-60"
              >
                {submittingReview ? "Submitting..." : "Submit Review"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
