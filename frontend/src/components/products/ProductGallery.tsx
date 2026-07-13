"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  images: string[];
  productName: string;
}

export default function ProductGallery({
  images,
  productName,
}: Props) {
  const [selectedImage, setSelectedImage] = useState(images[0]);

  return (
    <div>
      <div className="border border-gray-100 rounded-3xl overflow-hidden relative bg-gray-50 h-[650px]">
        <AnimatePresence mode="wait">
          <motion.img
            key={selectedImage}
            src={selectedImage}
            alt={`${productName} Saree - Main View`}
            fetchPriority="high"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full h-full object-cover absolute inset-0"
          />
        </AnimatePresence>
      </div>

      <div className="grid grid-cols-4 gap-3 mt-4">
        {images.map((image, index) => (
          <motion.button
            key={image}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setSelectedImage(image)}
            className="outline-none focus:ring-2 focus:ring-[#d4af37] rounded-xl overflow-hidden cursor-pointer"
            aria-label={`View ${productName} image ${index + 1}`}
          >
            <img
              src={image}
              alt={`${productName} Saree View ${index + 1}`}
              loading="lazy"
              className={`w-full h-28 object-cover rounded-xl border transition-all duration-300 ${
                selectedImage === image
                  ? "border-[#d4af37] opacity-100"
                  : "border-gray-200 opacity-60 hover:opacity-100"
              }`}
            />
          </motion.button>
        ))}
      </div>
    </div>
  );
}