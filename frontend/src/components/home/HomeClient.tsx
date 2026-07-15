"use client";

import { useState } from "react";
import Hero from "@/components/home/Hero";
import Categories from "@/components/home/Categories";
import PromoStrip from "@/components/home/PromoStrip";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import CategoryBanner from "@/components/home/CategoryBanner";
import NewArrivals from "@/components/home/NewArrivals";
import WhyUs from "@/components/home/WhyUs";
import Testimonials from "@/components/home/Testimonials";
import Newsletter from "@/components/home/Newsletter";
import QuickViewModal from "@/components/products/QuickViewModal";
import { Product } from "@/types/product";

export default function HomeClient() {
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  return (
    <main className="space-y-0">
      {/* Hero background slider */}
      <Hero />

      {/* Categories section */}
      <Categories />

      {/* Promo banner strip */}
      <PromoStrip />

      {/* Featured collection products */}
      <FeaturedProducts onQuickView={setQuickViewProduct} />

      {/* Custom styled category banner */}
      <CategoryBanner />

      {/* New arrivals products */}
      <NewArrivals onQuickView={setQuickViewProduct} />

      {/* Testimonials slider */}
      <Testimonials />

      {/* Why Choose Kaumudi details */}
      <WhyUs />

      {/* Email subscription block */}
      <Newsletter />

      {/* Global Quick View Modal portal */}
      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />
    </main>
  );
}
