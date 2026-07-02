import { create } from "zustand";

interface WishlistStore {
  items: string[];

  toggleWishlist: (
    productId: string
  ) => void;
}

export const useWishlistStore =
  create<WishlistStore>((set) => ({
    items: [],

    toggleWishlist: (id) =>
      set((state) => ({
        items: state.items.includes(id)
          ? state.items.filter(
              (item) => item !== id
            )
          : [...state.items, id],
      })),
  }));