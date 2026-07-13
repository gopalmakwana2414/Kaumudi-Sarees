import { create } from "zustand";
import { Product } from "@/types/product";
import api from "@/lib/api";
import { useAuthStore } from "./authStore";
import { queryClient } from "@/providers/ReactQueryProvider";

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

        const newItems = existing
          ? state.items.map((item) =>
              item.product._id === product._id
                ? {
                    ...item,
                    quantity:
                      item.quantity + 1,
                  }
                : item
            )
          : [
              ...state.items,
              {
                product,
                quantity: 1,
              },
            ];

        const token = useAuthStore.getState().token;
        if (token) {
          api.post("/cart/add", {
            productId: product._id,
            quantity: 1,
          })
            .then((res) => {
              const formattedItems = res.data.items.map((item: any) => ({
                product: item.product,
                quantity: item.quantity,
              }));
              useCartStore.setState({ items: formattedItems });
              queryClient.setQueryData(["cart"], res.data);
            })
            .catch((err) => {
              console.error("Failed to sync addToCart to backend:", err);
            });
        }

        return { items: newItems };
      }),

    increaseQuantity: (id) =>
      set((state) => {
        const newItems = state.items.map((item) =>
          item.product._id === id
            ? {
                ...item,
                quantity:
                  item.quantity + 1,
              }
            : item
        );

        const targetItem = newItems.find(item => item.product._id === id);
        const token = useAuthStore.getState().token;
        if (token && targetItem) {
          api.patch(`/cart/${id}`, {
            quantity: targetItem.quantity,
          })
            .then((res) => {
              const formattedItems = res.data.items.map((item: any) => ({
                product: item.product,
                quantity: item.quantity,
              }));
              useCartStore.setState({ items: formattedItems });
              queryClient.setQueryData(["cart"], res.data);
            })
            .catch((err) => {
              console.error("Failed to sync increaseQuantity to backend:", err);
            });
        }

        return { items: newItems };
      }),

    decreaseQuantity: (id) =>
      set((state) => {
        const targetItem = state.items.find(item => item.product._id === id);
        if (!targetItem) return {};

        const newItems = state.items
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
          );

        const token = useAuthStore.getState().token;
        if (token) {
          if (targetItem.quantity - 1 > 0) {
            api.patch(`/cart/${id}`, {
              quantity: targetItem.quantity - 1,
            })
              .then((res) => {
                const formattedItems = res.data.items.map((item: any) => ({
                  product: item.product,
                  quantity: item.quantity,
                }));
                useCartStore.setState({ items: formattedItems });
                queryClient.setQueryData(["cart"], res.data);
              })
              .catch((err) => {
                console.error("Failed to sync decreaseQuantity to backend:", err);
              });
          } else {
            api.delete(`/cart/remove/${id}`)
              .then((res) => {
                const formattedItems = res.data.cart.items.map((item: any) => ({
                  product: item.product,
                  quantity: item.quantity,
                }));
                useCartStore.setState({ items: formattedItems });
                queryClient.setQueryData(["cart"], res.data.cart);
              })
              .catch((err) => {
                console.error("Failed to sync remove on decrease to backend:", err);
              });
          }
        }

        return { items: newItems };
      }),

    removeFromCart: (id) => {
      set((state) => ({
        items: state.items.filter(
          (item) =>
            item.product._id !== id
        ),
      }));

      const token = useAuthStore.getState().token;
      if (token) {
        api.delete(`/cart/remove/${id}`)
          .then((res) => {
            const formattedItems = res.data.cart.items.map((item: any) => ({
              product: item.product,
              quantity: item.quantity,
            }));
            useCartStore.setState({ items: formattedItems });
            queryClient.setQueryData(["cart"], res.data.cart);
          })
          .catch((err) => {
            console.error("Failed to sync removeFromCart to backend:", err);
          });
      }
    },

    clearCart: () => {
      set({
        items: [],
      });

      const token = useAuthStore.getState().token;
      if (token) {
        api.delete("/cart/clear")
          .then((res) => {
            queryClient.setQueryData(["cart"], { items: [], totalItems: 0, totalAmount: 0 });
          })
          .catch((err) => {
            console.error("Failed to sync clearCart to backend:", err);
          });
      }
    },

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