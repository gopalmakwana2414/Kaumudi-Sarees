"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { Pencil, Trash2, Search, Star, TrendingUp, Sparkles } from "lucide-react";
import { Product } from "@/types/product";

interface Props {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}

export default function ProductTable({ products, onEdit, onDelete }: Props) {
  const [search, setSearch] = useState("");
  const [stockFilter, setStockFilter] = useState<"all" | "inStock" | "lowStock" | "outOfStock">(
    "all"
  );

  const filtered = useMemo(() => {
    let result = products;

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.sku?.toLowerCase().includes(q) ||
          p.category?.name?.toLowerCase().includes(q)
      );
    }

    if (stockFilter === "inStock") {
      result = result.filter((p) => p.stock > 10);
    } else if (stockFilter === "lowStock") {
      result = result.filter((p) => p.stock > 0 && p.stock <= 10);
    } else if (stockFilter === "outOfStock") {
      result = result.filter((p) => p.stock === 0);
    }

    return result;
  }, [products, search, stockFilter]);

  const lowStockCount = products.filter((p) => p.stock > 0 && p.stock <= 10).length;
  const outOfStockCount = products.filter((p) => p.stock === 0).length;

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px] max-w-sm">
          <Search size={15} className="absolute left-3 top-3 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, SKU, category..."
            className="w-full border pl-9 pr-3 py-2.5 rounded-xl text-sm outline-none focus:border-primary transition"
          />
        </div>

        <div className="flex gap-2 text-sm">
          {[
            { key: "all", label: `All (${products.length})` },
            { key: "inStock", label: "In Stock" },
            { key: "lowStock", label: `Low Stock (${lowStockCount})` },
            { key: "outOfStock", label: `Out of Stock (${outOfStockCount})` },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setStockFilter(f.key as any)}
              className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
                stockFilter === f.key
                  ? "bg-primary text-white shadow-sm shadow-primary/15"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm overflow-x-auto border border-gray-100">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="p-4">Image</th>
              <th className="p-4">Product</th>
              <th className="p-4">SKU</th>
              <th className="p-4">Category</th>
              <th className="p-4">Price</th>
              <th className="p-4">Stock</th>
              <th className="p-4">Tags</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-16 text-gray-400">
                  {products.length === 0
                    ? "No products yet. Click 'Add Product' to create your first one."
                    : "No products match your search/filter."}
                </td>
              </tr>
            ) : (
              filtered.map((p) => {
                const discount = Math.round(
                  ((p.originalPrice - p.salePrice) / p.originalPrice) * 100
                );

                return (
                  <tr key={p._id} className="border-t border-gray-100 hover:bg-gray-50/50 transition">
                    <td className="p-4">
                      {p.thumbnail?.url ? (
                        <Image
                          src={p.thumbnail.url}
                          alt={p.name}
                          width={56}
                          height={70}
                          className="rounded-lg object-cover w-14 h-[70px]"
                        />
                      ) : (
                        <div className="w-14 h-[70px] bg-gray-100 rounded-lg flex items-center justify-center text-[10px] text-gray-400">
                          No Image
                        </div>
                      )}
                    </td>

                    <td className="p-4 font-medium max-w-[220px]">
                      <p className="line-clamp-2">{p.name}</p>
                    </td>

                    <td className="p-4 text-gray-500 font-mono text-xs">{p.sku}</td>

                    <td className="p-4 text-gray-500">{p.category?.name || "—"}</td>

                    <td className="p-4">
                      <p className="font-semibold text-primary">
                        ₹{p.salePrice.toLocaleString()}
                      </p>
                      {discount > 0 && (
                        <p className="text-xs text-gray-400 line-through">
                          ₹{p.originalPrice.toLocaleString()}
                        </p>
                      )}
                    </td>

                    <td className="p-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                          p.stock === 0
                            ? "bg-red-100 text-red-600"
                            : p.stock <= 10
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {p.stock === 0 ? "Out of stock" : `${p.stock} units`}
                      </span>
                    </td>

                    <td className="p-4">
                      <div className="flex gap-1.5">
                        {p.featured && (
                          <span title="Featured">
                            <Sparkles size={14} className="text-purple-500" />
                          </span>
                        )}
                        {p.bestseller && (
                          <span title="Bestseller">
                            <TrendingUp size={14} className="text-blue-500" />
                          </span>
                        )}
                        {p.newArrival && (
                          <span title="New Arrival">
                            <Star size={14} className="text-green-500" />
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => onEdit(p)}
                          className="text-blue-500 hover:text-blue-700 transition"
                          title="Edit product"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => onDelete(p)}
                          className="text-red-500 hover:text-red-700 transition"
                          title="Delete product"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
