"use client";

import Link from "next/link";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { ShoppingCart, Heart } from "lucide-react";
import api from "@/lib/api";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { toast } from "sonner";
import { Product } from "@/types/product";
import { motion, useReducedMotion } from "framer-motion";
import ScrollReveal from "@/components/ui/ScrollReveal";

export default function FeaturedProducts() {
  const addToCart = useCartStore((state) => state.addToCart);
  const { items: wishlistItems, toggleWishlist } = useWishlistStore();
  const shouldReduceMotion = useReducedMotion();

  const { data, isLoading } = useQuery({
    queryKey: ["featured-home"],
    queryFn: async () => {
      const res = await api.get("/products?featured=true&limit=4");
      return res.data;
    },
  });

  const products: Product[] = data?.products || [];

  return (
    <section className="py-20 bg-[#fafafa] overflow-hidden">
      <div className="container-custom">
        {/* Header */}
        <ScrollReveal className="text-center">
          <p className="text-primary font-semibold uppercase tracking-widest text-sm">
            Handpicked Collection
          </p>
          <h2 className="text-4xl md:text-5xl font-bold mt-3">
            Featured Collection
          </h2>
          <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
            Discover our premium saree collection crafted with elegance,
            tradition and modern fashion trends.
          </p>
        </ScrollReveal>

        {/* Skeleton */}
        {isLoading && (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mt-14">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-3xl overflow-hidden shadow-sm">
                <div className="h-80 bg-gray-100 animate-pulse" />
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-gray-100 rounded animate-pulse" />
                  <div className="h-4 bg-gray-100 rounded w-2/3 animate-pulse" />
                  <div className="h-8 bg-gray-100 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Products Grid */}
        {!isLoading && products.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mt-14">
            {products.map((product) => {
              const discount =
                Math.round(
                  ((product.originalPrice - product.salePrice) /
                    product.originalPrice) *
                    100
                ) || 0;
              const isWishlisted = wishlistItems.includes(product._id);

              return (
                <ScrollReveal key={product._id} y={30} duration={0.6}>
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
                    {/* Image */}
                    <div className="relative overflow-hidden aspect-[3/4]">
                      <Link href={`/product/${product.slug}`}>
                        <Image
                          src={product.thumbnail.url}
                          alt={product.name}
                          width={500}
                          height={650}
                          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                        />
                      </Link>

                      {discount > 0 && (
                        <span className="absolute top-4 left-4 bg-red-500 text-white text-xs font-semibold px-3 py-1 rounded-full tracking-wider">
                          {discount}% OFF
                        </span>
                      )}

                      <motion.button
                        whileHover={{ scale: 1.08 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => {
                          toggleWishlist(product._id);
                          toast.success(
                            isWishlisted
                              ? "Removed from wishlist"
                              : "Added to wishlist!"
                          );
                        }}
                        className={`absolute top-4 right-4 bg-white rounded-full p-2.5 shadow transition-colors cursor-pointer ${
                          isWishlisted ? "text-red-500" : "text-gray-400 hover:text-red-500"
                        }`}
                      >
                        <Heart
                          size={16}
                          className="transition-all duration-300"
                          fill={isWishlisted ? "currentColor" : "none"}
                        />
                      </motion.button>
                    </div>

                    {/* Content */}
                    <div className="p-5 flex flex-col flex-1 justify-between">
                      <div>
                        <Link href={`/product/${product.slug}`}>
                          <h3 className="font-semibold text-lg line-clamp-1 hover:text-primary transition-colors duration-200">
                            {product.name}
                          </h3>
                        </Link>

                        <p className="text-gray-500 text-sm mt-2 line-clamp-2 min-h-[40px]">
                          {product.shortDescription}
                        </p>

                        <div className="flex items-center gap-3 mt-4">
                          <span className="text-2xl font-bold text-primary-dark">
                            ₹{product.salePrice.toLocaleString()}
                          </span>
                          {discount > 0 && (
                            <span className="line-through text-gray-400 text-sm">
                              ₹{product.originalPrice.toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>

                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          addToCart(product);
                          toast.success("Added to cart!");
                        }}
                        className="w-full mt-5 flex items-center justify-center gap-2 bg-primary text-white py-3 rounded-xl font-medium hover:bg-primary-dark transition-colors cursor-pointer text-sm"
                      >
                        <ShoppingCart size={16} />
                        Add to Cart
                      </motion.button>
                    </div>
                  </motion.div>
                </ScrollReveal>
              );
            })}
          </div>
        )}

        {/* Empty state — no featured products yet */}
        {!isLoading && products.length === 0 && (
          <div className="text-center py-20 text-gray-400">
            <p>No featured products yet. Mark products as featured in the admin panel.</p>
          </div>
        )}

        {/* View All */}
        <ScrollReveal className="flex justify-center mt-14">
          <Link
            href="/shop"
            className="border border-primary text-primary px-8 py-3 rounded-full font-medium hover:bg-primary hover:text-white transition inline-block active:scale-98 hover:scale-[1.02] duration-300"
          >
            View All Products
          </Link>
        </ScrollReveal>
      </div>
    </section>
  );
}
