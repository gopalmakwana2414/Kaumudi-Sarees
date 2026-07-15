"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Plus,
  Trash2,
  X,
  Image as ImageIcon,
  Eye,
  EyeOff,
  GripVertical,
  Edit2,
  Upload,
  Loader2,
} from "lucide-react";
import Image from "next/image";
import api from "@/lib/api";

const BANNERS_POSITIONS = [
  { value: "promo", label: "Promo Strip" },
  { value: "category", label: "Category Banner" },
];

export default function AdminHomeBackgroundsPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"slider" | "banners">("slider");

  // === HOMEPAGE HERO BACKGROUNDS STATE ===
  const [bgUploadFiles, setBgUploadFiles] = useState<FileList | null>(null);
  const [bgUploadPreviews, setBgUploadPreviews] = useState<string[]>([]);
  const [bgEditing, setBgEditing] = useState<any | null>(null);
  const [bgEditFile, setBgEditFile] = useState<File | null>(null);
  const [bgEditPreview, setBgEditPreview] = useState<string | null>(null);
  const [bgDeleteId, setBgDeleteId] = useState<string | null>(null);
  const [bgForm, setBgForm] = useState({
    title: "",
    subtitle: "",
    buttonText: "",
    buttonLink: "",
    isActive: true,
  });

  // Drag and drop tracking indexes
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // === OLD BANNERS STATE ===
  const [showBannerForm, setShowBannerForm] = useState(false);
  const [bannerDeleteId, setBannerDeleteId] = useState<string | null>(null);
  const [bannerImageFile, setBannerImageFile] = useState<File | null>(null);
  const [bannerImagePreview, setBannerImagePreview] = useState<string | null>(null);
  const [editingBanner, setEditingBanner] = useState<any | null>(null);
  const [bannerForm, setBannerForm] = useState({
    title: "",
    subtitle: "",
    link: "/shop",
    buttonText: "Shop Now",
    position: "promo",
    order: 0,
  });

  // ==========================================
  // FETCHERS (REACT QUERY)
  // ==========================================

  // Fetch Homepage Slider Backgrounds
  const { data: backgrounds = [], isLoading: isLoadingBgs } = useQuery({
    queryKey: ["admin-backgrounds"],
    queryFn: async () => {
      const res = await api.get("/home-backgrounds/admin/all");
      return res.data;
    },
  });

  // Fetch Old Banners (Filtered to Category & Promo in UI)
  const { data: banners = [], isLoading: isLoadingBanners } = useQuery({
    queryKey: ["admin-banners"],
    queryFn: async () => {
      const res = await api.get("/banners/admin/all");
      return res.data;
    },
  });

  // ==========================================
  // HERO BACKGROUNDS MUTATIONS
  // ==========================================

  // Multi-upload backgrounds
  const uploadBgsMutation = useMutation({
    mutationFn: async (files: FileList) => {
      const formData = new FormData();
      for (let i = 0; i < files.length; i++) {
        // Validate each file format before sending
        const file = files[i];
        const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
        if (!allowedTypes.includes(file.type)) {
          throw new Error(`File ${file.name} is not a valid format. Only JPG, JPEG, PNG, and WEBP allowed.`);
        }
        formData.append("images", file);
      }

      const res = await api.post("/home-backgrounds", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-backgrounds"] });
      toast.success("Backgrounds uploaded successfully!");
      setBgUploadFiles(null);
      setBgUploadPreviews([]);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || err.message || "Failed to upload backgrounds");
    },
  });

  // Update background fields or replace single image
  const updateBgMutation = useMutation({
    mutationFn: async () => {
      const formData = new FormData();
      formData.append("title", bgForm.title);
      formData.append("subtitle", bgForm.subtitle);
      formData.append("buttonText", bgForm.buttonText);
      formData.append("buttonLink", bgForm.buttonLink);
      formData.append("isActive", String(bgForm.isActive));
      if (bgEditFile) {
        formData.append("image", bgEditFile);
      }

      const res = await api.patch(`/home-backgrounds/${bgEditing._id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-backgrounds"] });
      toast.success("Background updated successfully!");
      setBgEditing(null);
      setBgEditFile(null);
      setBgEditPreview(null);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || err.message || "Failed to update background");
    },
  });

  // Quick toggle active state
  const toggleBgMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.patch(`/home-backgrounds/${id}/toggle`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-backgrounds"] });
      toast.success("Status updated successfully");
    },
    onError: () => toast.error("Failed to update status"),
  });

  // Bulk reorder backgrounds
  const reorderBgsMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      const res = await api.patch("/home-backgrounds/reorder", { ids });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-backgrounds"] });
      toast.success("Display order saved");
    },
    onError: () => toast.error("Failed to save background order"),
  });

  // Delete background
  const deleteBgMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/home-backgrounds/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-backgrounds"] });
      toast.success("Background deleted successfully");
      setBgDeleteId(null);
    },
    onError: () => toast.error("Failed to delete background"),
  });

  // ==========================================
  // PROMO & CATEGORY BANNERS MUTATIONS
  // ==========================================

  const createBannerMutation = useMutation({
    mutationFn: async () => {
      if (!bannerImageFile) throw new Error("Please select a banner image");

      const formData = new FormData();
      formData.append("title", bannerForm.title);
      formData.append("subtitle", bannerForm.subtitle);
      formData.append("link", bannerForm.link);
      formData.append("buttonText", bannerForm.buttonText);
      formData.append("position", bannerForm.position);
      formData.append("order", String(bannerForm.order));
      formData.append("image", bannerImageFile);

      const res = await api.post("/banners", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-banners"] });
      toast.success("Banner created successfully!");
      setShowBannerForm(false);
      setBannerImageFile(null);
      setBannerImagePreview(null);
      setBannerForm({
        title: "",
        subtitle: "",
        link: "/shop",
        buttonText: "Shop Now",
        position: "promo",
        order: 0,
      });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || err.message || "Failed to create banner");
    },
  });

  const updateBannerMutation = useMutation({
    mutationFn: async () => {
      const formData = new FormData();
      formData.append("title", bannerForm.title);
      formData.append("subtitle", bannerForm.subtitle);
      formData.append("link", bannerForm.link);
      formData.append("buttonText", bannerForm.buttonText);
      formData.append("position", bannerForm.position);
      formData.append("order", String(bannerForm.order));
      if (bannerImageFile) formData.append("image", bannerImageFile);

      const res = await api.patch(`/banners/${editingBanner._id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-banners"] });
      toast.success("Banner updated successfully!");
      setShowBannerForm(false);
      setEditingBanner(null);
      setBannerImageFile(null);
      setBannerImagePreview(null);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || err.message || "Failed to update banner");
    },
  });

  const toggleBannerMutation = useMutation({
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

  const deleteBannerMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/banners/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-banners"] });
      toast.success("Banner deleted");
      setBannerDeleteId(null);
    },
    onError: () => toast.error("Failed to delete banner"),
  });

  // ==========================================
  // HANDLERS & HELPERS
  // ==========================================

  // Homepage slider multiple file change
  const handleBgFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setBgUploadFiles(files);
      const previews: string[] = [];
      for (let i = 0; i < files.length; i++) {
        previews.push(URL.createObjectURL(files[i]));
      }
      setBgUploadPreviews(previews);
    }
  };

  const handleBgUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bgUploadFiles || bgUploadFiles.length === 0) {
      return toast.error("Please choose one or more image files.");
    }
    uploadBgsMutation.mutate(bgUploadFiles);
  };

  // Open edit modal for background
  const openEditBgModal = (bg: any) => {
    setBgEditing(bg);
    setBgEditFile(null);
    setBgEditPreview(bg.image?.url || null);
    setBgForm({
      title: bg.title || "",
      subtitle: bg.subtitle || "",
      buttonText: bg.buttonText || "",
      buttonLink: bg.buttonLink || "",
      isActive: bg.isActive !== false,
    });
  };

  const handleBgEditFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setBgEditFile(file);
      setBgEditPreview(URL.createObjectURL(file));
    }
  };

  const handleBgEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateBgMutation.mutate();
  };

  // Drag and Drop ordering functions (HTML5 API)
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const listCopy = [...backgrounds];
    const draggedItem = listCopy[draggedIndex];
    // Reorder array
    listCopy.splice(draggedIndex, 1);
    listCopy.splice(index, 0, draggedItem);

    // Call mutation with reordered IDs
    const reorderedIds = listCopy.map((item: any) => item._id);
    reorderBgsMutation.mutate(reorderedIds);
    setDraggedIndex(null);
  };

  // Banner edit mode openers
  const openCreateBannerForm = () => {
    setEditingBanner(null);
    setBannerImageFile(null);
    setBannerImagePreview(null);
    setBannerForm({
      title: "",
      subtitle: "",
      link: "/shop",
      buttonText: "Shop Now",
      position: "promo",
      order: 0,
    });
    setShowBannerForm(true);
  };

  const openEditBannerForm = (banner: any) => {
    setEditingBanner(banner);
    setBannerImageFile(null);
    setBannerImagePreview(banner.image?.url || null);
    setBannerForm({
      title: banner.title || "",
      subtitle: banner.subtitle || "",
      link: banner.link || "/shop",
      buttonText: banner.buttonText || "Shop Now",
      position: banner.position || "promo",
      order: banner.order || 0,
    });
    setShowBannerForm(true);
  };

  const handleBannerFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setBannerImageFile(file);
      setBannerImagePreview(URL.createObjectURL(file));
    }
  };

  const handleBannerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bannerForm.title.trim()) return toast.error("Title is required");

    if (editingBanner) {
      updateBannerMutation.mutate();
    } else {
      if (!bannerImageFile) return toast.error("Please select a banner image");
      createBannerMutation.mutate();
    }
  };

  // Filter promo and category positions for the Other Banners tab
  const filteredBanners = banners.filter(
    (b: any) => b.position === "promo" || b.position === "category"
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary">Home Backgrounds</h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage the homepage dynamic backgrounds slider and other promotional banners.
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab("slider")}
          className={`px-6 py-3 text-sm font-semibold border-b-2 cursor-pointer transition-colors ${
            activeTab === "slider"
              ? "border-primary text-primary"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Homepage Hero Slider
        </button>
        <button
          onClick={() => setActiveTab("banners")}
          className={`px-6 py-3 text-sm font-semibold border-b-2 cursor-pointer transition-colors ${
            activeTab === "banners"
              ? "border-primary text-primary"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Promotional & Category Banners
        </button>
      </div>

      {/* ==========================================
          TAB 1: HOMEPAGE BACKGROUNDS SLIDER
          ========================================== */}
      {activeTab === "slider" && (
        <div className="space-y-6">
          {/* Multi-upload uploader card */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Upload Background Images
            </h2>
            <form onSubmit={handleBgUploadSubmit} className="space-y-4">
              <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-2xl p-8 cursor-pointer hover:border-primary transition bg-gray-50/50">
                <Upload size={32} className="text-gray-400 mb-2" />
                <span className="text-sm font-semibold text-gray-600">
                  Select Multiple Background Images
                </span>
                <span className="text-xs text-gray-400 mt-1">
                  Supports JPG, JPEG, PNG, WEBP
                </span>
                <input
                  type="file"
                  multiple
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handleBgFilesChange}
                  className="hidden"
                />
              </label>

              {/* Previews */}
              {bgUploadPreviews.length > 0 && (
                <div className="space-y-3">
                  <p className="text-xs font-semibold text-gray-500">Selected Files Preview:</p>
                  <div className="flex flex-wrap gap-3">
                    {bgUploadPreviews.map((url, idx) => (
                      <div key={idx} className="relative w-24 h-24 border rounded-xl overflow-hidden shadow-sm">
                        <Image src={url} alt="Preview" fill className="object-cover" />
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={uploadBgsMutation.isPending}
                      className="bg-primary text-white text-xs font-semibold px-4 py-2 rounded-xl hover:bg-primary-dark transition cursor-pointer flex items-center gap-1.5 shadow-md shadow-primary/5"
                    >
                      {uploadBgsMutation.isPending && <Loader2 size={13} className="animate-spin" />}
                      {uploadBgsMutation.isPending ? "Uploading..." : `Upload ${bgUploadPreviews.length} Image(s)`}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setBgUploadFiles(null);
                        setBgUploadPreviews([]);
                      }}
                      className="border border-gray-200 text-xs font-semibold px-4 py-2 rounded-xl hover:bg-gray-50 transition cursor-pointer text-gray-600"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>

          {/* Backgrounds Listing and Reordering */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <div className="flex justify-between items-center mb-5">
              <div>
                <h2 className="text-lg font-semibold text-gray-800">
                  Homepage Slider Images
                </h2>
                <p className="text-xs text-gray-400 mt-1">
                  Drag and drop items using the grip handle to adjust the display order.
                </p>
              </div>
            </div>

            {isLoadingBgs ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-28 bg-gray-100 rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : backgrounds.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <ImageIcon size={40} className="mx-auto mb-3 opacity-30" />
                <p className="text-sm">No homepage backgrounds uploaded yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {backgrounds.map((bg: any, index: number) => (
                  <div
                    key={bg._id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDrop={(e) => handleDrop(e, index)}
                    className="flex flex-col md:flex-row items-start md:items-center gap-4 p-4 border border-gray-100 rounded-2xl bg-white hover:border-gray-200 transition group shadow-[0_2px_10px_rgba(0,0,0,0.01)]"
                  >
                    {/* Drag Handle */}
                    <div className="cursor-grab active:cursor-grabbing text-gray-300 group-hover:text-gray-500 p-1">
                      <GripVertical size={20} />
                    </div>

                    {/* Image Thumbnail */}
                    <div className="relative w-28 h-20 rounded-xl overflow-hidden border flex-shrink-0">
                      <Image
                        src={bg.image.url}
                        alt={bg.title || "Homepage slide"}
                        fill
                        className="object-cover"
                      />
                    </div>

                    {/* Meta Fields */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-gray-800 truncate">
                          {bg.title || <span className="text-gray-300 italic text-xs font-normal">No Title</span>}
                        </h4>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                            bg.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {bg.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 truncate mt-0.5">
                        {bg.subtitle || <span className="text-gray-300 italic text-[11px]">No Subtitle</span>}
                      </p>
                      <div className="flex gap-4 mt-2 text-[10px] text-gray-400 font-medium">
                        <span>Link: {bg.buttonLink || "N/A"}</span>
                        <span>Button: {bg.buttonText || "N/A"}</span>
                        <span>Uploaded: {new Date(bg.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-2 w-full md:w-auto justify-end border-t md:border-t-0 pt-2.5 md:pt-0">
                      <button
                        onClick={() => openEditBgModal(bg)}
                        className="flex items-center gap-1 text-xs border px-3 py-1.5 rounded-xl hover:bg-gray-50 cursor-pointer font-medium transition text-gray-700"
                      >
                        <Edit2 size={13} />
                        Edit Slider Info
                      </button>
                      <button
                        onClick={() => toggleBgMutation.mutate(bg._id)}
                        className="flex items-center gap-1 text-xs border px-3 py-1.5 rounded-xl hover:bg-gray-50 cursor-pointer font-medium transition text-gray-700"
                      >
                        {bg.isActive ? <EyeOff size={13} /> : <Eye size={13} />}
                        {bg.isActive ? "Deactivate" : "Activate"}
                      </button>
                      <button
                        onClick={() => setBgDeleteId(bg._id)}
                        className="flex items-center gap-1 text-xs border border-red-100 text-red-500 px-3 py-1.5 rounded-xl hover:bg-red-50 cursor-pointer font-medium transition"
                      >
                        <Trash2 size={13} />
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==========================================
          TAB 2: PROMOTIONAL & CATEGORY BANNERS
          ========================================== */}
      {activeTab === "banners" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-semibold text-gray-800">
                Promo Strips & Category Banners
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                Manage static promotional placements across the online store.
              </p>
            </div>
            <button
              onClick={openCreateBannerForm}
              className="flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-xl hover:bg-primary-dark transition cursor-pointer hover:scale-[1.02] duration-300 shadow-md shadow-primary/5 text-xs font-semibold"
            >
              <Plus size={14} />
              Add Banner
            </button>
          </div>

          {/* Form wrapper */}
          {showBannerForm && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <div className="flex justify-between items-center mb-5 border-b pb-3">
                <h3 className="font-semibold text-gray-800">
                  {editingBanner ? "Edit Promo/Category Banner" : "New Promo/Category Banner"}
                </h3>
                <button
                  onClick={() => {
                    setShowBannerForm(false);
                    setEditingBanner(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleBannerSubmit} className="space-y-4">
                {/* Image Upload */}
                <div>
                  <label className="block text-xs font-semibold mb-1.5 text-gray-600">
                    Banner Image {editingBanner ? "" : "*"} (Recommended: 1920×800px or banner height proportional)
                  </label>
                  <label className="flex flex-col items-center justify-center border border-dashed border-gray-200 rounded-xl h-44 cursor-pointer hover:border-primary transition overflow-hidden relative bg-gray-50">
                    {bannerImagePreview ? (
                      <img src={bannerImagePreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center text-gray-400">
                        <ImageIcon size={24} className="mx-auto mb-1 text-gray-300" />
                        <p className="text-xs">Click to select banner image</p>
                      </div>
                    )}
                    {editingBanner && (
                      <div className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-full">
                        Click to replace image
                      </div>
                    )}
                    <input type="file" accept="image/*" onChange={handleBannerFileChange} className="hidden" />
                  </label>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold mb-1 text-gray-600">Title *</label>
                    <input
                      value={bannerForm.title}
                      onChange={(e) => setBannerForm({ ...bannerForm, title: e.target.value })}
                      placeholder="e.g. Festival Season Sale"
                      className="w-full border border-gray-200 px-3 py-2.5 rounded-xl outline-none focus:border-primary text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold mb-1 text-gray-600">Position</label>
                    <select
                      value={bannerForm.position}
                      onChange={(e) => setBannerForm({ ...bannerForm, position: e.target.value })}
                      className="w-full border border-gray-200 px-3 py-2.5 rounded-xl outline-none focus:border-primary text-xs"
                    >
                      {BANNERS_POSITIONS.map((p) => (
                        <option key={p.value} value={p.value}>
                          {p.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold mb-1 text-gray-600">Subtitle</label>
                    <input
                      value={bannerForm.subtitle}
                      onChange={(e) => setBannerForm({ ...bannerForm, subtitle: e.target.value })}
                      placeholder="e.g. Up to 40% OFF"
                      className="w-full border border-gray-200 px-3 py-2.5 rounded-xl outline-none focus:border-primary text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold mb-1 text-gray-600">Link URL</label>
                    <input
                      value={bannerForm.link}
                      onChange={(e) => setBannerForm({ ...bannerForm, link: e.target.value })}
                      placeholder="/shop"
                      className="w-full border border-gray-200 px-3 py-2.5 rounded-xl outline-none focus:border-primary text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold mb-1 text-gray-600">Button Text</label>
                    <input
                      value={bannerForm.buttonText}
                      onChange={(e) => setBannerForm({ ...bannerForm, buttonText: e.target.value })}
                      placeholder="Shop Now"
                      className="w-full border border-gray-200 px-3 py-2.5 rounded-xl outline-none focus:border-primary text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold mb-1 text-gray-600">Display Order</label>
                    <input
                      type="number"
                      value={bannerForm.order}
                      onChange={(e) => setBannerForm({ ...bannerForm, order: Number(e.target.value) })}
                      className="w-full border border-gray-200 px-3 py-2.5 rounded-xl outline-none focus:border-primary text-xs"
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-2 border-t">
                  <button
                    type="submit"
                    disabled={createBannerMutation.isPending || updateBannerMutation.isPending}
                    className="bg-primary text-white text-xs font-semibold px-4 py-2 rounded-xl hover:bg-primary-dark transition disabled:opacity-60 cursor-pointer shadow-md shadow-primary/5"
                  >
                    {editingBanner
                      ? updateBannerMutation.isPending
                        ? "Saving..."
                        : "Save Changes"
                      : createBannerMutation.isPending
                      ? "Uploading..."
                      : "Create Banner"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowBannerForm(false);
                      setEditingBanner(null);
                    }}
                    className="border border-gray-200 text-xs font-semibold px-4 py-2 rounded-xl hover:bg-gray-50 cursor-pointer text-gray-600"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Banner grid */}
          {isLoadingBanners ? (
            <div className="grid md:grid-cols-2 gap-6">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="h-44 bg-gray-100 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : filteredBanners.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm text-center py-12 text-gray-400 border">
              <ImageIcon size={40} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">No promotional/category banners yet.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {filteredBanners.map((banner: any) => (
                <div key={banner._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="relative h-32">
                    <img src={banner.image.url} alt={banner.title} className="w-full h-full object-cover" />
                    <span
                      className={`absolute top-3 left-3 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        banner.isActive ? "bg-green-500 text-white" : "bg-gray-500 text-white"
                      }`}
                    >
                      {banner.isActive ? "Active" : "Inactive"}
                    </span>
                    <span className="absolute top-3 right-3 bg-black/50 text-white text-[10px] px-2 py-0.5 rounded-full capitalize">
                      {banner.position}
                    </span>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-800">{banner.title}</h3>
                    {banner.subtitle && <p className="text-gray-500 text-xs mt-0.5">{banner.subtitle}</p>}
                    <div className="flex items-center gap-2 mt-4">
                      <button
                        onClick={() => openEditBannerForm(banner)}
                        className="flex items-center gap-1 text-[11px] font-medium border px-2.5 py-1.5 rounded-lg hover:bg-gray-50 transition cursor-pointer text-gray-700"
                      >
                        <Edit2 size={11} />
                        Edit
                      </button>
                      <button
                        onClick={() => toggleBannerMutation.mutate(banner._id)}
                        className="flex items-center gap-1 text-[11px] font-medium border px-2.5 py-1.5 rounded-lg hover:bg-gray-50 transition cursor-pointer text-gray-700"
                      >
                        {banner.isActive ? <EyeOff size={11} /> : <Eye size={11} />}
                        {banner.isActive ? "Deactivate" : "Activate"}
                      </button>
                      <button
                        onClick={() => setBannerDeleteId(banner._id)}
                        className="flex items-center gap-1 text-[11px] font-medium border border-red-100 text-red-500 px-2.5 py-1.5 rounded-lg hover:bg-red-50 transition cursor-pointer"
                      >
                        <Trash2 size={11} />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ==========================================
          MODALS / DIALOGS
          ========================================== */}

      {/* 1. Edit Slider background Info Modal */}
      {bgEditing && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl border border-gray-50 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-5 border-b pb-3">
              <h3 className="text-lg font-bold text-gray-800">Edit Background Slide Info</h3>
              <button
                onClick={() => {
                  setBgEditing(null);
                  setBgEditFile(null);
                  setBgEditPreview(null);
                }}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleBgEditSubmit} className="space-y-4">
              {/* Replace Image preview & file selector */}
              <div>
                <label className="block text-xs font-semibold mb-1 text-gray-600">
                  Background Image (Recommended: 1920×800px)
                </label>
                <label className="flex flex-col items-center justify-center border border-dashed border-gray-200 rounded-xl h-40 cursor-pointer hover:border-primary transition overflow-hidden relative bg-gray-50">
                  {bgEditPreview ? (
                    <img src={bgEditPreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center text-gray-400">
                      <ImageIcon size={24} className="mx-auto mb-1 text-gray-300" />
                      <p className="text-xs">Click to select image</p>
                    </div>
                  )}
                  <div className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-full">
                    Click to replace image
                  </div>
                  <input type="file" accept="image/*" onChange={handleBgEditFileChange} className="hidden" />
                </label>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 text-gray-600">Title (Optional)</label>
                <input
                  value={bgForm.title}
                  onChange={(e) => setBgForm({ ...bgForm, title: e.target.value })}
                  placeholder="e.g. Silk Sarees Festive Offer"
                  className="w-full border border-gray-200 px-3 py-2.5 rounded-xl outline-none focus:border-primary text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 text-gray-600">Subtitle (Optional)</label>
                <input
                  value={bgForm.subtitle}
                  onChange={(e) => setBgForm({ ...bgForm, subtitle: e.target.value })}
                  placeholder="e.g. Flat 20% Off on Heritage Sarees"
                  className="w-full border border-gray-200 px-3 py-2.5 rounded-xl outline-none focus:border-primary text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1 text-gray-600">Button Text (Optional)</label>
                  <input
                    value={bgForm.buttonText}
                    onChange={(e) => setBgForm({ ...bgForm, buttonText: e.target.value })}
                    placeholder="e.g. Shop Now"
                    className="w-full border border-gray-200 px-3 py-2.5 rounded-xl outline-none focus:border-primary text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1 text-gray-600">Button Link (Optional)</label>
                  <input
                    value={bgForm.buttonLink}
                    onChange={(e) => setBgForm({ ...bgForm, buttonLink: e.target.value })}
                    placeholder="e.g. /shop?category=silk"
                    className="w-full border border-gray-200 px-3 py-2.5 rounded-xl outline-none focus:border-primary text-xs"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t">
                <button
                  type="submit"
                  disabled={updateBgMutation.isPending}
                  className="flex-1 bg-primary text-white text-xs font-semibold py-2.5 rounded-xl hover:bg-primary-dark transition disabled:opacity-60 cursor-pointer shadow-md shadow-primary/5"
                >
                  {updateBgMutation.isPending ? "Saving..." : "Save Background"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setBgEditing(null);
                    setBgEditFile(null);
                    setBgEditPreview(null);
                  }}
                  className="flex-1 border text-xs font-semibold py-2.5 rounded-xl hover:bg-gray-50 cursor-pointer text-gray-600"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Homepage background Delete Confirm */}
      {bgDeleteId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="text-lg font-bold mb-3">Delete Homepage Background?</h3>
            <p className="text-gray-500 text-sm mb-6">
              This image will be permanently deleted from the database and Cloudinary.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => deleteBgMutation.mutate(bgDeleteId)}
                disabled={deleteBgMutation.isPending}
                className="flex-1 bg-red-500 text-white py-2.5 rounded-xl hover:bg-red-600 transition disabled:opacity-60 cursor-pointer text-xs font-semibold"
              >
                {deleteBgMutation.isPending ? "Deleting..." : "Delete"}
              </button>
              <button
                onClick={() => setBgDeleteId(null)}
                className="flex-1 border py-2.5 rounded-xl hover:bg-gray-50 cursor-pointer text-xs font-semibold text-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Promo/Category Banner Delete Confirm */}
      {bannerDeleteId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="text-lg font-bold mb-3">Delete Banner?</h3>
            <p className="text-gray-500 text-sm mb-6">
              This banner will be permanently deleted.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => deleteBannerMutation.mutate(bannerDeleteId)}
                disabled={deleteBannerMutation.isPending}
                className="flex-1 bg-red-500 text-white py-2.5 rounded-xl hover:bg-red-600 transition disabled:opacity-60 cursor-pointer text-xs font-semibold"
              >
                {deleteBannerMutation.isPending ? "Deleting..." : "Delete"}
              </button>
              <button
                onClick={() => setBannerDeleteId(null)}
                className="flex-1 border py-2.5 rounded-xl hover:bg-gray-50 cursor-pointer text-xs font-semibold text-gray-600"
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
