"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import ProductCard from "@/components/products/ProductCard";
import { Product } from "@/types/product";
import { SlidersHorizontal, ChevronDown } from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";

const SORT_OPTIONS = [
  { value: "latest", label: "Latest" },
  { value: "priceLow", label: "Price: Low to High" },
  { value: "priceHigh", label: "Price: High to Low" },
];

function ShopPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [sort, setSort] = useState(searchParams.get("sort") || "latest");
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get("category") || ""
  );
  const [page, setPage] = useState(Number(searchParams.get("page")) || 1);

  const debouncedSearch = useDebounce(search, 400);

  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedSearch) params.set("search", debouncedSearch);
    if (selectedCategory) params.set("category", selectedCategory);
    if (sort !== "latest") params.set("sort", sort);
    if (page > 1) params.set("page", String(page));

    const queryString = params.toString();
    router.replace(queryString ? `/shop?${queryString}` : "/shop", {
      scroll: false,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, selectedCategory, sort, page]);

  useEffect(() => {
    const urlCategory = searchParams.get("category") || "";
    const urlSearch = searchParams.get("search") || "";

    if (urlCategory !== selectedCategory) setSelectedCategory(urlCategory);
    if (urlSearch !== search) setSearch(urlSearch);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const { data: categoriesData } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await api.get("/categories");
      return res.data;
    },
  });

  const { data, isLoading } = useQuery({
    queryKey: ["products", debouncedSearch, sort, selectedCategory, page],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: String(page),
        limit: "12",
        sort,
        ...(debouncedSearch && { search: debouncedSearch }),
        ...(selectedCategory && { category: selectedCategory }),
      });
      const res = await api.get(`/products?${params}`);
      return res.data;
    },
  });

  const products: Product[] = data?.products || [];
  const totalPages: number = data?.totalPages || 1;

  const selectedCategoryName =
    categoriesData?.find(
      (cat: any) => cat._id === selectedCategory || cat.slug === selectedCategory
    )?.name;

  const clearFilters = () => {
    setSearch("");
    setSelectedCategory("");
    setSort("latest");
    setPage(1);
  };

  return (
    <section className="py-16">
      <div className="container-custom">
        <h1 className="text-5xl font-bold mb-4">
          {selectedCategoryName || "All Sarees"}
        </h1>
        <p className="text-gray-500 mb-10">
          {data?.totalProducts || 0} products found
        </p>

        <div className="grid lg:grid-cols-4 gap-10">
          <aside className="lg:block">
            <div className="border rounded-2xl p-6 bg-white sticky top-24">
              <div className="flex items-center gap-2 mb-6">
                <SlidersHorizontal size={18} />
                <h2 className="text-lg font-semibold">Filters</h2>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Search</label>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Search sarees..."
                  className="w-full border p-2 rounded-xl text-sm outline-none focus:border-[#d4af37]"
                />
              </div>

              <div className="mb-6">
                <h3 className="font-medium mb-3 text-sm">Category</h3>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer text-sm">
                    <input
                      type="radio"
                      name="category"
                      value=""
                      checked={selectedCategory === ""}
                      onChange={() => {
                        setSelectedCategory("");
                        setPage(1);
                      }}
                      className="accent-[#d4af37]"
                    />
                    All Categories
                  </label>

                  {categoriesData?.map((cat: any) => (
                    <label
                      key={cat._id}
                      className="flex items-center gap-2 cursor-pointer text-sm"
                    >
                      <input
                        type="radio"
                        name="category"
                        value={cat._id}
                        checked={
                          selectedCategory === cat._id ||
                          selectedCategory === cat.slug
                        }
                        onChange={() => {
                          setSelectedCategory(cat._id);
                          setPage(1);
                        }}
                        className="accent-[#d4af37]"
                      />
                      {cat.name}
                    </label>
                  ))}
                </div>
              </div>

              <button
                onClick={clearFilters}
                className="w-full border border-gray-300 text-gray-600 py-2 rounded-xl text-sm hover:bg-gray-50 transition"
              >
                Clear Filters
              </button>
            </div>
          </aside>

          <div className="lg:col-span-3">
            <div className="flex justify-between items-center mb-6">
              <p className="text-gray-500 text-sm">
                Page {page} of {totalPages}
              </p>

              <div className="relative">
                <select
                  value={sort}
                  onChange={(e) => {
                    setSort(e.target.value);
                    setPage(1);
                  }}
                  className="border rounded-xl px-4 py-2 pr-8 text-sm outline-none appearance-none cursor-pointer"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={14}
                  className="absolute right-2 top-3 text-gray-500 pointer-events-none"
                />
              </div>
            </div>

            {isLoading ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="bg-gray-100 rounded-3xl h-[450px] animate-pulse"
                  />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-gray-400 text-xl">No products found.</p>
                <button
                  onClick={clearFilters}
                  className="mt-4 text-[#b8860b] underline text-sm"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            )}

            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-12">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 border rounded-xl disabled:opacity-40 hover:bg-gray-50 text-sm"
                >
                  Previous
                </button>

                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i + 1)}
                    className={`px-4 py-2 rounded-xl text-sm ${
                      page === i + 1
                        ? "bg-[#d4af37] text-white"
                        : "border hover:bg-gray-50"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}

                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 border rounded-xl disabled:opacity-40 hover:bg-gray-50 text-sm"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default function ShopPage() {
  return (
    <Suspense
      fallback={
        <div className="py-16 container-custom">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-gray-100 rounded-3xl h-[450px] animate-pulse"
              />
            ))}
          </div>
        </div>
      }
    >
      <ShopPageContent />
    </Suspense>
  );
}
