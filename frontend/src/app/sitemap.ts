import { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://kaumudi.com";
  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

  // Static site pages
  const staticPages = [
    "",
    "/shop",
    "/categories",
    "/about",
    "/contact",
    "/collections",
    "/privacy-policy",
    "/refund-policy",
    "/shipping-policy",
  ].map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: route === "" ? 1.0 : 0.8,
  }));

  // Dynamic category pages
  let categoryPages: any[] = [];
  try {
    const res = await fetch(`${apiUrl}/categories`, {
      next: { revalidate: 3600 },
    });
    if (res.ok) {
      const categories = await res.json();
      categoryPages = categories.map((cat: any) => ({
        url: `${siteUrl}/category/${cat.slug}`,
        lastModified: new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.7,
      }));
    }
  } catch (error) {
    console.error("Sitemap category fetch error", error);
  }

  // Dynamic product pages
  let productPages: any[] = [];
  try {
    // Fetch a large limit to include all products
    const res = await fetch(`${apiUrl}/products?limit=5000`, {
      next: { revalidate: 3600 },
    });
    if (res.ok) {
      const data = await res.json();
      const products = data.products || [];
      productPages = products.map((prod: any) => ({
        url: `${siteUrl}/product/${prod.slug}`,
        lastModified: new Date(prod.updatedAt || prod.createdAt || new Date()),
        changeFrequency: "daily" as const,
        priority: 0.6,
      }));
    }
  } catch (error) {
    console.error("Sitemap product fetch error", error);
  }

  return [...staticPages, ...categoryPages, ...productPages];
}
