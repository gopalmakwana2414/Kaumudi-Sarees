"use client";

import Link from "next/link";
import { Heart, ShoppingBag } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { useWishlistStore } from "@/store/wishlistStore";
import { useCartStore } from "@/store/cartStore";
import api from "@/lib/api";
import { Product } from "@/types/product";
import Image from "next/image";

export default function WishlistPage() {
  const { items: wishlistIds, toggleWishlist } = useWishlistStore();
  const addToCart = useCartStore((state) => state.addToCart);

  const { data: allProducts = [], isLoading } = useQuery({
    queryKey: ["products-all"],
    queryFn: async () => {
      const res = await api.get("/products?limit=100");
      return res.data.products as Product[];
    },
    enabled: wishlistIds.length > 0,
  });

  const wishlistProducts = allProducts.filter((p) =>
    wishlistIds.includes(p._id)
  );

  if (wishlistIds.length === 0) {
    return (
      <section className="py-20">
        <div className="container-custom text-center">
          <Heart size={80} className="mx-auto text-gray-300" />
          <h1 className="text-3xl font-bold mt-6">Your Wishlist is Empty</h1>
          <p className="text-gray-500 mt-3">
            Save your favourite sarees here to buy later.
          </p>
          <Link
            href="/shop"
            className="inline-block mt-8 bg-[#d4af37] text-white px-8 py-3 rounded-xl font-medium"
          >
            Explore Collection
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16">
      <div className="container-custom">
        <h1 className="text-4xl font-bold mb-3">My Wishlist</h1>
        <p className="text-gray-500 mb-10">{wishlistIds.length} item(s) saved</p>

        {isLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-100 rounded-3xl h-[400px] animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {wishlistProducts.map((product) => (
              <div
                key={product._id}
                className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100"
              >
                <div className="relative overflow-hidden">
                  <Link href={`/product/${product.slug}`}>
                    <Image
                      src={product.thumbnail.url}
                      alt={product.name}
                      width={400}
                      height={500}
                      className="w-full h-72 object-cover hover:scale-105 transition duration-500"
                    />
                  </Link>
                  <button
                    onClick={() => toggleWishlist(product._id)}
                    className="absolute top-4 right-4 bg-white rounded-full p-2 shadow text-red-500"
                  >
                    <Heart size={18} fill="currentColor" />
                  </button>
                </div>

                <div className="p-5">
                  <Link href={`/product/${product.slug}`}>
                    <h3 className="font-semibold text-lg hover:text-[#b8860b] transition line-clamp-1">
                      {product.name}
                    </h3>
                  </Link>

                  <div className="flex items-center gap-2 mt-2">
                    <span className="font-bold text-[#b8860b] text-lg">
                      ₹{product.salePrice.toLocaleString()}
                    </span>
                    <span className="line-through text-gray-400 text-sm">
                      ₹{product.originalPrice.toLocaleString()}
                    </span>
                  </div>

                  <button
                    onClick={() => addToCart(product)}
                    className="w-full mt-4 bg-[#d4af37] text-white py-2.5 rounded-xl flex items-center justify-center gap-2 hover:bg-[#b8860b] transition"
                  >
                    <ShoppingBag size={16} />
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
