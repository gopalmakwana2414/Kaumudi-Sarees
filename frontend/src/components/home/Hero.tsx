"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { optimizedCloudinaryUrl } from "@/lib/cloudinary";
import { motion, useReducedMotion } from "framer-motion";

export default function Hero() {
  const shouldReduceMotion = useReducedMotion();

  const { data: banners = [], isLoading } = useQuery({
    queryKey: ["hero-banners"],
    queryFn: async () => {
      const res = await api.get("/banners?position=hero");
      return res.data;
    },
  });

  const banner = banners[0]; // First active hero banner

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.12,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 25 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.7,
        ease: [0.215, 0.61, 0.355, 1] as const, // easeOutCubic
      },
    },
  };

  const imageVariants = {
    hidden: { opacity: 0, scale: shouldReduceMotion ? 1 : 0.97 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.9,
        ease: [0.215, 0.61, 0.355, 1] as const,
      },
    },
  };

  return (
    <section className="hero-gradient overflow-hidden">
      <div className="container-custom">
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[700px] py-12 lg:py-0">
          {/* Left Content */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col justify-center"
          >
            <motion.p
              variants={itemVariants}
              className="text-primary font-semibold uppercase tracking-[4px]"
            >
              Premium Saree Collection
            </motion.p>

            <motion.h1
              variants={itemVariants}
              className="text-5xl lg:text-7xl font-bold mt-6 leading-tight"
            >
              {banner ? banner.title : "Celebrate Every Occasion"}
              <span className="text-primary block">
                {banner ? "" : "With Elegance"}
              </span>
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="mt-6 text-lg text-gray-600 max-w-xl"
            >
              {banner
                ? banner.subtitle
                : "Discover handcrafted Banarasi, Kanjivaram, Silk and Designer Sarees curated specially for weddings, festivals and special moments."}
            </motion.p>

            <motion.div variants={itemVariants} className="flex flex-wrap gap-4 mt-10">
              <Link
                href={banner?.link || "/shop"}
                className="bg-primary text-white px-8 py-4 rounded-full font-semibold transition inline-block hover:bg-primary-dark active:scale-98 shadow-md hover:shadow-lg shadow-primary/20 hover:scale-[1.02] duration-300"
                style={{ transformOrigin: "center" }}
              >
                {banner?.buttonText || "Shop Now"}
              </Link>

              <Link
                href="/collections"
                className="border border-primary text-primary px-8 py-4 rounded-full font-semibold hover:bg-secondary transition inline-block active:scale-98 hover:scale-[1.02] duration-300"
                style={{ transformOrigin: "center" }}
              >
                View Collections
              </Link>
            </motion.div>

            <motion.div variants={itemVariants} className="flex gap-10 mt-12">
              <div>
                <h3 className="font-bold text-2xl text-gray-800">10K+</h3>
                <p className="text-gray-500 text-sm">Happy Customers</p>
              </div>

              <div>
                <h3 className="font-bold text-2xl text-gray-800">500+</h3>
                <p className="text-gray-500 text-sm">Saree Designs</p>
              </div>

              <div>
                <h3 className="font-bold text-2xl text-gray-800">4.8★</h3>
                <p className="text-gray-500 text-sm">Customer Rating</p>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Banner Image */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={imageVariants}
            className="relative"
          >
            {isLoading ? (
              <div className="rounded-3xl w-full h-[650px] bg-gray-100 animate-pulse" />
            ) : banner?.image?.url ? (
              <img
                src={optimizedCloudinaryUrl(banner.image.url, 1600)}
                alt={banner.title || "Kaumudi Saree Collection"}
                fetchPriority="high"
                className="rounded-3xl shadow-2xl w-full object-cover h-[650px]"
              />
            ) : (
              <div className="rounded-3xl shadow-2xl w-full h-[650px] hero-gradient border border-primary/20 flex flex-col items-center justify-center text-center px-10">
                <p className="text-primary font-semibold uppercase tracking-[3px] text-sm">
                  Kaumudi
                </p>
                <p className="text-gray-400 mt-3 text-sm max-w-xs">
                  No hero banner has been added yet. Add one from Admin → Hero
                  Banners to feature it here.
                </p>
              </div>
            )}

            <motion.div
              initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="absolute bottom-8 left-8 bg-white/90 backdrop-blur p-5 rounded-2xl shadow-lg border border-gray-100"
            >
              <p className="font-semibold text-gray-800">
                {banner ? banner.title : "Wedding Collection"}
              </p>
              <p className="text-sm text-gray-500">
                {banner?.subtitle || "Starting from ₹2,999"}
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
