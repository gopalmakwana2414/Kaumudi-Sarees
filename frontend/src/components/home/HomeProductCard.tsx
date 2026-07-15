"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { Heart, ShoppingCart, Eye } from "lucide-react";
import { Product } from "@/types/product";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { toast } from "sonner";
import ScrollReveal from "@/components/ui/ScrollReveal";

interface HomeProductCardProps {
  product: Product;
  onQuickView: (product: Product) => void;
}

export default function HomeProductCard({ product, onQuickView }: HomeProductCardProps) {
  const shouldReduceMotion = useReducedMotion();
  const addToCart = useCartStore((state) => state.addToCart);
  const wishlistItems = useWishlistStore((state) => state.items);
  const toggleWishlist = useWishlistStore((state) => state.toggleWishlist);
  const [isAdding, setIsAdding] = useState(false);

  const isWishlisted = wishlistItems.includes(product._id);
  const discount = Math.round(
    ((product.originalPrice - product.salePrice) / product.originalPrice) * 100
  );

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsAdding(true);
    setTimeout(() => {
      addToCart(product);
      toast.success(`${product.name} added to cart!`);
      setIsAdding(false);
    }, 600);
  };

  return (
    <ScrollReveal y={30} duration={0.6}>
      <motion.div
        whileHover={
          shouldReduceMotion
            ? {}
            : {
                y: -8,
                boxShadow: "0 25px 50px -12px rgba(128, 0, 32, 0.08)",
              }
        }
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] as const }}
        className="group bg-white rounded-2xl overflow-hidden border border-gray-100 flex flex-col h-full relative"
      >
        {/* Product Image Container */}
        <div className="relative overflow-hidden aspect-[3/4] bg-[#fafafa]">
          <Link href={`/product/${product.slug}`}>
            <Image
              src={product.thumbnail.url}
              alt={`${product.name} Saree - Kaumudi Luxury`}
              fill
              className="object-cover transition-transform duration-[1000ms] cubic-bezier(0.16, 1, 0.3, 1) group-hover:scale-105"
              sizes="(max-width: 768px) 50vw, 25vw"
            />
          </Link>

          {/* Luxury badges */}
          <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
            {product.newArrival && (
              <span className="bg-primary/95 text-white text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-sm shadow-sm">
                New
              </span>
            )}
            {discount > 0 && (
              <span className="bg-accent-gold text-white text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-sm shadow-sm">
                {discount}% Off
              </span>
            )}
          </div>

          {/* Quick Wishlist Icon */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => {
              toggleWishlist(product._id);
              toast.success(
                isWishlisted ? "Removed from wishlist" : "Added to wishlist!"
              );
            }}
            className={`absolute top-4 right-4 z-10 bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-sm transition-colors duration-300 hover:bg-white cursor-pointer ${
              isWishlisted ? "text-red-500" : "text-gray-400 hover:text-red-500"
            }`}
            aria-label="Add to wishlist"
          >
            <Heart
              size={15}
              className="transition-transform duration-300"
              fill={isWishlisted ? "currentColor" : "none"}
            />
          </motion.button>

          {/* Quick View Button (Sleek slide up overlay on hover) */}
          <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/60 via-black/10 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] flex justify-center items-center">
            <button
              onClick={() => onQuickView(product)}
              className="bg-white/90 hover:bg-white text-gray-900 font-semibold px-5 py-2.5 rounded-full text-xs tracking-widest uppercase flex items-center gap-1.5 shadow-md transition-all duration-300 transform active:scale-95 cursor-pointer"
            >
              <Eye size={13} />
              Quick View
            </button>
          </div>
        </div>

        {/* Product Details */}
        <div className="p-5 flex flex-col flex-grow justify-between">
          <div className="space-y-2">
            <Link href={`/product/${product.slug}`} className="block">
              <h3 className="font-serif text-lg text-gray-950 line-clamp-1 hover:text-primary transition-colors duration-200">
                {product.name}
              </h3>
            </Link>

            <div className="flex justify-between items-center text-xs text-gray-400 uppercase tracking-wider">
              <span>{product.fabric || "Pure Silk"}</span>
              <span>{product.color || "Multicolor"}</span>
            </div>

            {/* Price section */}
            <div className="flex items-baseline gap-2.5 pt-1">
              <span className="font-bold text-lg text-primary">
                ₹{product.salePrice.toLocaleString()}
              </span>
              {discount > 0 && (
                <span className="line-through text-gray-400 text-xs">
                  ₹{product.originalPrice.toLocaleString()}
                </span>
              )}
            </div>
          </div>

          {/* Add to Cart CTA */}
          <button
            onClick={handleAddToCart}
            disabled={isAdding}
            className="w-full mt-5 bg-primary hover:bg-primary-dark text-white py-3 rounded-full flex items-center justify-center gap-2 font-medium text-xs uppercase tracking-widest transition-all duration-300 transform active:scale-98 disabled:opacity-75 cursor-pointer shadow-md hover:shadow-lg shadow-primary/5 hover:shadow-primary/10"
          >
            <ShoppingCart size={13} className={isAdding ? "animate-bounce" : ""} />
            {isAdding ? "Adding..." : "Add to Cart"}
          </button>
        </div>
      </motion.div>
    </ScrollReveal>
  );
}
