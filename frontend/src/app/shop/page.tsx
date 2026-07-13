import type { Metadata } from "next";
import ShopClient from "./ShopClient";
import { constructMetadata } from "@/utils/seo";

export const metadata: Metadata = constructMetadata({
  title: "Shop Premium Sarees Online | Kaumudi",
  description:
    "Shop Banarasi, Silk, Cotton, Linen, Wedding and Designer Sarees from Kaumudi online. Premium craftsmanship directly from our Surat factory with secure payments, cash on delivery, and fast shipping.",
  path: "/shop",
});

export default function ShopPage() {
  return <ShopClient />;
}
