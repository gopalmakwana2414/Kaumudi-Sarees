"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import ScrollReveal from "@/components/ui/ScrollReveal";

import { Product } from "@/types/product";
import { Heart, ShoppingCart } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";

export default function ProductCard({
  product,
}: {
  product: Product;
}) {
  const shouldReduceMotion = useReducedMotion();
  const addToCart = useCartStore((state) => state.addToCart);
  const wishlistItems = useWishlistStore((state) => state.items);
  const toggleWishlist = useWishlistStore((state) => state.toggleWishlist);

  const isWishlisted = wishlistItems.includes(product._id);

  const discount = Math.round(
    ((product.originalPrice - product.salePrice) / product.originalPrice) * 100
  );

  return (
    <ScrollReveal y={30} duration={0.6}>
      <motion.div
        whileHover={
          shouldReduceMotion
            ? {}
            : {
                y: -6,
                boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
              }
        }
        transition={{ duration: 0.3, ease: [0.215, 0.61, 0.355, 1] }}
        className="group bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 flex flex-col h-full"
      >
        {/* Product Image */}
        <Link href={`/product/${product.slug}`}>
          <div className="relative overflow-hidden aspect-[3/4]">
            <Image
              src={product.thumbnail.url}
              alt={`${product.name} Saree - Premium Collection from Kaumudi`}
              width={600}
              height={800}
              className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />

            {discount > 0 && (
              <span className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-semibold tracking-wider">
                {discount}% OFF
              </span>
            )}

            {product.newArrival && (
              <span className="absolute top-4 right-4 bg-[#d4af37] text-white px-3 py-1 rounded-full text-xs font-semibold tracking-wider">
                NEW
              </span>
            )}
          </div>
        </Link>

        {/* Product Details */}
        <div className="p-5 flex flex-col flex-1 justify-between">
          <div>
            <Link href={`/product/${product.slug}`}>
              <h3 className="font-semibold text-lg text-gray-800 line-clamp-1 hover:text-[#b8860b] transition-colors duration-200">
                {product.name}
              </h3>
            </Link>

            <p className="text-gray-500 mt-2 text-sm line-clamp-2 min-h-[40px]">
              {product.shortDescription}
            </p>

            <div className="flex items-center gap-2 mt-3">
              <span className="font-bold text-xl text-[#b8860b]">
                ₹{product.salePrice.toLocaleString()}
              </span>

              {discount > 0 && (
                <span className="line-through text-gray-400 text-sm">
                  ₹{product.originalPrice.toLocaleString()}
                </span>
              )}
            </div>
          </div>

          <div className="flex gap-3 mt-5">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => addToCart(product)}
              className="flex-1 bg-[#d4af37] hover:bg-[#b8860b] text-white py-3 rounded-xl flex items-center justify-center gap-2 transition-colors font-medium text-sm cursor-pointer"
            >
              <ShoppingCart size={16} />
              Add to Cart
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => toggleWishlist(product._id)}
              className={`border rounded-xl px-4 flex items-center justify-center transition-colors cursor-pointer ${
                isWishlisted
                  ? "text-red-500 border-red-200 bg-red-50/50"
                  : "text-gray-500 hover:text-red-500 hover:border-red-200"
              }`}
            >
              <Heart
                size={18}
                className={`transition-all duration-300 ${isWishlisted ? "scale-110" : ""}`}
                fill={isWishlisted ? "currentColor" : "none"}
              />
            </motion.button>
          </div>
        </div>
      </motion.div>
    </ScrollReveal>
  );
}