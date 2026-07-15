"use client";

import Link from "next/link";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { motion, useReducedMotion } from "framer-motion";
import ScrollReveal from "@/components/ui/ScrollReveal";

const CATEGORY_IMAGES: Record<string, string> = {
  banarasi: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80",
  kanjivaram: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80",
  silk: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80",
  wedding: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=800&q=80",
  cotton: "https://images.unsplash.com/photo-1606744824163-985d376605aa?auto=format&fit=crop&w=800&q=80",
  linen: "https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?auto=format&fit=crop&w=800&q=80",
  designer: "https://images.unsplash.com/photo-1596783074918-c84cb06531ca?auto=format&fit=crop&w=800&q=80",
};

const getCategoryImage = (name: string, customImage?: string) => {
  if (customImage) return customImage;
  const key = name.toLowerCase().split(" ")[0];
  return CATEGORY_IMAGES[key] || CATEGORY_IMAGES["banarasi"];
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
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 25 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const },
    },
  };

  const staticCategories = [
    { name: "Banarasi", _id: "banarasi", url: "/shop?search=Banarasi" },
    { name: "Kanjivaram", _id: "kanjivaram", url: "/shop?search=Kanjivaram" },
    { name: "Silk Collection", _id: "silk", url: "/shop?search=Silk" },
    { name: "Bridal Wear", _id: "wedding", url: "/shop?search=Wedding" },
    { name: "Designer Sarees", _id: "designer", url: "/shop?search=Designer" },
    { name: "Linen & Cotton", _id: "cotton", url: "/shop?search=Linen" },
  ];

  return (
    <section className="py-28 bg-white overflow-hidden">
      <div className="container-custom">
        {/* Header */}
        <ScrollReveal className="text-center mb-16">
          <span className="text-primary font-semibold uppercase tracking-[4px] text-xs">
            Exquisite Weaves
          </span>
          <h2 className="text-4xl md:text-5xl font-serif font-light mt-3 text-gray-900">
            Shop By Category
          </h2>
          <div className="w-12 h-[1px] bg-accent-gold mx-auto mt-4" />
        </ScrollReveal>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-gray-50 rounded-2xl aspect-[3/4] animate-pulse"
              />
            ))}
          </div>
        ) : categories.length === 0 ? (
          // Fallback static categories if none in DB
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6"
          >
            {staticCategories.map((cat) => (
              <motion.div
                key={cat._id}
                variants={cardVariants}
                whileHover={shouldReduceMotion ? {} : { y: -8 }}
                transition={{ duration: 0.3 }}
              >
                <Link
                  href={cat.url}
                  className="block relative overflow-hidden rounded-2xl aspect-[3/4] shadow-sm hover:shadow-xl transition-all duration-500 group border border-gray-100 cursor-pointer"
                >
                  {/* Background Image */}
                  <Image
                    src={getCategoryImage(cat.name)}
                    alt={`${cat.name} Sarees`}
                    fill
                    className="object-cover transition-transform duration-[1000ms] cubic-bezier(0.16, 1, 0.3, 1) group-hover:scale-105"
                    sizes="(max-width: 768px) 50vw, 15vw"
                  />

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#4A0010]/90 via-[#4A0010]/20 to-transparent" />

                  {/* Text Centered */}
                  <div className="absolute inset-0 flex flex-col justify-end items-center pb-8 text-white px-4 text-center">
                    <h3 className="font-serif text-lg font-medium tracking-wide group-hover:text-accent-gold transition-colors duration-300">
                      {cat.name}
                    </h3>
                    <span className="text-[9px] uppercase tracking-[2px] text-gray-300 mt-1 opacity-0 group-hover:opacity-100 transition-all duration-300">
                      Shop Now
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          // API categories
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6"
          >
            {categories.map((cat: any) => (
              <motion.div
                key={cat._id}
                variants={cardVariants}
                whileHover={shouldReduceMotion ? {} : { y: -8 }}
                transition={{ duration: 0.3 }}
              >
                <Link
                  href={`/shop?category=${cat._id}`}
                  className="block relative overflow-hidden rounded-2xl aspect-[3/4] shadow-sm hover:shadow-xl transition-all duration-500 group border border-gray-100 cursor-pointer"
                >
                  {/* Background Image */}
                  <Image
                    src={getCategoryImage(cat.name, cat.image)}
                    alt={`${cat.name} Sarees`}
                    fill
                    className="object-cover transition-transform duration-[1000ms] cubic-bezier(0.16, 1, 0.3, 1) group-hover:scale-105"
                    sizes="(max-width: 768px) 50vw, 15vw"
                  />

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#4A0010]/95 via-[#4A0010]/15 to-transparent" />

                  {/* Text Centered */}
                  <div className="absolute inset-0 flex flex-col justify-end items-center pb-8 text-white px-4 text-center">
                    <h3 className="font-serif text-lg font-medium tracking-wide group-hover:text-accent-gold transition-colors duration-300">
                      {cat.name}
                    </h3>
                    <span className="text-[9px] uppercase tracking-[2px] text-gray-300 mt-1 opacity-0 group-hover:opacity-100 transition-all duration-300">
                      Shop Now
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
}
