"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Pencil, Trash2, Plus, X } from "lucide-react";
import api from "@/lib/api";

export default function AdminCategoriesPage() {
  const queryClient = useQueryClient();

  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", description: "" });
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await api.get("/categories");
      return res.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof form) => {
      const res = await api.post("/categories", data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Category created successfully!");
      setShowForm(false);
      setForm({ name: "", description: "" });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to create category");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/categories/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Category deleted");
      setDeleteId(null);
    },
    onError: () => {
      toast.error("Failed to delete category");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("Category name is required");
      return;
    }
    createMutation.mutate(form);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#b8860b]">Categories</h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage saree categories
          </p>
        </div>
        <button
          onClick={() => {
            setShowForm(true);
            setEditId(null);
            setForm({ name: "", description: "" });
          }}
          className="flex items-center gap-2 bg-[#d4af37] text-white px-4 py-2 rounded-xl hover:bg-[#b8860b] transition"
        >
          <Plus size={16} />
          Add Category
        </button>
      </div>

      {/* Add Form */}
      {showForm && (
        <div className="bg-white rounded-2xl border shadow-sm p-6">
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-lg font-semibold">
              {editId ? "Edit Category" : "New Category"}
            </h2>
            <button
              onClick={() => setShowForm(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Category Name <span className="text-red-500">*</span>
              </label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Banarasi Silk"
                className="w-full border p-3 rounded-xl outline-none focus:border-[#d4af37] transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Description
              </label>
              <input
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                placeholder="Optional description"
                className="w-full border p-3 rounded-xl outline-none focus:border-[#d4af37] transition"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={createMutation.isPending}
                className="bg-[#d4af37] text-white px-6 py-2.5 rounded-xl hover:bg-[#b8860b] transition disabled:opacity-60"
              >
                {createMutation.isPending ? "Saving..." : "Save Category"}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="border px-6 py-2.5 rounded-xl hover:bg-gray-50 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Categories Table */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p>No categories yet. Add your first category above.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left">
              <tr>
                <th className="p-4">#</th>
                <th className="p-4">Name</th>
                <th className="p-4">Slug</th>
                <th className="p-4">Description</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat: any, index: number) => (
                <tr key={cat._id} className="border-t hover:bg-gray-50">
                  <td className="p-4 text-gray-400">{index + 1}</td>
                  <td className="p-4 font-semibold">{cat.name}</td>
                  <td className="p-4 text-gray-500 font-mono text-xs">
                    {cat.slug}
                  </td>
                  <td className="p-4 text-gray-500">
                    {cat.description || "—"}
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setDeleteId(cat._id);
                        }}
                        className="text-red-500 hover:text-red-700 transition"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Delete Confirm Modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="text-lg font-bold mb-3">Delete Category?</h3>
            <p className="text-gray-500 text-sm mb-6">
              This will permanently delete this category. Products assigned to
              this category may be affected.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => deleteMutation.mutate(deleteId)}
                disabled={deleteMutation.isPending}
                className="flex-1 bg-red-500 text-white py-2.5 rounded-xl hover:bg-red-600 transition disabled:opacity-60"
              >
                {deleteMutation.isPending ? "Deleting..." : "Yes, Delete"}
              </button>
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 border py-2.5 rounded-xl hover:bg-gray-50 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
