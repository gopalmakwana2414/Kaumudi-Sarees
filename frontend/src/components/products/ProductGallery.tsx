"use client";

import { useState } from "react";

interface Props {
  images: string[];
}

export default function ProductGallery({
  images,
}: Props) {
  const [selectedImage, setSelectedImage] =
    useState(images[0]);

  return (
    <div>
      <div className="border rounded-2xl overflow-hidden">
        <img
          src={selectedImage}
          alt="Product"
          className="w-full h-[650px] object-cover"
        />
      </div>

      <div className="grid grid-cols-4 gap-3 mt-4">
        {images.map((image) => (
          <button
            key={image}
            onClick={() =>
              setSelectedImage(image)
            }
          >
            <img
              src={image}
              alt=""
              className="w-full h-28 object-cover rounded-xl border"
            />
          </button>
        ))}
      </div>
    </div>
  );
}