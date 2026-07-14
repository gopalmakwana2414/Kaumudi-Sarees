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
  // When set, the form is in "replace/edit" mode for this banner instead
  // of creating a new one — submits via PATCH, and keeps the existing
  // Cloudinary image unless the admin picks a new file.
  const [editingBanner, setEditingBanner] = useState<any | null>(null);

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

  const openCreateForm = () => {
    setEditingBanner(null);
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
    setShowForm(true);
  };

  const openEditForm = (banner: any) => {
    setEditingBanner(banner);
    setImageFile(null);
    setImagePreview(banner.image?.url || null); // preview shows current image until replaced
    setForm({
      title: banner.title || "",
      subtitle: banner.subtitle || "",
      link: banner.link || "/shop",
      buttonText: banner.buttonText || "Shop Now",
      position: banner.position || "hero",
      order: banner.order || 0,
    });
    setShowForm(true);
  };

  const updateMutation = useMutation({
    mutationFn: async () => {
      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("subtitle", form.subtitle);
      formData.append("link", form.link);
      formData.append("buttonText", form.buttonText);
      formData.append("position", form.position);
      formData.append("order", String(form.order));
      // Only attach a file if the admin actually chose a replacement —
      // otherwise the backend leaves the existing Cloudinary image as-is.
      if (imageFile) formData.append("image", imageFile);

      const res = await api.patch(`/banners/${editingBanner._id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-banners"] });
      toast.success("Banner updated successfully!");
      setShowForm(false);
      setEditingBanner(null);
      setImageFile(null);
      setImagePreview(null);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || err.message || "Failed to update banner");
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

    if (editingBanner) {
      updateMutation.mutate();
    } else {
      if (!imageFile) return toast.error("Please select an image");
      createMutation.mutate();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-primary">Banners</h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage homepage hero and promotional banners
          </p>
        </div>
        <button
          onClick={openCreateForm}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-xl hover:bg-primary-dark transition cursor-pointer hover:scale-[1.02] duration-300 shadow-md"
        >
          <Plus size={16} />
          Add Banner
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 shadow-[0_20px_50px_rgba(128,0,32,0.02)]">
          <div className="flex justify-between items-center mb-5 border-b border-gray-50 pb-3">
            <h2 className="text-lg font-semibold text-gray-800">
              {editingBanner ? "Edit Banner" : "New Banner"}
            </h2>
            <button
              onClick={() => {
                setShowForm(false);
                setEditingBanner(null);
              }}
              className="text-gray-400 hover:text-gray-600 cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-600">
                Banner Image {editingBanner ? "" : "*"} (Recommended: 1920×800px)
              </label>
              <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-2xl h-48 cursor-pointer hover:border-primary transition overflow-hidden relative bg-gray-50">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center text-gray-400">
                    <ImageIcon size={32} className="mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">Click to upload banner image</p>
                  </div>
                )}
                {editingBanner && (
                  <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2.5 py-1 rounded-full">
                    Click to replace image
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
                <label className="block text-sm font-medium mb-1 text-gray-600">Title *</label>
                <input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Wedding Collection"
                  className="w-full border border-gray-200 p-3 rounded-xl outline-none focus:border-primary text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-600">Position</label>
                <select
                  value={form.position}
                  onChange={(e) => setForm({ ...form, position: e.target.value })}
                  className="w-full border border-gray-200 p-3 rounded-xl outline-none focus:border-primary text-sm"
                >
                  {POSITIONS.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-400 mt-1.5 font-medium">
                  "Hero" is the large banner at the very top of your homepage.
                  "Promo"/"Category" banners appear elsewhere and won't show there.
                </p>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1 text-gray-600">Subtitle</label>
                <input
                  value={form.subtitle}
                  onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                  placeholder="Starting from ₹2,999"
                  className="w-full border border-gray-200 p-3 rounded-xl outline-none focus:border-primary text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-600">Link URL</label>
                <input
                  value={form.link}
                  onChange={(e) => setForm({ ...form, link: e.target.value })}
                  placeholder="/shop"
                  className="w-full border border-gray-200 p-3 rounded-xl outline-none focus:border-primary text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-600">Button Text</label>
                <input
                  value={form.buttonText}
                  onChange={(e) => setForm({ ...form, buttonText: e.target.value })}
                  placeholder="Shop Now"
                  className="w-full border border-gray-200 p-3 rounded-xl outline-none focus:border-primary text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-600">
                  Display Order
                </label>
                <input
                  type="number"
                  value={form.order}
                  onChange={(e) =>
                    setForm({ ...form, order: Number(e.target.value) })
                  }
                  className="w-full border border-gray-200 p-3 rounded-xl outline-none focus:border-primary text-sm"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-3 border-t border-gray-50">
              <button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
                className="bg-primary text-white px-6 py-2.5 rounded-xl hover:bg-primary-dark transition disabled:opacity-60 cursor-pointer hover:scale-[1.02] duration-300 shadow-md shadow-primary/5"
              >
                {editingBanner
                  ? updateMutation.isPending
                    ? "Saving..."
                    : "Save Changes"
                  : createMutation.isPending
                  ? "Uploading..."
                  : "Create Banner"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingBanner(null);
                }}
                className="border border-gray-200 px-6 py-2.5 rounded-xl hover:bg-gray-50 cursor-pointer text-gray-600 font-medium"
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
                    onClick={() => openEditForm(banner)}
                    className="flex items-center gap-1.5 text-xs border px-3 py-1.5 rounded-lg hover:bg-gray-50 transition"
                  >
                    <ImageIcon size={13} />
                    Edit / Replace
                  </button>
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
