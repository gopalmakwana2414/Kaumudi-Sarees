import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { toast } from "sonner";
import api from "@/lib/api";
import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";
import { Product } from "@/types/product";

export function useCart() {
  const queryClient = useQueryClient();
  const token = useAuthStore((state) => state.token);
  const localItems = useCartStore((state) => state.items);

  // 1. Fetch Cart Query
  const { data: cart, isLoading, error } = useQuery({
    queryKey: ["cart"],
    queryFn: async () => {
      const res = await api.get("/cart");
      return res.data;
    },
    enabled: !!token,
  });

  // 2. Sync React Query data to Zustand store
  useEffect(() => {
    if (cart && token) {
      const formattedItems = cart.items.map((item: any) => ({
        product: item.product,
        quantity: item.quantity,
      }));
      useCartStore.setState({ items: formattedItems });
    }
  }, [cart, token]);

  // 3. Add to Cart Mutation (with Optimistic UI updates)
  const addToCartMutation = useMutation({
    mutationFn: async ({ product, quantity }: { product: Product; quantity: number }) => {
      const res = await api.post("/cart/add", { productId: product._id, quantity });
      return res.data;
    },
    onMutate: async ({ product, quantity }) => {
      await queryClient.cancelQueries({ queryKey: ["cart"] });
      const previousCart = queryClient.getQueryData(["cart"]);

      // Update React Query Cache optimistically
      queryClient.setQueryData(["cart"], (old: any) => {
        if (!old) {
          return {
            items: [{ product, quantity, price: product.salePrice }],
            totalItems: quantity,
            totalAmount: product.salePrice * quantity,
          };
        }
        const existing = old.items.find((item: any) => item.product._id === product._id);
        let newItems;
        if (existing) {
          newItems = old.items.map((item: any) =>
            item.product._id === product._id
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
        } else {
          newItems = [...old.items, { product, quantity, price: product.salePrice }];
        }
        const totalItems = newItems.reduce((acc: number, item: any) => acc + item.quantity, 0);
        const totalAmount = newItems.reduce((acc: number, item: any) => acc + item.quantity * item.product.salePrice, 0);
        return {
          ...old,
          items: newItems,
          totalItems,
          totalAmount,
        };
      });

      // Update Zustand store optimistically
      const existing = localItems.find((item) => item.product._id === product._id);
      useCartStore.setState({
        items: existing
          ? localItems.map((item) =>
              item.product._id === product._id
                ? { ...item, quantity: item.quantity + quantity }
                : item
            )
          : [...localItems, { product, quantity }],
      });

      return { previousCart };
    },
    onError: (err: any, variables, context) => {
      if (context?.previousCart) {
        queryClient.setQueryData(["cart"], context.previousCart);
        // Rollback Zustand
        const formattedItems = (context.previousCart as any).items.map((item: any) => ({
          product: item.product,
          quantity: item.quantity,
        }));
        useCartStore.setState({ items: formattedItems });
      }
      toast.error(err?.response?.data?.message || "Failed to add to cart");
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["cart"], data);
      const formattedItems = data.items.map((item: any) => ({
        product: item.product,
        quantity: item.quantity,
      }));
      useCartStore.setState({ items: formattedItems });
    },
  });

  // 4. Update Quantity Mutation
  const updateQuantityMutation = useMutation({
    mutationFn: async ({ productId, quantity }: { productId: string; quantity: number }) => {
      const res = await api.patch(`/cart/${productId}`, { quantity });
      return res.data;
    },
    onMutate: async ({ productId, quantity }) => {
      await queryClient.cancelQueries({ queryKey: ["cart"] });
      const previousCart = queryClient.getQueryData(["cart"]);

      // Optimistic cache update
      queryClient.setQueryData(["cart"], (old: any) => {
        if (!old) return old;
        const newItems = old.items.map((item: any) =>
          item.product._id === productId ? { ...item, quantity } : item
        );
        const totalItems = newItems.reduce((acc: number, item: any) => acc + item.quantity, 0);
        const totalAmount = newItems.reduce((acc: number, item: any) => acc + item.quantity * item.product.salePrice, 0);
        return {
          ...old,
          items: newItems,
          totalItems,
          totalAmount,
        };
      });

      // Optimistic Zustand update
      useCartStore.setState({
        items: localItems.map((item) =>
          item.product._id === productId ? { ...item, quantity } : item
        ),
      });

      return { previousCart };
    },
    onError: (err: any, variables, context) => {
      if (context?.previousCart) {
        queryClient.setQueryData(["cart"], context.previousCart);
        const formattedItems = (context.previousCart as any).items.map((item: any) => ({
          product: item.product,
          quantity: item.quantity,
        }));
        useCartStore.setState({ items: formattedItems });
      }
      toast.error(err?.response?.data?.message || "Failed to update quantity");
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["cart"], data);
      const formattedItems = data.items.map((item: any) => ({
        product: item.product,
        quantity: item.quantity,
      }));
      useCartStore.setState({ items: formattedItems });
    },
  });

  // 5. Remove Item Mutation
  const removeItemMutation = useMutation({
    mutationFn: async (productId: string) => {
      const res = await api.delete(`/cart/remove/${productId}`);
      return res.data.cart;
    },
    onMutate: async (productId) => {
      await queryClient.cancelQueries({ queryKey: ["cart"] });
      const previousCart = queryClient.getQueryData(["cart"]);

      // Optimistic cache update
      queryClient.setQueryData(["cart"], (old: any) => {
        if (!old) return old;
        const newItems = old.items.filter((item: any) => item.product._id !== productId);
        const totalItems = newItems.reduce((acc: number, item: any) => acc + item.quantity, 0);
        const totalAmount = newItems.reduce((acc: number, item: any) => acc + item.quantity * item.product.salePrice, 0);
        return {
          ...old,
          items: newItems,
          totalItems,
          totalAmount,
        };
      });

      // Optimistic Zustand update
      useCartStore.setState({
        items: localItems.filter((item) => item.product._id !== productId),
      });

      return { previousCart };
    },
    onError: (err: any, variables, context) => {
      if (context?.previousCart) {
        queryClient.setQueryData(["cart"], context.previousCart);
        const formattedItems = (context.previousCart as any).items.map((item: any) => ({
          product: item.product,
          quantity: item.quantity,
        }));
        useCartStore.setState({ items: formattedItems });
      }
      toast.error(err?.response?.data?.message || "Failed to remove item");
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["cart"], data);
      const formattedItems = data.items.map((item: any) => ({
        product: item.product,
        quantity: item.quantity,
      }));
      useCartStore.setState({ items: formattedItems });
      toast.success("Item removed from cart");
    },
  });

  // 6. Clear Cart Mutation
  const clearCartMutation = useMutation({
    mutationFn: async () => {
      const res = await api.delete("/cart/clear");
      return res.data.cart;
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["cart"] });
      const previousCart = queryClient.getQueryData(["cart"]);

      // Optimistic cache update
      queryClient.setQueryData(["cart"], { items: [], totalItems: 0, totalAmount: 0 });

      // Optimistic Zustand update
      useCartStore.setState({ items: [] });

      return { previousCart };
    },
    onError: (err: any, variables, context) => {
      if (context?.previousCart) {
        queryClient.setQueryData(["cart"], context.previousCart);
        const formattedItems = (context.previousCart as any).items.map((item: any) => ({
          product: item.product,
          quantity: item.quantity,
        }));
        useCartStore.setState({ items: formattedItems });
      }
      toast.error(err?.response?.data?.message || "Failed to clear cart");
    },
    onSuccess: () => {
      queryClient.setQueryData(["cart"], { items: [], totalItems: 0, totalAmount: 0 });
      useCartStore.setState({ items: [] });
      toast.success("Cart cleared");
    },
  });

  // Guest fallbacks & Sync trigger wrappers
  const addToCart = (product: Product, quantity = 1) => {
    const existing = localItems.find((item) => item.product._id === product._id);
    const currentQty = existing ? existing.quantity : 0;
    if (currentQty + quantity > product.stock) {
      toast.error(`Only ${product.stock} unit(s) of "${product.name}" left in stock`);
      return;
    }

    if (token) {
      addToCartMutation.mutate({ product, quantity });
    } else {
      // Guest
      useCartStore.setState({
        items: existing
          ? localItems.map((item) =>
              item.product._id === product._id
                ? { ...item, quantity: item.quantity + quantity }
                : item
            )
          : [...localItems, { product, quantity }],
      });
      toast.success(`${product.name} added to cart!`);
    }
  };

  const updateQuantity = (productId: string, quantity: number, stock: number, name: string) => {
    if (quantity > stock) {
      toast.error(`Maximum available quantity reached. Only ${stock} units left in stock.`);
      return;
    }
    if (quantity < 1) {
      toast.error("Quantity must be at least 1");
      return;
    }
    if (token) {
      updateQuantityMutation.mutate({ productId, quantity });
    } else {
      useCartStore.setState({
        items: localItems.map((item) =>
          item.product._id === productId ? { ...item, quantity } : item
        ),
      });
    }
  };

  const removeItem = (productId: string) => {
    if (token) {
      removeItemMutation.mutate(productId);
    } else {
      useCartStore.setState({
        items: localItems.filter((item) => item.product._id !== productId),
      });
      toast.success("Item removed from cart");
    }
  };

  const clearCart = () => {
    if (token) {
      clearCartMutation.mutate();
    } else {
      useCartStore.setState({ items: [] });
      toast.success("Cart cleared");
    }
  };

  return {
    cart: token ? (cart || { items: [] }) : { items: localItems },
    isLoading: token ? isLoading : false,
    addToCart,
    updateQuantity,
    removeItem,
    clearCart,
  };
}
