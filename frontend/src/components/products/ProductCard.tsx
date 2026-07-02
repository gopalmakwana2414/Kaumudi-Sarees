"use client";

import Link from "next/link";
import Image from "next/image";

import { Product } from "@/types/product";

import {
  Heart,
  ShoppingCart,
} from "lucide-react";

import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";

export default function ProductCard({
  product,
}: {
  product: Product;
}) {
  const addToCart = useCartStore(
    (state) => state.addToCart
  );

  const wishlistItems =
    useWishlistStore(
      (state) => state.items
    );

  const toggleWishlist =
    useWishlistStore(
      (state) =>
        state.toggleWishlist
    );

  const isWishlisted =
    wishlistItems.includes(
      product._id
    );

  const discount = Math.round(
    ((product.originalPrice -
      product.salePrice) /
      product.originalPrice) *
      100
  );

  return (
    <div className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100">
      {/* Product Image */}
      <Link href={`/product/${product.slug}`}>
        <div className="relative overflow-hidden">
          <Image
            src={product.thumbnail.url}
            alt={product.name}
            width={600}
            height={800}
            className="w-full h-[350px] object-cover transition duration-500 group-hover:scale-105"
          />

          {discount > 0 && (
            <span className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
              {discount}% OFF
            </span>
          )}

          {product.newArrival && (
            <span className="absolute top-4 right-4 bg-[#d4af37] text-white px-3 py-1 rounded-full text-sm font-medium">
              NEW
            </span>
          )}
        </div>
      </Link>

      {/* Product Details */}
      <div className="p-5">
        <Link href={`/product/${product.slug}`}>
          <h3 className="font-semibold text-lg hover:text-[#b8860b] transition">
            {product.name}
          </h3>
        </Link>

        <p className="text-gray-500 mt-2 text-sm line-clamp-2">
          {product.shortDescription}
        </p>

        <div className="flex items-center gap-2 mt-3">
          <span className="font-bold text-xl text-[#b8860b]">
            ₹{product.salePrice.toLocaleString()}
          </span>

          <span className="line-through text-gray-400 text-sm">
            ₹{product.originalPrice.toLocaleString()}
          </span>
        </div>

        <div className="flex gap-3 mt-5">
          <button
            onClick={() =>
              addToCart(product)
            }
            className="flex-1 bg-[#d4af37] hover:bg-[#b8860b] text-white py-3 rounded-xl flex items-center justify-center gap-2 transition"
          >
            <ShoppingCart size={18} />
            Add to Cart
          </button>

          <button
            onClick={() =>
              toggleWishlist(
                product._id
              )
            }
            className={`border rounded-xl px-4 transition ${
              isWishlisted
                ? "text-red-500 border-red-500"
                : "text-gray-600"
            }`}
          >
            <Heart
              size={18}
              fill={
                isWishlisted
                  ? "currentColor"
                  : "none"
              }
            />
          </button>
        </div>
      </div>
    </div>
  );
}