import { notFound } from "next/navigation";
import ProductGallery from "@/components/products/ProductGallery";
import ProductInfo from "@/components/products/ProductInfo";

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

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const product = await getProduct(slug);

  if (!product) {
    return notFound();
  }

  const allImages = [
    product.thumbnail?.url,
    ...(product.images?.map((img: any) => img.url) || []),
  ].filter(Boolean);

  return (
    <section className="py-16">
      <div className="container-custom">
        <div className="grid lg:grid-cols-2 gap-16">
          <ProductGallery images={allImages} />
          <ProductInfo product={product} />
        </div>
      </div>
    </section>
  );
}
