"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { useProducts } from "@/hooks/useProducts";

import ProductTable from "@/components/admin/products/ProductTable";
import ProductModal from "@/components/admin/products/ProductModal";
import DeleteProductDialog from "@/components/admin/products/DeleteProductDialog";

import { Product } from "@/types/product";

export default function AdminProductsPage() {
  const { data, isLoading } = useProducts();

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [openModal, setOpenModal] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-primary">Products</h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage your saree catalog — {data?.length || 0} products
          </p>
        </div>

        <button
          onClick={() => {
            setSelectedProduct(null);
            setOpenModal(true);
          }}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-xl font-medium hover:bg-primary-dark transition cursor-pointer hover:scale-[1.02] duration-300 shadow-md"
        >
          <Plus size={16} />
          Add Product
        </button>
      </div>

      {isLoading ? (
        <div className="bg-white rounded-2xl shadow-sm p-6 space-y-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <ProductTable
          products={data || []}
          onEdit={(p) => {
            setSelectedProduct(p);
            setOpenModal(true);
          }}
          onDelete={(p) => {
            setSelectedProduct(p);
            setOpenDelete(true);
          }}
        />
      )}

      <ProductModal open={openModal} setOpen={setOpenModal} product={selectedProduct} />

      <DeleteProductDialog
        open={openDelete}
        setOpen={setOpenDelete}
        product={selectedProduct}
      />
    </div>
  );
}
