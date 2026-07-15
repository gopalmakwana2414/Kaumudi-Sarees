import type { Metadata } from "next";
import Hero from "@/components/home/Hero";
import Categories from "@/components/home/Categories";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import NewArrivals from "@/components/home/NewArrivals";
import WhyUs from "@/components/home/WhyUs";
import PromoStrip from "@/components/home/PromoStrip";
import CategoryBanner from "@/components/home/CategoryBanner";
import { constructMetadata } from "@/utils/seo";

export const metadata: Metadata = constructMetadata({
  title: "Kaumudi | Premium Sarees Online in India",
  description:
    "Shop premium Banarasi, Silk, Cotton, Linen, Wedding and Designer Sarees from Kaumudi. Elegant collections crafted for every occasion with secure payments and fast delivery.",
  path: "",
});

export default function HomePage() {
  return (
    <main>
      <Hero />
      <Categories />
      <PromoStrip />
      <FeaturedProducts />
      <CategoryBanner />
      <NewArrivals />
      <WhyUs />
    </main>
  );
}
