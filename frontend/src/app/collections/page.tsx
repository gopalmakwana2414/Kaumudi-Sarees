"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import Image from "next/image";

const COLLECTION_BANNERS = [
  {
    key: "wedding",
    label: "Wedding Collection",
    desc: "Opulent Banarasi & Kanjivaram sarees for the most special day of your life.",
    color: "from-red-900/70 to-red-600/40",
  },
  {
    key: "festival",
    label: "Festival Special",
    desc: "Bright, vibrant silk sarees for Diwali, Navratri, and every celebration.",
    color: "from-orange-800/70 to-yellow-600/40",
  },
  {
    key: "party",
    label: "Party Wear",
    desc: "Contemporary designer sarees for cocktail parties and evening events.",
    color: "from-purple-900/70 to-purple-600/40",
  },
  {
    key: "casual",
    label: "Everyday Elegance",
    desc: "Lightweight cotton and linen sarees perfect for daily wear.",
    color: "from-teal-800/70 to-teal-500/40",
  },
];

export default function CollectionsPage() {
  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await api.get("/categories");
      return res.data;
    },
  });

  const { data: featuredData } = useQuery({
    queryKey: ["featured-products"],
    queryFn: async () => {
      const res = await api.get("/products?featured=true&limit=8");
      return res.data;
    },
  });

  const { data: bestsellerData } = useQuery({
    queryKey: ["bestseller-products"],
    queryFn: async () => {
      const res = await api.get("/products?bestseller=true&limit=4");
      return res.data;
    },
  });

  const featured = featuredData?.products || [];
  const bestsellers = bestsellerData?.products || [];

  return (
    <main>
      {/* Hero */}
      <section className="hero-gradient py-24">
        <div className="container-custom text-center">
          <p className="text-[#b8860b] font-semibold uppercase tracking-[4px] text-sm">
            Curated for You
          </p>
          <h1 className="text-5xl lg:text-6xl font-bold mt-4">
            Our <span className="text-[#d4af37]">Collections</span>
          </h1>
          <p className="mt-5 text-gray-600 max-w-xl mx-auto text-lg">
            Discover sarees carefully curated for every occasion — from
            grand weddings to festive celebrations.
          </p>
        </div>
      </section>

      {/* Collections Grid */}
      <section className="py-20">
        <div className="container-custom">
          <div className="grid md:grid-cols-2 gap-8">
            {COLLECTION_BANNERS.map((col) => (
              <Link
                key={col.key}
                href={`/shop?search=${col.key}`}
                className="group relative h-72 rounded-3xl overflow-hidden shadow-lg"
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${col.color} z-10`}
                />
                <div className="absolute inset-0 bg-[#d4af37]/10 group-hover:bg-[#d4af37]/20 transition z-10" />
                <div className="absolute inset-0 flex flex-col justify-end p-8 z-20">
                  <h2 className="text-white text-2xl font-bold">{col.label}</h2>
                  <p className="text-white/80 text-sm mt-2 max-w-xs">{col.desc}</p>
                  <span className="mt-4 inline-block bg-white/20 backdrop-blur text-white text-sm px-4 py-2 rounded-full w-fit group-hover:bg-white group-hover:text-[#b8860b] transition font-medium">
                    Explore →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Shop by Category */}
      {categories.length > 0 && (
        <section className="py-20 bg-[#fafafa]">
          <div className="container-custom">
            <div className="text-center mb-12">
              <p className="text-[#b8860b] font-semibold uppercase tracking-widest text-sm">
                Browse
              </p>
              <h2 className="text-4xl font-bold mt-3">Shop by Category</h2>
            </div>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {categories.map((cat: any) => (
                <Link
                  key={cat._id}
                  href={`/shop?category=${cat._id}`}
                  className="bg-white border rounded-2xl p-8 text-center hover:shadow-xl hover:border-[#d4af37] transition group"
                >
                  <div className="w-16 h-16 bg-[#fff8e7] rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-[#d4af37] transition">
                    <span className="text-2xl">🪡</span>
                  </div>
                  <h3 className="font-semibold text-lg group-hover:text-[#b8860b] transition">
                    {cat.name}
                  </h3>
                  {cat.description && (
                    <p className="text-gray-500 text-sm mt-2 line-clamp-2">
                      {cat.description}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Bestsellers */}
      {bestsellers.length > 0 && (
        <section className="py-20">
          <div className="container-custom">
            <div className="text-center mb-12">
              <p className="text-[#b8860b] font-semibold uppercase tracking-widest text-sm">
                Most Loved
              </p>
              <h2 className="text-4xl font-bold mt-3">Bestsellers</h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {bestsellers.map((product: any) => (
                <Link
                  key={product._id}
                  href={`/product/${product.slug}`}
                  className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition border border-gray-100"
                >
                  <div className="relative overflow-hidden">
                    <Image
                      src={product.thumbnail.url}
                      alt={product.name}
                      width={400}
                      height={500}
                      className="w-full h-72 object-cover group-hover:scale-105 transition duration-500"
                    />
                    <span className="absolute top-3 left-3 bg-[#d4af37] text-white text-xs font-bold px-3 py-1 rounded-full">
                      BESTSELLER
                    </span>
                  </div>
                  <div className="p-5">
                    <h3 className="font-semibold line-clamp-1 group-hover:text-[#b8860b] transition">
                      {product.name}
                    </h3>
                    <p className="font-bold text-[#b8860b] mt-2">
                      ₹{product.salePrice.toLocaleString()}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured */}
      {featured.length > 0 && (
        <section className="py-20 bg-[#fafafa]">
          <div className="container-custom">
            <div className="text-center mb-12">
              <p className="text-[#b8860b] font-semibold uppercase tracking-widest text-sm">
                Handpicked
              </p>
              <h2 className="text-4xl font-bold mt-3">Featured Collection</h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {featured.map((product: any) => (
                <Link
                  key={product._id}
                  href={`/product/${product.slug}`}
                  className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition border border-gray-100"
                >
                  <div className="relative overflow-hidden">
                    <Image
                      src={product.thumbnail.url}
                      alt={product.name}
                      width={400}
                      height={500}
                      className="w-full h-72 object-cover group-hover:scale-105 transition duration-500"
                    />
                  </div>
                  <div className="p-5">
                    <h3 className="font-semibold line-clamp-1 group-hover:text-[#b8860b] transition">
                      {product.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="font-bold text-[#b8860b]">
                        ₹{product.salePrice.toLocaleString()}
                      </span>
                      <span className="line-through text-gray-400 text-sm">
                        ₹{product.originalPrice.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            <div className="text-center mt-12">
              <Link
                href="/shop"
                className="border border-[#b8860b] text-[#b8860b] px-8 py-3 rounded-full font-medium hover:bg-[#b8860b] hover:text-white transition"
              >
                View All Products
              </Link>
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
