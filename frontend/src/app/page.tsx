import type { Metadata } from "next";
import HomeClient from "@/components/home/HomeClient";
import { constructMetadata } from "@/utils/seo";

export const metadata: Metadata = constructMetadata({
  title: "Kaumudi | Premium Sarees Online in India",
  description:
    "Shop premium Banarasi, Silk, Cotton, Linen, Wedding and Designer Sarees from Kaumudi. Elegant collections crafted for every occasion with secure payments and fast delivery.",
  path: "",
});

export default function HomePage() {
  return <HomeClient />;
}
