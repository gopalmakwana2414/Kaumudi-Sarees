import { create } from "zustand";
import { Product } from "@/types/product";

interface CartItem {
  product: Product;
  quantity: number;
}

interface CartStore {
  items: CartItem[];

  addToCart: (product: Product) => void;

  removeFromCart: (id: string) => void;

  increaseQuantity: (id: string) => void;

  decreaseQuantity: (id: string) => void;

  clearCart: () => void;

  getCartTotal: () => number;

  getCartCount: () => number;
}

export const useCartStore =
  create<CartStore>((set, get) => ({
    items: [],

    addToCart: (product) =>
      set((state) => {
        const existing = state.items.find(
          (item) =>
            item.product._id === product._id
        );

        if (existing) {
          return {
            items: state.items.map((item) =>
              item.product._id === product._id
                ? {
                    ...item,
                    quantity:
                      item.quantity + 1,
                  }
                : item
            ),
          };
        }

        return {
          items: [
            ...state.items,
            {
              product,
              quantity: 1,
            },
          ],
        };
      }),

    increaseQuantity: (id) =>
      set((state) => ({
        items: state.items.map((item) =>
          item.product._id === id
            ? {
                ...item,
                quantity:
                  item.quantity + 1,
              }
            : item
        ),
      })),

    decreaseQuantity: (id) =>
      set((state) => ({
        items: state.items
          .map((item) =>
            item.product._id === id
              ? {
                  ...item,
                  quantity:
                    item.quantity - 1,
                }
              : item
          )
          .filter(
            (item) =>
              item.quantity > 0
          ),
      })),

    removeFromCart: (id) =>
      set((state) => ({
        items: state.items.filter(
          (item) =>
            item.product._id !== id
        ),
      })),

    clearCart: () =>
      set({
        items: [],
      }),

    getCartTotal: () => {
      const items = get().items;

      return items.reduce(
        (total, item) =>
          total +
          item.product.salePrice *
            item.quantity,
        0
      );
    },

    getCartCount: () => {
      const items = get().items;

      return items.reduce(
        (total, item) =>
          total + item.quantity,
        0
      );
    },
  }));