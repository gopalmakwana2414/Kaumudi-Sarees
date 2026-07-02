import Hero from "@/components/home/Hero";
import Categories from "@/components/home/Categories";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import NewArrivals from "@/components/home/NewArrivals";
import WhyUs from "@/components/home/WhyUs";

export default function HomePage() {
  return (
    <main>
      <Hero />
      <Categories />
      <FeaturedProducts />
      <NewArrivals />
      <WhyUs />
    </main>
  );
}
