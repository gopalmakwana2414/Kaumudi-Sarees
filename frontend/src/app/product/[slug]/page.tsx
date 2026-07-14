import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import ProductGallery from "@/components/products/ProductGallery";
import ProductInfo from "@/components/products/ProductInfo";
import {
  constructMetadata,
  getProductSchema,
  getBreadcrumbSchema,
} from "@/utils/seo";

interface Props {
  params: Promise<{ slug: string }>;
}

async function getProduct(slug: string) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/products/${slug}`,
      { cache: "no-store" }
    );
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

async function getReviews(productId: string) {
  try {
    const res = await fetch(
      `${
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"
      }/reviews/product/${productId}`,
      { cache: "no-store" }
    );
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

async function getCategorySlug(categoryName: string) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/categories`,
      { next: { revalidate: 300 } }
    );
    if (!res.ok) return "";
    const categories = await res.json();
    const found = categories.find(
      (cat: any) => cat.name.toLowerCase() === categoryName.toLowerCase()
    );
    return found ? found.slug : "";
  } catch {
    return "";
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    return constructMetadata({
      title: "Product Not Found | Kaumudi",
      description: "The saree you are looking for could not be found.",
    });
  }

  // Dynamic Product SEO description template
  const title = `${product.name} | Kaumudi`;
  const description =
    product.metaDescription ||
    `Buy ${product.name} online from Kaumudi with premium craftsmanship, secure payment and fast delivery across India.`;

  const allImages = [
    product.thumbnail?.url,
    ...(product.images?.map((img: any) => img.url) || []),
  ].filter(Boolean);

  return constructMetadata({
    title,
    description,
    path: `/product/${slug}`,
    image: allImages[0] || "/kaumodi.png",
    type: "product",
    keywords: [
      product.name.toLowerCase(),
      product.category?.name?.toLowerCase() || "",
      product.fabric?.toLowerCase() || "",
      product.color?.toLowerCase() || "",
      "buy saree online",
      "premium sarees",
    ].filter(Boolean),
  });
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;

  const product = await getProduct(slug);
  if (!product) {
    return notFound();
  }

  // Fetch reviews and category slug to construct JSON-LD schemas
  const reviewsData = await getReviews(product._id);
  const categoryName = product.category?.name || "Sarees";
  const categorySlug = await getCategorySlug(categoryName);

  const allImages = [
    product.thumbnail?.url,
    ...(product.images?.map((img: any) => img.url) || []),
  ].filter(Boolean);

  // Construct schemas
  const productSchema = getProductSchema({
    name: product.name,
    description: product.description || product.shortDescription,
    sku: product.sku,
    price: product.salePrice,
    availability: product.stock > 0,
    images: allImages,
    categoryName: categoryName,
    url: `/product/${slug}`,
    averageRating: product.averageRating,
    numReviews: product.numReviews,
    reviews: reviewsData.map((rev: any) => ({
      author: rev.user?.name || "Customer",
      datePublished: rev.createdAt?.split("T")[0] || new Date().toISOString().split("T")[0],
      reviewBody: rev.comment,
      reviewRating: rev.rating,
    })),
  });

  const breadcrumbs = [
    { name: "Home", item: "/" },
    { name: "Shop", item: "/shop" },
  ];
  if (categorySlug) {
    breadcrumbs.push({ name: categoryName, item: `/category/${categorySlug}` });
  }
  breadcrumbs.push({ name: product.name, item: `/product/${slug}` });

  const breadcrumbSchema = getBreadcrumbSchema(breadcrumbs);

  return (
    <>
      {/* Product JSON-LD Schemas */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <section className="py-12">
        <div className="container-custom">
           {/* Breadcrumb visual navigation trail */}
          <nav className="text-sm text-gray-500 mb-8" aria-label="Breadcrumb">
            <ol className="flex items-center gap-2 flex-wrap">
              <li>
                <Link href="/" className="hover:text-primary transition font-medium">
                  Home
                </Link>
              </li>
              <li className="before:content-['/'] before:mr-2 before:text-gray-300">
                <Link href="/shop" className="hover:text-primary transition font-medium">
                  Shop
                </Link>
              </li>
              {categorySlug && (
                <li className="before:content-['/'] before:mr-2 before:text-gray-300">
                  <Link
                    href={`/category/${categorySlug}`}
                    className="hover:text-primary transition font-medium"
                  >
                    {categoryName}
                  </Link>
                </li>
              )}
              <li
                className="before:content-['/'] before:mr-2 before:text-gray-300 text-gray-800 font-medium truncate max-w-[200px] sm:max-w-xs"
                aria-current="page"
              >
                {product.name}
              </li>
            </ol>
          </nav>

          <div className="grid lg:grid-cols-2 gap-16">
            <ProductGallery images={allImages} productName={product.name} />
            <ProductInfo product={product} />
          </div>
        </div>
      </section>
    </>
  );
}
