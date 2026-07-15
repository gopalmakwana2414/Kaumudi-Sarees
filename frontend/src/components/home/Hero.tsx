"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";
import { optimizedCloudinaryUrl } from "@/lib/cloudinary";

const DEFAULT_SLIDES = [
  {
    _id: "default-1",
    title: "Celebrate Every Occasion With Elegance",
    subtitle: "Discover handcrafted Banarasi, Kanjivaram, Silk and Designer Sarees curated specially for weddings, festivals and special moments.",
    buttonText: "Shop Now",
    buttonLink: "/shop",
    image: {
      url: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1920&q=80",
      public_id: "",
    },
  },
  {
    _id: "default-2",
    title: "Heritage Weaves & Timeless Classics",
    subtitle: "Experience luxury in every thread with our handloom Banarasi silk collection. Direct from authentic artisans.",
    buttonText: "Explore Collection",
    buttonLink: "/collections",
    image: {
      url: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1920&q=80",
      public_id: "",
    },
  },
];

export default function Hero() {
  const { data: slides = [], isLoading } = useQuery({
    queryKey: ["home-backgrounds"],
    queryFn: async () => {
      const res = await api.get("/home-backgrounds");
      return res.data;
    },
  });

  const activeSlides = slides.length > 0 ? slides : DEFAULT_SLIDES;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Swipe support state
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % activeSlides.length);
  }, [activeSlides.length]);

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + activeSlides.length) % activeSlides.length);
  }, [activeSlides.length]);

  // Autoplay functionality: slide every 2.5 seconds, pause on hover
  useEffect(() => {
    if (isHovered || activeSlides.length <= 1) return;
    const interval = setInterval(handleNext, 2500);
    return () => clearInterval(interval);
  }, [handleNext, isHovered, activeSlides.length]);

  // Keyboard navigation accessibility
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        handlePrev();
      } else if (e.key === "ArrowRight") {
        handleNext();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handlePrev, handleNext]);

  // Touch Swipe handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const minSwipeDistance = 50;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      handleNext();
    } else if (isRightSwipe) {
      handlePrev();
    }
  };

  if (isLoading) {
    return (
      <div className="relative w-full aspect-[16/9] min-h-[500px] lg:min-h-[700px] bg-gray-100 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const currentSlide = activeSlides[currentIndex];

  return (
    <section
      className="relative w-full aspect-[16/9] min-h-[500px] lg:min-h-[700px] overflow-hidden bg-black select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      aria-roledescription="carousel"
      aria-label="Homepage background slider"
    >
      {/* Dynamic Slide Backgrounds - GPU Accelerated Cross Fade */}
      <div className="absolute inset-0 z-0">
        <AnimatePresence mode="popLayout">
          <motion.div
            key={currentSlide._id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="absolute inset-0 w-full h-full"
            style={{ willChange: "opacity" }}
          >
            <Image
              src={currentSlide.image.url}
              alt={currentSlide.title || "Kaumudi Premium Sarees Collection"}
              fill
              priority={currentIndex === 0}
              loading={currentIndex === 0 ? "eager" : "lazy"}
              className="object-cover"
              sizes="100vw"
              unoptimized
            />
            {/* Dark overlay for text contrast */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/45 to-transparent" />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Slide Text Content & Layout Overlay */}
      <div className="absolute inset-0 z-10 flex items-center justify-start">
        <div className="container-custom w-full text-white">
          <div className="max-w-2xl px-4 md:px-0 space-y-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-6"
              >
                <span className="text-accent-gold font-semibold uppercase tracking-[6px] text-xs inline-block">
                  Premium Saree Collection
                </span>

                <h1 className="text-4xl md:text-7xl font-serif font-light leading-tight tracking-wide drop-shadow-md">
                  {currentSlide.title || "Celebrate Every Occasion"}
                </h1>

                <p className="text-sm md:text-lg text-gray-200 drop-shadow-sm font-light max-w-xl leading-relaxed">
                  {currentSlide.subtitle ||
                    "Discover handcrafted Banarasi, Kanjivaram, Silk and Designer Sarees curated specially for weddings, festivals and special moments."}
                </p>

                <div className="flex flex-wrap gap-4 pt-2">
                  <Link
                    href={currentSlide.buttonLink || "/shop"}
                    className="bg-primary hover:bg-primary-dark text-white px-8 py-3.5 rounded-full font-semibold transition hover:scale-[1.03] duration-300 border border-primary text-xs uppercase tracking-widest shadow-lg shadow-primary/20 cursor-pointer"
                  >
                    {currentSlide.buttonText || "Shop Now"}
                  </Link>

                  <Link
                    href="/collections"
                    className="border border-white/50 text-white px-8 py-3.5 rounded-full font-semibold hover:bg-white hover:text-primary hover:border-white transition hover:scale-[1.03] duration-300 text-xs uppercase tracking-widest cursor-pointer"
                  >
                    Explore Collection
                  </Link>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Manual Navigation Controls (Arrows) */}
      {activeSlides.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 backdrop-blur-sm text-white flex items-center justify-center transition hover:scale-105 active:scale-95 cursor-pointer opacity-0 md:group-hover:opacity-100 duration-300 focus:opacity-100 outline-none"
            aria-label="Previous slide"
          >
            <ChevronLeft size={24} />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 backdrop-blur-sm text-white flex items-center justify-center transition hover:scale-105 active:scale-95 cursor-pointer opacity-0 md:group-hover:opacity-100 duration-300 focus:opacity-100 outline-none"
            aria-label="Next slide"
          >
            <ChevronRight size={24} />
          </button>
        </>
      )}

      {/* Pagination Dot Indicators */}
      {activeSlides.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {activeSlides.map((_: any, idx: number) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`h-2 rounded-full transition-all cursor-pointer outline-none ${
                idx === currentIndex ? "w-6 bg-accent-gold" : "w-2 bg-white/50 hover:bg-white/80"
              }`}
              aria-label={`Go to slide ${idx + 1}`}
              aria-current={idx === currentIndex ? "true" : "false"}
            />
          ))}
        </div>
      )}
    </section>
  );
}
