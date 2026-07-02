"use client";

import Link from "next/link";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import api from "@/lib/api";

const FALLBACK_CATEGORIES = [
  "Banarasi", "Kanjivaram", "Silk", "Wedding", "Party Wear",
  "Designer", "Casual", "Festival", "Cotton", "Linen",
];

const EMOJI_MAP: Record<string, string> = {
  banarasi: "🪡", kanjivaram: "🌸", silk: "✨", wedding: "💍",
  cotton: "🌿", designer: "👗", festival: "🪔", party: "🎉",
  casual: "☀️", linen: "🍃", georgette: "💫", chiffon: "🌊",
};

const getEmoji = (name: string) =>
  EMOJI_MAP[name.toLowerCase().split(" ")[0]] || "🪡";

export default function CategoriesPage() {
  const { data: categories = [], isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await api.get("/categories");
      return res.data;
    },
  });

  const { data: productsData } = useQuery({
    queryKey: ["shop-products-count"],
    queryFn: async () => {
      const res = await api.get("/products?limit=1");
      return res.data;
    },
  });

  return (
    <main>
      {/* Hero */}
      <section className="hero-gradient py-24">
        <div className="container-custom text-center">
          <p className="text-[#b8860b] font-semibold uppercase tracking-[4px] text-sm">
            Browse
          </p>
          <h1 className="text-5xl lg:text-6xl font-bold mt-4">
            Shop by <span className="text-[#d4af37]">Category</span>
          </h1>
          <p className="mt-5 text-gray-600 max-w-xl mx-auto text-lg">
            Find your perfect saree — browse by fabric type, occasion, or
            style. Every category has been curated from our Surat factory.
          </p>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-20">
        <div className="container-custom">
          {isLoading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-48 bg-gray-100 rounded-3xl animate-pulse" />
              ))}
            </div>
          ) : categories.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {categories.map((cat: any) => (
                <Link
                  key={cat._id}
                  href={`/shop?category=${cat._id}`}
                  className="group bg-white border rounded-3xl p-8 hover:shadow-2xl hover:border-[#d4af37] transition-all duration-300"
                >
                  <div className="flex items-center gap-5">
                    <div className="w-16 h-16 bg-[#fff8e7] rounded-2xl flex items-center justify-center text-3xl group-hover:bg-[#d4af37] group-hover:scale-110 transition-all duration-300 flex-shrink-0">
                      {getEmoji(cat.name)}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold group-hover:text-[#b8860b] transition">
                        {cat.name}
                      </h2>
                      {cat.description && (
                        <p className="text-gray-500 text-sm mt-1 line-clamp-2">
                          {cat.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="mt-5 flex items-center gap-1 text-[#b8860b] text-sm font-medium opacity-0 group-hover:opacity-100 transition">
                    Browse {cat.name} <ArrowRight size={14} />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            /* Fallback when no categories added in admin yet */
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {FALLBACK_CATEGORIES.map((name) => (
                <Link
                  key={name}
                  href={`/shop?search=${encodeURIComponent(name)}`}
                  className="group bg-white border rounded-3xl p-8 hover:shadow-2xl hover:border-[#d4af37] transition-all duration-300"
                >
                  <div className="flex items-center gap-5">
                    <div className="w-16 h-16 bg-[#fff8e7] rounded-2xl flex items-center justify-center text-3xl group-hover:bg-[#d4af37] transition-all duration-300">
                      {getEmoji(name)}
                    </div>
                    <h2 className="text-xl font-bold group-hover:text-[#b8860b] transition">
                      {name}
                    </h2>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Why Shop CTA */}
      <section className="py-20 bg-[#fafafa]">
        <div className="container-custom">
          <div className="bg-gradient-to-br from-[#d4af37] to-[#b8860b] rounded-3xl p-12 text-center text-white">
            <h2 className="text-3xl lg:text-4xl font-bold">
              Can&apos;t Find Your Style?
            </h2>
            <p className="mt-4 text-white/80 text-lg max-w-xl mx-auto">
              Browse our entire catalog of {productsData?.totalProducts || "500+"} handcrafted
              sarees and filter by fabric, color, price, and more.
            </p>
            <Link
              href="/shop"
              className="inline-block mt-8 bg-white text-[#b8860b] font-bold px-10 py-4 rounded-full hover:bg-[#fff8e7] transition"
            >
              View All Sarees
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
