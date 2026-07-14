"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { motion, useReducedMotion } from "framer-motion";

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
  const shouldReduceMotion = useReducedMotion();

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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.08,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: [0.215, 0.61, 0.355, 1] as const },
    },
  };

  return (
    <section className="py-20 overflow-hidden">
      <div className="container-custom">
        <div className="text-center mb-12">
          <p className="text-primary font-semibold uppercase tracking-widest text-sm">
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
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            className="grid md:grid-cols-3 lg:grid-cols-6 gap-6"
          >
            {["Banarasi", "Kanjivaram", "Silk", "Wedding", "Party Wear", "Designer"].map(
              (name) => (
                <motion.div key={name} variants={cardVariants}>
                  <Link
                    href={`/shop?search=${encodeURIComponent(name)}`}
                    className="block bg-white border rounded-2xl p-6 text-center hover:border-primary hover:shadow-md hover:shadow-primary/5 transition-all duration-300 group cursor-pointer"
                  >
                    <motion.div
                      whileHover={{ scale: 1.15 }}
                      transition={{ type: "spring", stiffness: 300, damping: 15 }}
                      className="text-3xl mb-3"
                    >
                      {getEmoji(name)}
                    </motion.div>
                    <h3 className="font-semibold text-sm text-gray-700 group-hover:text-primary transition-colors">
                      {name}
                    </h3>
                  </Link>
                </motion.div>
              )
            )}
          </motion.div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            className="grid md:grid-cols-3 lg:grid-cols-6 gap-6"
          >
            {categories.map((cat: any) => (
              <motion.div key={cat._id} variants={cardVariants}>
                <Link
                  href={`/shop?category=${cat._id}`}
                  className="block bg-white border rounded-2xl p-6 text-center hover:border-primary hover:shadow-md hover:shadow-primary/5 transition-all duration-300 group cursor-pointer"
                >
                  <motion.div
                    whileHover={{ scale: 1.15 }}
                    transition={{ type: "spring", stiffness: 300, damping: 15 }}
                    className="text-3xl mb-3"
                  >
                    {getEmoji(cat.name)}
                  </motion.div>
                  <h3 className="font-semibold text-sm text-gray-700 group-hover:text-primary transition-colors">
                    {cat.name}
                  </h3>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
}
