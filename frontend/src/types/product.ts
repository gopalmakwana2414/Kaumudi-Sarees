export interface Product {
  _id: string;

  name: string;
  slug: string;

  shortDescription: string;
  description: string;

  category: {
    _id: string;
    name: string;
  };

  sku: string;

  originalPrice: number;
  salePrice: number;

  stock: number;

  fabric: string;
  color: string;
  occasion: string;

  blouseIncluded: boolean;

  thumbnail: {
    url: string;
    public_id: string;
  };

  images: {
    url: string;
    public_id: string;
  }[];

  featured: boolean;
  bestseller: boolean;
  newArrival: boolean;

  metaTitle: string;
  metaDescription: string;

  averageRating: number;
  numReviews: number;
}