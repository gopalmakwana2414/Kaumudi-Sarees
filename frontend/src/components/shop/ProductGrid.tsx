import ProductCard from "./ProductCard";

const products = [
  {
    id: 1,
    name: "Banarasi Silk Saree",
    image:
      "https://images.unsplash.com/photo-1610030469983-98e550d6193c",
    price: 2499,
    originalPrice: 3499,
  },
  {
    id: 2,
    name: "Wedding Saree",
    image:
      "https://images.unsplash.com/photo-1594736797933-d0401ba2fe65",
    price: 3999,
    originalPrice: 5499,
  },
  {
    id: 3,
    name: "Designer Saree",
    image:
      "https://images.unsplash.com/photo-1583391733956-6c78276477e1",
    price: 2999,
    originalPrice: 4499,
  },
  {
    id: 4,
    name: "Festive Collection",
    image:
      "https://images.unsplash.com/photo-1610189012964-dcf84a5d4f70",
    price: 1899,
    originalPrice: 2999,
  },
];

export default function ProductGrid() {
  return (
    <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          {...product}
        />
      ))}
    </div>
  );
}