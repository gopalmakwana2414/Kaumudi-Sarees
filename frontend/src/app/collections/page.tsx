import type { Metadata } from "next";
import CollectionsClient from "./CollectionsClient";
import { constructMetadata } from "@/utils/seo";

export const metadata: Metadata = constructMetadata({
  title: "Premium Saree Collections | Kaumudi",
  description:
    "Explore our carefully curated saree collections for every occasion — from opulent Surat wedding sarees and festive specials to casual cottons and designer wear.",
  path: "/collections",
});

export default function CollectionsPage() {
  return <CollectionsClient />;
}
