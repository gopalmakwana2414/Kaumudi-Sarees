import { Product } from "@/types/product";

export const dummyProducts: Product[] = [
  {
    _id: "1",
    name: "Royal Banarasi Saree",
    slug: "royal-banarasi-saree",

    shortDescription:
      "Premium Banarasi Silk Saree",

    description:
      "Beautiful handcrafted Banarasi silk saree suitable for weddings and festive occasions.",

    category: {
      _id: "1",
      name: "Banarasi",
    },

    sku: "BAN001",

    originalPrice: 7999,

    salePrice: 5999,

    stock: 20,

    fabric: "Silk",

    color: "Maroon",

    occasion: "Wedding",

    thumbnail: {
      url: "/products/p1.jpg",
      public_id: "",
    },

    images: [
      {
        url: "/products/p1.jpg",
        public_id: "",
      },
    ],

    featured: true,

    bestseller: true,

    newArrival: true,

    averageRating: 4.8,

    numReviews: 120,
  },

  {
    _id: "2",

    name: "Designer Kanjivaram Saree",

    slug: "designer-kanjivaram-saree",

    shortDescription:
      "Traditional South Indian Design",

    description:
      "Elegant Kanjivaram silk saree with luxurious zari work.",

    category: {
      _id: "2",
      name: "Kanjivaram",
    },

    sku: "KAN001",

    originalPrice: 9999,

    salePrice: 7499,

    stock: 15,

    fabric: "Silk",

    color: "Green",

    occasion: "Festival",

    thumbnail: {
      url: "/products/p2.jpg",
      public_id: "",
    },

    images: [
      {
        url: "/products/p2.jpg",
        public_id: "",
      },
    ],

    featured: true,

    bestseller: false,

    newArrival: true,

    averageRating: 4.7,

    numReviews: 85,
  },
];