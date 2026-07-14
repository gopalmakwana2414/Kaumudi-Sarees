"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Home, ShoppingBag, ArrowRight } from "lucide-react";

export default function NotFound() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <main className="min-h-[70vh] flex items-center justify-center py-20 px-4 hero-gradient">
      <div className="max-w-2xl w-full text-center bg-white rounded-3xl border border-gray-100 shadow-xl p-8 md:p-12">
        {/* Error Code visual */}
        <p className="text-sm font-semibold tracking-[6px] text-primary uppercase mb-4 animate-bounce">
          Error 404
        </p>

        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
          Saree <span className="text-primary">Not Found</span>
        </h1>

        <p className="text-gray-500 max-w-md mx-auto leading-relaxed mb-10 text-base md:text-lg">
          The page or saree collection you are looking for has been moved, deleted, or doesn&apos;t exist. Let&apos;s get you back on track.
        </p>

        {/* Dynamic Search Bar */}
        <form
          onSubmit={handleSearchSubmit}
          className="max-w-md mx-auto mb-10 relative flex items-center border border-gray-200 focus-within:border-primary rounded-full p-1 bg-gray-50 focus-within:bg-white transition-all duration-300 shadow-sm"
        >
          <div className="pl-4 text-gray-400">
            <Search size={18} />
          </div>
          <input
            type="text"
            placeholder="Search sarees (e.g. Banarasi, Silk)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent border-0 outline-none text-sm pl-2.5 pr-4 py-2.5 text-gray-800"
          />
          <button
            type="submit"
            className="bg-primary text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-primary-dark transition-colors cursor-pointer flex-shrink-0"
          >
            Search
          </button>
        </form>

        {/* Quick Links */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-8">
          <Link
            href="/"
            className="flex items-center gap-2 bg-primary text-white px-8 py-3.5 rounded-full font-semibold hover:bg-primary-dark transition-all cursor-pointer hover:scale-[1.02] duration-300 shadow-md shadow-primary/10"
          >
            <Home size={16} />
            Back to Home
          </Link>
          <Link
            href="/shop"
            className="flex items-center gap-2 border border-gray-200 text-gray-700 px-8 py-3.5 rounded-full font-semibold hover:bg-gray-50 transition-colors duration-200 active:scale-98 cursor-pointer"
          >
            <ShoppingBag size={16} />
            Browse Products
          </Link>
        </div>

        {/* Popular Categories */}
        <div className="border-t pt-8">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">
            Popular Saree Styles
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {[
              { name: "Banarasi", path: "/category/banarasi" },
              { name: "Silk", path: "/category/silk" },
              { name: "Kanjivaram", path: "/category/kanjivaram" },
              { name: "Cotton", path: "/category/cotton" },
            ].map((cat) => (
              <Link
                key={cat.name}
                href={cat.path}
                className="bg-secondary/50 text-primary border border-primary/20 hover:border-primary hover:bg-secondary px-4 py-2 rounded-full text-xs font-medium transition duration-200 flex items-center gap-1 group"
              >
                {cat.name}
                <ArrowRight size={10} className="opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
