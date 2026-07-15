"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Star, ChevronLeft, ChevronRight, Quote, User as UserIcon } from "lucide-react";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";

const TESTIMONIALS = [
  {
    id: 1,
    name: "Aditi Sharma",
    location: "Mumbai",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&h=150&q=80",
    text: "The drape of the Banarasi Silk saree is absolutely royal. I wore it for my wedding reception and received endless compliments. The weight of the silk and the craftsmanship of the zari weave is pure luxury.",
  },
  {
    id: 2,
    name: "Priya Patel",
    location: "Ahmedabad",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80",
    text: "Kaumudi has redefined online shopping for heritage sarees. The quality of fabric, the gold weave details, and the customer support are outstanding. Truly direct from Surat looms with top-tier premium delivery.",
  },
  {
    id: 3,
    name: "Meera Nair",
    location: "Bangalore",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&h=150&q=80",
    text: "A stunning collection! The Kanjivaram saree I bought is incredibly soft, lightweight, yet looks extremely grand. It was beautifully packaged in a luxury box and delivered ahead of schedule.",
  },
];

const AVATARS = [
  "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&h=150&q=80",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80",
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&h=150&q=80",
];

export default function Testimonials() {
  const { data: dbReviews = [], isLoading } = useQuery({
    queryKey: ["homepage-reviews"],
    queryFn: async () => {
      const res = await api.get("/reviews/homepage");
      return res.data;
    },
  });

  const dbMapped = dbReviews.map((rev: any, index: number) => ({
    id: rev._id,
    name: rev.user?.name || "Customer",
    location: rev.product?.name ? `Draped in ${rev.product.name.split(" ")[0]}` : "Verified Buyer",
    rating: rev.rating,
    avatar: rev.user?.profilePic || null,
    text: rev.comment,
  }));

  const activeTestimonials = !isLoading && dbMapped.length > 0
    ? dbMapped.filter((t: any) => t.rating === 5)
    : TESTIMONIALS.filter((t) => t.rating === 5);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const handleNext = useCallback(() => {
    if (activeTestimonials.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % activeTestimonials.length);
  }, [activeTestimonials.length]);

  const handlePrev = useCallback(() => {
    if (activeTestimonials.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + activeTestimonials.length) % activeTestimonials.length);
  }, [activeTestimonials.length]);

  useEffect(() => {
    if (isHovered || activeTestimonials.length <= 1) return;
    const timer = setInterval(handleNext, 5000);
    return () => clearInterval(timer);
  }, [isHovered, handleNext]);

  if (activeTestimonials.length === 0) return null;

  const current = activeTestimonials[currentIndex];

  return (
    <section 
      className="py-28 bg-white overflow-hidden select-none border-b border-gray-50"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="container-custom">
        {/* Header */}
        <ScrollReveal className="text-center mb-16">
          <span className="text-primary font-semibold uppercase tracking-[4px] text-xs">
            Client Stories
          </span>
          <h2 className="text-4xl md:text-5xl font-serif font-light mt-3 text-gray-900">
            Voices of Elegance
          </h2>
          <div className="w-12 h-[1px] bg-accent-gold mx-auto mt-4" />
        </ScrollReveal>

        {/* Testimonials Slider */}
        <div className="max-w-3xl mx-auto relative px-6 md:px-12">
          {/* Quote Mark */}
          <div className="flex justify-center mb-8 text-primary/10">
            <Quote size={56} className="fill-current" />
          </div>

          <div className="min-h-[220px] md:min-h-[180px] flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={current.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                className="text-center space-y-6"
              >
                {/* 5 Stars */}
                <div className="flex justify-center gap-1 text-accent-gold">
                  {[...Array(current.rating)].map((_, i) => (
                    <Star key={i} size={16} className="fill-current text-accent-gold" />
                  ))}
                </div>

                {/* Testimonial Quote */}
                <p className="text-gray-700 font-serif italic text-lg md:text-xl md:leading-relaxed leading-loose font-light max-w-2xl mx-auto">
                  &ldquo;{current.text}&rdquo;
                </p>

                {/* Profile detail */}
                <div className="flex flex-col items-center gap-3.5 pt-4">
                  <div className="relative w-14 h-14 rounded-full overflow-hidden border border-accent-gold/30 p-0.5 shadow-sm bg-gray-50 flex items-center justify-center">
                    {current.avatar ? (
                      <Image
                        src={current.avatar}
                        alt={current.name}
                        fill
                        className="object-cover rounded-full"
                        sizes="60px"
                      />
                    ) : (
                      <div className="w-full h-full bg-[#4A0010]/5 rounded-full flex items-center justify-center text-[#4A0010]">
                        <UserIcon size={20} />
                      </div>
                    )}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 text-sm tracking-wide">
                      {current.name}
                    </h4>
                    <span className="text-xs text-accent-gold tracking-widest font-semibold uppercase block mt-0.5">
                      {current.location}
                    </span>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation Controls */}
          {activeTestimonials.length > 1 && (
            <>
              <button
                suppressHydrationWarning
                onClick={handlePrev}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full border border-gray-100 hover:border-accent-gold bg-white text-gray-500 hover:text-black flex items-center justify-center transition-all duration-300 transform active:scale-95 cursor-pointer shadow-sm hover:shadow"
                aria-label="Previous review"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                suppressHydrationWarning
                onClick={handleNext}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full border border-gray-100 hover:border-accent-gold bg-white text-gray-500 hover:text-black flex items-center justify-center transition-all duration-300 transform active:scale-95 cursor-pointer shadow-sm hover:shadow"
                aria-label="Next review"
              >
                <ChevronRight size={18} />
              </button>
            </>
          )}

          {/* Indicator dots */}
          {activeTestimonials.length > 1 && (
            <div className="flex justify-center gap-2.5 mt-10">
              {activeTestimonials.map((_: any, idx: number) => (
                <button
                  suppressHydrationWarning
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                    idx === currentIndex ? "w-5 bg-primary" : "w-1.5 bg-gray-200 hover:bg-gray-400"
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
