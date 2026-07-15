"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { X, ShoppingCart, Heart, Star, Shield } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Product } from "@/types/product";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { toast } from "sonner";

interface QuickViewModalProps {
  product: Product | null;
  onClose: () => void;
}

export default function QuickViewModal({ product, onClose }: QuickViewModalProps) {
  const router = useRouter();
  const addToCart = useCartStore((s) => s.addToCart);
  const { items: wishlist, toggleWishlist } = useWishlistStore();
  const [isAdding, setIsAdding] = useState(false);

  // Esc key closure
  useEffect(() => {
    if (!product) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    // Lock scroll
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [product, onClose]);

  if (!product) return null;

  const isWishlisted = wishlist.includes(product._id);
  const discount = Math.round(
    ((product.originalPrice - product.salePrice) / product.originalPrice) * 100
  );

  const handleAddToCart = () => {
    setIsAdding(true);
    setTimeout(() => {
      addToCart(product);
      toast.success(`${product.name} added to cart!`);
      setIsAdding(false);
    }, 600);
  };

  const handleBuyNow = () => {
    addToCart(product);
    onClose();
    router.push("/checkout");
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 overflow-y-auto">
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal Content container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="relative bg-white w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl z-10 border border-gray-100 flex flex-col md:flex-row min-h-[500px]"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 bg-white/80 hover:bg-white text-gray-500 hover:text-black p-2 rounded-full border border-gray-100 shadow transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>

          {/* Left panel: Product Image */}
          <div className="w-full md:w-1/2 relative bg-[#fafafa] flex items-center justify-center min-h-[350px] md:min-h-full aspect-[4/5] md:aspect-auto">
            <Image
              src={product.thumbnail.url}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
            {discount > 0 && (
              <span className="absolute top-6 left-6 bg-primary text-white text-[11px] font-semibold px-3 py-1 rounded-full tracking-wider shadow">
                {discount}% OFF
              </span>
            )}
            {product.newArrival && (
              <span className="absolute top-6 left-24 bg-accent-gold text-white text-[11px] font-semibold px-3 py-1 rounded-full tracking-wider shadow">
                NEW
              </span>
            )}
          </div>

          {/* Right panel: Details */}
          <div className="w-full md:w-1/2 p-6 md:p-10 flex flex-col justify-between overflow-y-auto max-h-[90vh] md:max-h-[650px]">
            <div className="space-y-6">
              {/* Category & Stars */}
              <div className="flex justify-between items-center">
                {product.category && (
                  <span className="text-[11px] text-primary font-bold uppercase tracking-[2px]">
                    {product.category.name}
                  </span>
                )}
                <div className="flex items-center gap-1.5 text-accent-gold">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        size={14}
                        className={
                          s <= Math.round(product.averageRating || 5)
                            ? "fill-current text-accent-gold"
                            : "text-gray-200"
                        }
                      />
                    ))}
                  </div>
                  <span className="text-xs text-gray-500 font-medium">
                    ({product.averageRating || 5}.0)
                  </span>
                </div>
              </div>

              {/* Title & Price */}
              <div className="space-y-3">
                <h2 className="text-2xl md:text-3xl font-serif text-gray-900 leading-tight">
                  {product.name}
                </h2>
                <div className="flex items-baseline gap-3">
                  <span className="text-2xl font-bold text-primary">
                    ₹{product.salePrice.toLocaleString()}
                  </span>
                  {discount > 0 && (
                    <span className="line-through text-gray-400 text-sm">
                      ₹{product.originalPrice.toLocaleString()}
                    </span>
                  )}
                </div>
              </div>

              {/* Attributes (Fabric / Craft / Color) */}
              <div className="grid grid-cols-2 gap-4 border-y border-gray-100 py-4 text-sm">
                <div>
                  <span className="text-gray-400 block text-xs uppercase tracking-wider mb-1">Fabric</span>
                  <span className="font-medium text-gray-800">{product.fabric || "Pure Silk"}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-xs uppercase tracking-wider mb-1">Color</span>
                  <span className="font-medium text-gray-800">{product.color || "Multicolor"}</span>
                </div>
              </div>

              {/* Short Description */}
              <div className="space-y-2">
                <span className="text-gray-400 block text-xs uppercase tracking-wider">Overview</span>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {product.shortDescription ||
                    "Indulge in the luxury of traditional craftsmanship. This masterpiece features intricate gold zari borders and a rich fabric weave, designed to make you stand out at every celebration."}
                </p>
              </div>

              {/* Stock Status & Safe Purchase Badges */}
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5 text-xs text-green-700 font-semibold bg-green-50 px-2.5 py-1 rounded-full">
                  <span className="w-1.5 h-1.5 bg-green-600 rounded-full animate-ping" />
                  In Stock
                </span>
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <Shield size={12} />
                  100% Quality Assured
                </span>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col gap-3 mt-8">
              <div className="flex gap-3">
                {/* Add to Cart */}
                <button
                  onClick={handleAddToCart}
                  disabled={isAdding}
                  className="flex-1 bg-primary hover:bg-primary-dark text-white py-3.5 rounded-full flex items-center justify-center gap-2 font-medium text-sm transition-all duration-300 transform hover:scale-[1.01] active:scale-95 disabled:opacity-70 cursor-pointer shadow-lg shadow-primary/10"
                >
                  <ShoppingCart size={16} className={isAdding ? "animate-bounce" : ""} />
                  {isAdding ? "Adding..." : "Add to Cart"}
                </button>

                {/* Wishlist button */}
                <button
                  onClick={() => {
                    toggleWishlist(product._id);
                    toast.success(
                      isWishlisted ? "Removed from wishlist" : "Added to wishlist!"
                    );
                  }}
                  className={`border rounded-full p-3.5 flex items-center justify-center transition-all duration-300 cursor-pointer ${
                    isWishlisted
                      ? "text-red-500 border-red-200 bg-red-50/50 scale-105"
                      : "border-gray-200 text-gray-500 hover:text-red-500 hover:border-red-200"
                  }`}
                  aria-label="Toggle wishlist"
                >
                  <Heart size={18} fill={isWishlisted ? "currentColor" : "none"} />
                </button>
              </div>

              {/* Direct Checkout & view details link */}
              <div className="flex items-center justify-between gap-4 mt-2">
                <button
                  onClick={handleBuyNow}
                  className="text-xs text-primary font-bold uppercase tracking-widest hover:underline cursor-pointer"
                >
                  Buy It Now
                </button>
                <button
                  onClick={() => {
                    onClose();
                    router.push(`/product/${product.slug}`);
                  }}
                  className="text-xs text-gray-500 hover:text-black font-semibold hover:underline cursor-pointer"
                >
                  View Full Details →
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
