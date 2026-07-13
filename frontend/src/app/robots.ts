import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://kaumudi.com";

  return {
    rules: {
      userAgent: "*",
      allow: [
        "/",
        "/shop",
        "/categories",
        "/category/",
        "/product/",
        "/about",
        "/contact",
        "/privacy-policy",
        "/refund-policy",
        "/shipping-policy",
        "/collections",
      ],
      disallow: [
        "/admin/",
        "/login",
        "/register",
        "/dashboard/",
        "/cart",
        "/checkout",
        "/api/",
        "/forgot-password",
        "/reset-password/",
        "/profile",
        "/orders/",
      ],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
