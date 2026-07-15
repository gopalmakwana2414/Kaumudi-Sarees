"use client";

import Link from "next/link";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";

export default function CategoryBanner() {
  const { data: banners = [], isLoading } = useQuery({
    queryKey: ["category-banners"],
    queryFn: async () => {
      const res = await api.get("/banners?position=category");
      return res.data;
    },
  });

  if (isLoading || banners.length === 0) return null;

  // Render the first active category banner
  const banner = banners[0];

  return (
    <section className="container-custom my-16 select-none">
      <div className="w-full relative overflow-hidden rounded-3xl min-h-[300px] md:min-h-[380px] flex items-center bg-black shadow-xl border border-secondary/5">
        <div className="absolute inset-0">
          <Image
            src={banner.image.url}
            alt={banner.title}
            fill
            className="object-cover"
            sizes="100vw"
            unoptimized
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/40 to-transparent" />
        </div>

        <div className="relative z-10 text-white max-w-xl p-8 md:p-16 space-y-6">
          <span className="text-secondary border border-secondary/20 bg-secondary/10 backdrop-blur-sm px-3.5 py-1 rounded-full text-[10px] uppercase font-bold tracking-widest inline-block">
            Trending Category
          </span>
          <h2 className="text-3xl md:text-5xl font-bold leading-tight drop-shadow-md">
            {banner.title}
          </h2>
          {banner.subtitle && (
            <p className="text-gray-300 text-sm md:text-base font-light max-w-md">
              {banner.subtitle}
            </p>
          )}
          <div className="pt-2">
            <Link
              href={banner.link || "/shop"}
              className="bg-primary hover:bg-primary-dark text-white px-8 py-3.5 rounded-full font-semibold transition hover:scale-105 duration-300 border border-primary text-sm inline-block shadow-lg"
            >
              {banner.buttonText || "Discover Now"}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
