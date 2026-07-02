"use client";

import { toast } from "sonner";
import { AlertTriangle } from "lucide-react";

import { useDeleteProduct } from "@/hooks/useProductMutations";
import { Product } from "@/types/product";

interface Props {
  open: boolean;
  setOpen: (value: boolean) => void;
  product: Product | null;
}

export default function DeleteProductDialog({ open, setOpen, product }: Props) {
  const deleteProduct = useDeleteProduct();

  if (!open || !product) return null;

  const handleDelete = async () => {
    try {
      await deleteProduct.mutateAsync(product._id);
      toast.success("Product deleted successfully");
      setOpen(false);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to delete product");
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onMouseDown={() => setOpen(false)}
    >
      <div
        onMouseDown={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-red-100 text-red-500 p-2.5 rounded-full">
            <AlertTriangle size={20} />
          </div>
          <h3 className="text-lg font-bold">Delete Product?</h3>
        </div>

        <p className="text-gray-500 text-sm mb-2">
          You're about to permanently delete:
        </p>
        <p className="font-semibold text-sm mb-6 bg-gray-50 px-3 py-2 rounded-lg">
          {product.name}
        </p>
        <p className="text-gray-400 text-xs mb-6">
          This action cannot be undone. All product images will also be removed.
        </p>

        <div className="flex gap-3">
          <button
            onClick={handleDelete}
            disabled={deleteProduct.isPending}
            className="flex-1 bg-red-500 text-white py-2.5 rounded-xl font-medium hover:bg-red-600 transition disabled:opacity-60"
          >
            {deleteProduct.isPending ? "Deleting..." : "Yes, Delete"}
          </button>
          <button
            onClick={() => setOpen(false)}
            className="flex-1 border py-2.5 rounded-xl font-medium hover:bg-gray-50 transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
