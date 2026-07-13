import type { Metadata } from "next";
import ContactClient from "./ContactClient";
import { constructMetadata } from "@/utils/seo";

export const metadata: Metadata = constructMetadata({
  title: "Contact Us | Kaumudi Sarees Surat",
  description:
    "Get in touch with Kaumudi, the premium saree store in Surat. Write to us, call us, or visit our store at Ring Road, Surat for the finest Banarasi, Silk, and Designer sarees.",
  path: "/contact",
});

export default function ContactPage() {
  return <ContactClient />;
}
