import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import ProductCard from "@/components/products/ProductCard";
import { constructMetadata, getBreadcrumbSchema } from "@/utils/seo";

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}

async function getCategoryBySlug(slug: string) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/categories`,
      { next: { revalidate: 300 } }
    );
    if (!res.ok) return null;
    const categories = await res.json();
    return categories.find((cat: any) => cat.slug === slug) || null;
  } catch {
    return null;
  }
}

async function getCategoryProducts(categorySlug: string, page: number) {
  try {
    const res = await fetch(
      `${
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"
      }/products?category=${categorySlug}&page=${page}&limit=12`,
      { cache: "no-store" }
    );
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);

  if (!category) {
    return constructMetadata({
      title: "Category Not Found | Kaumudi",
      description: "The saree category you are looking for could not be found.",
    });
  }

  const title = `${category.name} Sarees Online | Kaumudi`;
  const description = category.description
    ? `${category.description}. Shop premium ${category.name} sarees handcrafted in Surat with secure payments and fast delivery.`
    : `Shop premium ${category.name} sarees online from Kaumudi. Beautiful collections handcrafted in Surat with fast delivery.`;

  return constructMetadata({
    title,
    description,
    path: `/category/${slug}`,
    image: category.image || "/kaumodi.png",
  });
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { page: pageStr } = await searchParams;
  const page = Number(pageStr) || 1;

  const category = await getCategoryBySlug(slug);
  if (!category) {
    return notFound();
  }

  const productsData = await getCategoryProducts(slug, page);
  const products = productsData?.products || [];
  const totalPages = productsData?.totalPages || 1;
  const totalProducts = productsData?.totalProducts || 0;

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: "Home", item: "/" },
    { name: "Shop", item: "/shop" },
    { name: category.name, item: `/category/${slug}` },
  ]);

  return (
    <>
      {/* Breadcrumb JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <main className="py-12">
        <div className="container-custom">
          {/* Breadcrumb Visual Trail */}
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
              <li
                className="before:content-['/'] before:mr-2 before:text-gray-300 text-gray-800 font-medium truncate"
                aria-current="page"
              >
                {category.name}
              </li>
            </ol>
          </nav>

          {/* Category Header */}
          <header className="mb-12">
            <p className="text-sm text-primary font-semibold uppercase tracking-widest mb-2">
              Saree Category
            </p>
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              {category.name} <span className="text-primary">Collection</span>
            </h1>
            {category.description && (
              <p className="text-gray-600 max-w-3xl leading-relaxed text-lg">
                {category.description} Curated directly from our Surat weavers.
              </p>
            )}
            <p className="text-sm text-gray-400 mt-2 font-medium">
              Showing {products.length} of {totalProducts} premium designs
            </p>
          </header>

          {/* Products Grid */}
          {products.length === 0 ? (
            <div className="text-center py-20 bg-gray-50 rounded-3xl border border-gray-100">
              <p className="text-gray-400 text-xl font-medium">
                No sarees found in this category right now.
              </p>
              <Link href="/shop" className="mt-4 inline-block text-primary hover:text-primary-dark underline font-semibold transition">
                Browse all products
              </Link>
            </div>
          ) : (
            <>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {products.map((product: any) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <nav
                  className="flex justify-center gap-2 mt-16"
                  aria-label="Category Pagination"
                >
                  <Link
                    href={`/category/${slug}?page=${Math.max(1, page - 1)}`}
                    className={`px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 text-sm transition ${
                      page === 1 ? "pointer-events-none opacity-40" : ""
                    }`}
                    aria-label="Previous Page"
                  >
                    Previous
                  </Link>

                  {[...Array(totalPages)].map((_, i) => {
                    const pageNum = i + 1;
                    const isActive = page === pageNum;
                    return (
                      <Link
                        key={pageNum}
                        href={`/category/${slug}?page=${pageNum}`}
                        className={`px-4 py-2 rounded-xl text-sm transition font-medium ${
                          isActive
                            ? "bg-primary text-white font-bold shadow-md shadow-primary/10"
                            : "border border-gray-200 hover:bg-gray-50 text-gray-600"
                        }`}
                        aria-label={`Page ${pageNum}`}
                        aria-current={isActive ? "page" : undefined}
                      >
                        {pageNum}
                      </Link>
                    );
                  })}

                  <Link
                    href={`/category/${slug}?page=${Math.min(
                      totalPages,
                      page + 1
                    )}`}
                    className={`px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 text-sm transition ${
                      page === totalPages ? "pointer-events-none opacity-40" : ""
                    }`}
                    aria-label="Next Page"
                  >
                    Next
                  </Link>
                </nav>
              )}
            </>
          )}
        </div>
      </main>
    </>
  );
}
