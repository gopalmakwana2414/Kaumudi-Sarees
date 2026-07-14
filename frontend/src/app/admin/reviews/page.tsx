"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Star, Trash2, MessageSquare } from "lucide-react";
import api from "@/lib/api";

export default function AdminReviewsPage() {
  const queryClient = useQueryClient();

  // Get all products first, then fetch reviews per product
  const { data: productsData } = useQuery({
    queryKey: ["products-for-reviews"],
    queryFn: async () => {
      const res = await api.get("/products?limit=100");
      return res.data.products;
    },
  });

  // Fetch all reviews for all products using a single admin endpoint
  // (We'll use the per-product endpoint for now and aggregate)
  const { data: allReviews = [], isLoading, refetch } = useQuery({
    queryKey: ["all-reviews"],
    queryFn: async () => {
      if (!productsData?.length) return [];
      const reviewPromises = productsData.map((p: any) =>
        api
          .get(`/reviews/product/${p._id}`)
          .then((r) =>
            r.data.map((rev: any) => ({
              ...rev,
              productName: p.name,
              productSlug: p.slug,
            }))
          )
          .catch(() => [])
      );
      const results = await Promise.all(reviewPromises);
      return results.flat().sort(
        (a: any, b: any) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    },
    enabled: !!productsData?.length,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/reviews/${id}`);
    },
    onSuccess: () => {
      toast.success("Review deleted");
      queryClient.invalidateQueries({ queryKey: ["all-reviews"] });
      refetch();
    },
    onError: () => toast.error("Failed to delete review"),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-primary">Reviews</h1>
        <p className="text-gray-500 text-sm mt-1">
          Manage all customer reviews — {allReviews.length} total
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : allReviews.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <MessageSquare size={48} className="mx-auto mb-3 opacity-30" />
            <p>No reviews yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {allReviews.map((review: any) => (
              <div key={review._id} className="p-5 hover:bg-gray-50/50 transition">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <p className="font-semibold text-sm text-gray-800">
                        {review.user?.name || "Customer"}
                      </p>
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            size={13}
                            className={
                              s <= review.rating
                                ? "fill-primary text-primary"
                                : "text-gray-300"
                            }
                          />
                        ))}
                      </div>
                      <span className="text-xs text-gray-400">
                        {new Date(review.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    <p className="text-primary text-xs mt-1 font-semibold">
                      Product: {review.productName}
                    </p>
                    <p className="text-gray-600 text-sm mt-2 leading-6">
                      {review.comment}
                    </p>
                  </div>
                  <button
                    onClick={() => deleteMutation.mutate(review._id)}
                    disabled={deleteMutation.isPending}
                    className="text-red-400 hover:text-red-600 transition flex-shrink-0 cursor-pointer"
                    title="Delete review"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
