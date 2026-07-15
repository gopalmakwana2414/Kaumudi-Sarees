"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { Product } from "@/types/product";
import ScrollReveal from "@/components/ui/ScrollReveal";
import HomeProductCard from "./HomeProductCard";

interface FeaturedProductsProps {
  onQuickView: (product: Product) => void;
}

export default function FeaturedProducts({ onQuickView }: FeaturedProductsProps) {
  const { data, isLoading } = useQuery({
    queryKey: ["featured-home"],
    queryFn: async () => {
      const res = await api.get("/products?featured=true&limit=4");
      return res.data;
    },
  });

  const products: Product[] = data?.products || [];

  return (
    <section className="py-28 bg-[#FFF8F8] overflow-hidden">
      <div className="container-custom">
        {/* Header */}
        <ScrollReveal className="text-center">
          <span className="text-primary font-semibold uppercase tracking-[4px] text-xs">
            Handpicked Classics
          </span>
          <h2 className="text-4xl md:text-5xl font-serif font-light mt-3 text-gray-900">
            Featured Collection
          </h2>
          <div className="w-12 h-[1px] bg-accent-gold mx-auto mt-4" />
          <p className="text-gray-500 mt-4 max-w-2xl mx-auto font-light text-sm md:text-base leading-relaxed">
            Indulge in our most celebrated handloom creations. Carefully chosen weaves representing the zenith of traditional Indian artistry.
          </p>
        </ScrollReveal>

        {/* Skeleton Loading state */}
        {isLoading && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mt-16">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm animate-pulse">
                <div className="aspect-[3/4] bg-gray-50" />
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-gray-50 rounded w-1/3" />
                  <div className="h-4 bg-gray-50 rounded" />
                  <div className="h-4 bg-gray-50 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Products Grid */}
        {!isLoading && products.length > 0 && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mt-16">
            {products.map((product) => (
              <HomeProductCard
                key={product._id}
                product={product}
                onQuickView={onQuickView}
              />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && products.length === 0 && (
          <div className="text-center py-20 text-gray-400">
            <p>No featured products yet. Mark products as featured in the admin panel.</p>
          </div>
        )}

        {/* View All CTA */}
        <ScrollReveal className="flex justify-center mt-16">
          <Link
            href="/shop"
            className="border border-primary text-primary hover:bg-primary hover:text-white px-9 py-3.5 rounded-full font-medium transition-all duration-300 transform active:scale-95 text-xs uppercase tracking-widest cursor-pointer shadow-sm hover:shadow-md"
          >
            View All Products
          </Link>
        </ScrollReveal>
      </div>
    </section>
  );
}
