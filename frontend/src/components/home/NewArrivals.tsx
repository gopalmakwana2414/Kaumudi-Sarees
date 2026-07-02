"use client";

import Link from "next/link";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { ShoppingCart, Heart, Sparkles } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { Product } from "@/types/product";

export default function NewArrivals() {
  const addToCart = useCartStore((s) => s.addToCart);
  const { items: wishlist, toggleWishlist } = useWishlistStore();

  const { data, isLoading } = useQuery({
    queryKey: ["new-arrivals-home"],
    queryFn: async () => {
      const res = await api.get("/products?newArrival=true&limit=4");
      return res.data;
    },
  });

  const products: Product[] = data?.products || [];

  if (!isLoading && products.length === 0) return null;

  return (
    <section className="py-20">
      <div className="container-custom">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 bg-[#fff8e7] border border-[#f0d060] text-[#b8860b] px-4 py-2 rounded-full text-sm font-semibold mb-4">
            <Sparkles size={15} />
            Just Arrived
          </div>
          <h2 className="text-4xl md:text-5xl font-bold">New Arrivals</h2>
          <p className="text-gray-500 mt-4 max-w-xl mx-auto">
            Fresh from our looms in Surat — the latest designs added to our collection this season.
          </p>
        </div>

        {isLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-100 rounded-3xl h-[460px] animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.map((product) => {
              const isWishlisted = wishlist.includes(product._id);
              const discount = Math.round(
                ((product.originalPrice - product.salePrice) / product.originalPrice) * 100
              );

              return (
                <div
                  key={product._id}
                  className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 border border-gray-100"
                >
                  <div className="relative overflow-hidden">
                    <Link href={`/product/${product.slug}`}>
                      <Image
                        src={product.thumbnail.url}
                        alt={product.name}
                        width={500}
                        height={650}
                        className="h-80 w-full object-cover group-hover:scale-105 transition duration-500"
                      />
                    </Link>

                    <span className="absolute top-4 left-4 bg-[#d4af37] text-white text-xs font-bold px-3 py-1 rounded-full">
                      NEW
                    </span>

                    {discount > 0 && (
                      <span className="absolute top-4 right-12 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                        {discount}% OFF
                      </span>
                    )}

                    <button
                      onClick={() => {
                        toggleWishlist(product._id);
                        toast.success(isWishlisted ? "Removed from wishlist" : "Added to wishlist!");
                      }}
                      className={`absolute top-4 right-4 bg-white rounded-full p-2 shadow transition ${
                        isWishlisted ? "text-red-500" : "text-gray-400 hover:text-red-500"
                      }`}
                    >
                      <Heart size={16} fill={isWishlisted ? "currentColor" : "none"} />
                    </button>
                  </div>

                  <div className="p-5">
                    <Link href={`/product/${product.slug}`}>
                      <h3 className="font-semibold text-lg line-clamp-1 hover:text-[#b8860b] transition">
                        {product.name}
                      </h3>
                    </Link>
                    <p className="text-gray-400 text-sm mt-1">{product.fabric}</p>

                    <div className="flex items-center gap-2 mt-3">
                      <span className="text-xl font-bold text-[#b8860b]">
                        ₹{product.salePrice.toLocaleString()}
                      </span>
                      {discount > 0 && (
                        <span className="text-sm text-gray-400 line-through">
                          ₹{product.originalPrice.toLocaleString()}
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => { addToCart(product); toast.success("Added to cart!"); }}
                      className="w-full mt-4 flex items-center justify-center gap-2 bg-[#d4af37] text-white py-3 rounded-xl hover:bg-[#b8860b] transition font-medium"
                    >
                      <ShoppingCart size={16} />
                      Add to Cart
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="text-center mt-12">
          <Link
            href="/shop?newArrival=true"
            className="border border-[#b8860b] text-[#b8860b] px-8 py-3 rounded-full font-medium hover:bg-[#b8860b] hover:text-white transition"
          >
            View All New Arrivals
          </Link>
        </div>
      </div>
    </section>
  );
}
