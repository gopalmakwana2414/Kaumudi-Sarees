"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";

const CATEGORY_EMOJIS: Record<string, string> = {
  banarasi: "🪡",
  kanjivaram: "🌸",
  silk: "✨",
  wedding: "💍",
  cotton: "🌿",
  designer: "👗",
  festival: "🪔",
  party: "🎉",
  casual: "☀️",
  linen: "🍃",
};

export default function Categories() {
  const { data: categories = [], isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await api.get("/categories");
      return res.data;
    },
  });

  const getEmoji = (name: string) => {
    const key = name.toLowerCase().split(" ")[0];
    return CATEGORY_EMOJIS[key] || "🪡";
  };

  return (
    <section className="py-20">
      <div className="container-custom">
        <div className="text-center mb-12">
          <p className="text-[#b8860b] font-semibold uppercase tracking-widest text-sm">
            Find Your Style
          </p>
          <h2 className="text-4xl font-bold mt-3">Shop By Category</h2>
        </div>

        {isLoading ? (
          <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-gray-100 rounded-2xl h-32 animate-pulse"
              />
            ))}
          </div>
        ) : categories.length === 0 ? (
          // Fallback static categories if none added yet
          <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-6">
            {["Banarasi", "Kanjivaram", "Silk", "Wedding", "Party Wear", "Designer"].map(
              (name) => (
                <Link
                  key={name}
                  href={`/shop?search=${encodeURIComponent(name)}`}
                  className="bg-white border rounded-2xl p-6 text-center hover:shadow-xl hover:border-[#d4af37] transition group cursor-pointer"
                >
                  <div className="text-3xl mb-3">{getEmoji(name)}</div>
                  <h3 className="font-semibold text-sm group-hover:text-[#b8860b] transition">
                    {name}
                  </h3>
                </Link>
              )
            )}
          </div>
        ) : (
          <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-6">
            {categories.map((cat: any) => (
              <Link
                key={cat._id}
                href={`/shop?category=${cat._id}`}
                className="bg-white border rounded-2xl p-6 text-center hover:shadow-xl hover:border-[#d4af37] transition group cursor-pointer"
              >
                <div className="text-3xl mb-3">{getEmoji(cat.name)}</div>
                <h3 className="font-semibold text-sm group-hover:text-[#b8860b] transition">
                  {cat.name}
                </h3>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
