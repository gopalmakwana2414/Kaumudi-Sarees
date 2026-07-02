"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";

// Used by the admin products page — fetches a large batch for client-side
// table search/filter. For storefront browsing, see the shop page's own query.
export function useProducts() {
  return useQuery({
    queryKey: ["admin-products-all"],
    queryFn: async () => {
      const res = await api.get("/products?limit=200&sort=latest");
      return res.data.products;
    },
  });
}
