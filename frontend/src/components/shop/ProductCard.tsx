import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ProductCardProps {
  name: string;
  image: string;
  price: number;
  originalPrice: number;
}

export default function ProductCard({
  name,
  image,
  price,
  originalPrice,
}: ProductCardProps) {
  return (
    <Card className="overflow-hidden group cursor-pointer">
      <div className="relative h-80 overflow-hidden">
        <Image
          src={image}
          alt={name}
          fill
          className="object-cover transition duration-500 group-hover:scale-110"
        />

        <Badge className="absolute top-3 left-3 bg-primary">
          New
        </Badge>
      </div>

      <div className="p-4">
        <h3 className="font-medium mb-2">
          {name}
        </h3>

        <div className="flex items-center gap-3">
          <span className="text-lg font-bold text-primary">
            ₹{price}
          </span>

          <span className="line-through text-gray-400">
            ₹{originalPrice}
          </span>
        </div>
      </div>
    </Card>
  );
}