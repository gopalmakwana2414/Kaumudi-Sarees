"use client";

import Link from "next/link";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";

export default function PromoStrip() {
  const { data: banners = [], isLoading } = useQuery({
    queryKey: ["promo-banners"],
    queryFn: async () => {
      const res = await api.get("/banners?position=promo");
      return res.data;
    },
  });

  if (isLoading || banners.length === 0) return null;

  // Render the first active promo banner
  const banner = banners[0];

  return (
    <section className="w-full relative overflow-hidden py-12 bg-black select-none">
      <div className="absolute inset-0">
        <Image
          src={banner.image.url}
          alt={banner.title}
          fill
          className="object-cover"
          sizes="100vw"
          unoptimized
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/50 to-transparent" />
      </div>

      <div className="container-custom relative z-10 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-6 min-h-[140px] px-6">
        <div className="max-w-2xl space-y-2">
          <span className="text-secondary bg-primary/20 backdrop-blur-sm border border-primary/25 px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-widest inline-block">
            Special Offer
          </span>
          <h2 className="text-2xl md:text-3.5xl font-bold drop-shadow">
            {banner.title}
          </h2>
          {banner.subtitle && (
            <p className="text-gray-200 text-sm md:text-base font-light max-w-xl">
              {banner.subtitle}
            </p>
          )}
        </div>

        <Link
          href={banner.link || "/shop"}
          className="bg-primary hover:bg-primary-dark text-white px-8 py-3.5 rounded-full font-semibold transition hover:scale-105 duration-300 border border-primary text-sm shadow-lg whitespace-nowrap self-start md:self-auto"
        >
          {banner.buttonText || "Shop Now"}
        </Link>
      </div>
    </section>
  );
}
