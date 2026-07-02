"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Trash2, X, Image as ImageIcon, Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import api from "@/lib/api";

const POSITIONS = [
  { value: "hero", label: "Hero (Homepage Top)" },
  { value: "promo", label: "Promo Strip" },
  { value: "category", label: "Category Banner" },
];

export default function AdminBannersPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: "",
    subtitle: "",
    link: "/shop",
    buttonText: "Shop Now",
    position: "hero",
    order: 0,
  });

  const { data: banners = [], isLoading } = useQuery({
    queryKey: ["admin-banners"],
    queryFn: async () => {
      const res = await api.get("/banners/admin/all");
      return res.data;
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!imageFile) throw new Error("Please select a banner image");

      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("subtitle", form.subtitle);
      formData.append("link", form.link);
      formData.append("buttonText", form.buttonText);
      formData.append("position", form.position);
      formData.append("order", String(form.order));
      formData.append("image", imageFile);

      const res = await api.post("/banners", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-banners"] });
      toast.success("Banner created successfully!");
      setShowForm(false);
      setImageFile(null);
      setImagePreview(null);
      setForm({
        title: "",
        subtitle: "",
        link: "/shop",
        buttonText: "Shop Now",
        position: "hero",
        order: 0,
      });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || err.message || "Failed to create banner");
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.patch(`/banners/${id}/toggle`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-banners"] });
      toast.success("Banner status updated");
    },
    onError: () => toast.error("Failed to update banner"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/banners/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-banners"] });
      toast.success("Banner deleted");
      setDeleteId(null);
    },
    onError: () => toast.error("Failed to delete banner"),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return toast.error("Title is required");
    if (!imageFile) return toast.error("Please select an image");
    createMutation.mutate();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#b8860b]">Banners</h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage homepage hero and promotional banners
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-[#d4af37] text-white px-4 py-2 rounded-xl hover:bg-[#b8860b] transition"
        >
          <Plus size={16} />
          Add Banner
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-2xl border shadow-sm p-6">
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-lg font-semibold">New Banner</h2>
            <button onClick={() => setShowForm(false)} className="text-gray-400">
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Banner Image * (Recommended: 1920×800px)
              </label>
              <label className="flex flex-col items-center justify-center border-2 border-dashed rounded-2xl h-48 cursor-pointer hover:border-[#d4af37] transition overflow-hidden relative">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center text-gray-400">
                    <ImageIcon size={32} className="mx-auto mb-2" />
                    <p className="text-sm">Click to upload banner image</p>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title *</label>
                <input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Wedding Collection"
                  className="w-full border p-3 rounded-xl outline-none focus:border-[#d4af37]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Position</label>
                <select
                  value={form.position}
                  onChange={(e) => setForm({ ...form, position: e.target.value })}
                  className="w-full border p-3 rounded-xl outline-none focus:border-[#d4af37]"
                >
                  {POSITIONS.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Subtitle</label>
                <input
                  value={form.subtitle}
                  onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                  placeholder="Starting from ₹2,999"
                  className="w-full border p-3 rounded-xl outline-none focus:border-[#d4af37]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Link URL</label>
                <input
                  value={form.link}
                  onChange={(e) => setForm({ ...form, link: e.target.value })}
                  placeholder="/shop"
                  className="w-full border p-3 rounded-xl outline-none focus:border-[#d4af37]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Button Text</label>
                <input
                  value={form.buttonText}
                  onChange={(e) => setForm({ ...form, buttonText: e.target.value })}
                  placeholder="Shop Now"
                  className="w-full border p-3 rounded-xl outline-none focus:border-[#d4af37]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Display Order
                </label>
                <input
                  type="number"
                  value={form.order}
                  onChange={(e) =>
                    setForm({ ...form, order: Number(e.target.value) })
                  }
                  className="w-full border p-3 rounded-xl outline-none focus:border-[#d4af37]"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={createMutation.isPending}
                className="bg-[#d4af37] text-white px-6 py-2.5 rounded-xl hover:bg-[#b8860b] transition disabled:opacity-60"
              >
                {createMutation.isPending ? "Uploading..." : "Create Banner"}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="border px-6 py-2.5 rounded-xl hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Banner Grid */}
      {isLoading ? (
        <div className="grid md:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-56 bg-gray-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : banners.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm text-center py-16 text-gray-400">
          <ImageIcon size={48} className="mx-auto mb-3 opacity-30" />
          <p>No banners yet. Add your first banner above.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {banners.map((banner: any) => (
            <div
              key={banner._id}
              className="bg-white rounded-2xl shadow-sm border overflow-hidden"
            >
              <div className="relative h-40">
                <Image
                  src={banner.image.url}
                  alt={banner.title}
                  fill
                  className="object-cover"
                />
                <span
                  className={`absolute top-3 left-3 text-xs font-medium px-2.5 py-1 rounded-full ${
                    banner.isActive
                      ? "bg-green-500 text-white"
                      : "bg-gray-500 text-white"
                  }`}
                >
                  {banner.isActive ? "Active" : "Inactive"}
                </span>
                <span className="absolute top-3 right-3 bg-black/50 text-white text-xs px-2.5 py-1 rounded-full capitalize">
                  {banner.position}
                </span>
              </div>
              <div className="p-4">
                <h3 className="font-semibold">{banner.title}</h3>
                {banner.subtitle && (
                  <p className="text-gray-500 text-sm mt-1">{banner.subtitle}</p>
                )}
                <div className="flex items-center gap-2 mt-4">
                  <button
                    onClick={() => toggleMutation.mutate(banner._id)}
                    className="flex items-center gap-1.5 text-xs border px-3 py-1.5 rounded-lg hover:bg-gray-50 transition"
                  >
                    {banner.isActive ? <EyeOff size={13} /> : <Eye size={13} />}
                    {banner.isActive ? "Deactivate" : "Activate"}
                  </button>
                  <button
                    onClick={() => setDeleteId(banner._id)}
                    className="flex items-center gap-1.5 text-xs border border-red-200 text-red-500 px-3 py-1.5 rounded-lg hover:bg-red-50 transition"
                  >
                    <Trash2 size={13} />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirm */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="text-lg font-bold mb-3">Delete Banner?</h3>
            <p className="text-gray-500 text-sm mb-6">
              This banner will be permanently removed from your website.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => deleteMutation.mutate(deleteId)}
                disabled={deleteMutation.isPending}
                className="flex-1 bg-red-500 text-white py-2.5 rounded-xl hover:bg-red-600 transition disabled:opacity-60"
              >
                {deleteMutation.isPending ? "Deleting..." : "Delete"}
              </button>
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 border py-2.5 rounded-xl hover:bg-gray-50"
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
