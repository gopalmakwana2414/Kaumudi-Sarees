import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PageTransitionWrapper from "@/components/layout/PageTransitionWrapper";

import ReactQueryProvider from "@/providers/ReactQueryProvider";

import AuthInitializer from "@/components/AuthInitializer";

import { Toaster } from "@/components/ui/sonner";
import {
  constructMetadata,
  getOrganizationSchema,
  getLocalBusinessSchema,
  getWebsiteSchema,
} from "@/utils/seo";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = constructMetadata({
  title: "Kaumudi | Premium Sarees Online in India",
  description:
    "Shop premium Banarasi, Silk, Cotton, Linen, Wedding and Designer Sarees from Kaumudi. Elegant collections crafted for every occasion with secure payments and fast delivery.",
  path: "",
});

const orgSchema = getOrganizationSchema();
const localBusinessSchema = getLocalBusinessSchema();
const websiteSchema = getWebsiteSchema();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
      </head>
      <body className="min-h-screen flex flex-col">
        <ReactQueryProvider>
          <AuthInitializer />

          <Navbar />

          <main className="flex-1 flex flex-col">
            <PageTransitionWrapper>
              {children}
            </PageTransitionWrapper>
          </main>

          <Footer />

          <Toaster
            richColors
            position="top-right"
            closeButton
          />
        </ReactQueryProvider>
      </body>
    </html>
  );
}