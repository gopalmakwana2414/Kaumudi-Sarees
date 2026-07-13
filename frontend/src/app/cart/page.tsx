"use client";

import Link from "next/link";
import { Trash2, ShoppingBag, Minus, Plus } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function CartPage() {
  const shouldReduceMotion = useReducedMotion();
  const { cart, updateQuantity, removeItem, clearCart, isLoading } = useCart();
  const [confirmRemoveItem, setConfirmRemoveItem] = useState<any>(null);

  const items = cart?.items || [];

  const subtotal = items.reduce(
    (total: number, item: any) =>
      total +
      item.product.salePrice *
        item.quantity,
    0
  );

  const shipping =
    subtotal > 999 ? 0 : 99;

  const total = subtotal + shipping;

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#d4af37] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <section className="py-20 overflow-hidden">
        <ScrollReveal className="container-custom text-center">
          <ShoppingBag
            size={80}
            className="mx-auto text-[#d4af37]/60"
          />

          <h1 className="text-3xl font-bold mt-6 text-gray-800">
            Your Cart is Empty
          </h1>

          <p className="text-gray-500 mt-3">
            Add beautiful sarees to your cart.
          </p>

          <Link
            href="/shop"
            className="inline-block mt-8 bg-[#d4af37] text-white px-8 py-3 rounded-xl hover:bg-[#b8860b] transition-colors duration-200"
          >
            Continue Shopping
          </Link>
        </ScrollReveal>
      </section>
    );
  }

  return (
    <section className="py-16 overflow-hidden">
      <div className="container-custom">
        <ScrollReveal>
          <h1 className="text-4xl font-bold mb-10 text-gray-800">
            Shopping Cart
          </h1>
        </ScrollReveal>

        <div className="grid lg:grid-cols-3 gap-10">
          {/* Left - Item List */}
          <div className="lg:col-span-2 space-y-6">
            <AnimatePresence mode="popLayout" initial={false}>
              {items.map((item: any) => (
                <motion.div
                  key={item.product._id}
                  layout={!shouldReduceMotion}
                  initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: shouldReduceMotion ? 0 : -50 }}
                  transition={{ duration: 0.3, ease: [0.215, 0.61, 0.355, 1] }}
                  className="bg-white rounded-2xl shadow-sm p-4 flex gap-4 border border-gray-50"
                >
                  <img
                    src={item.product.thumbnail?.url}
                    alt={item.product.name}
                    className="w-32 h-40 object-cover rounded-xl flex-shrink-0"
                  />

                  <div className="flex-1 min-w-0">
                    <h2 className="font-semibold text-lg text-gray-800 truncate">
                      {item.product.name}
                    </h2>

                    <p className="text-gray-500 mt-1 text-sm line-clamp-2">
                      {item.product.shortDescription}
                    </p>

                    <p className="font-bold text-[#b8860b] mt-3">
                      ₹{item.product.salePrice.toLocaleString()}
                    </p>

                    {/* Quantity Selectors */}
                    <div className="flex flex-wrap items-center gap-3 mt-4">
                      <span className="text-sm font-medium text-gray-505">Quantity:</span>
                      <div className="flex items-center border border-gray-200 rounded-full bg-gray-50/50 p-1 shadow-sm">
                        <motion.button
                          whileHover={{ scale: 1.08, backgroundColor: "#f3f4f6" }}
                          whileTap={{ scale: 0.92 }}
                          onClick={() => {
                            if (item.quantity === 1) {
                              setConfirmRemoveItem(item);
                            } else {
                              updateQuantity(
                                item.product._id,
                                item.quantity - 1,
                                item.product.stock,
                                item.product.name
                              );
                            }
                          }}
                          className="w-8 h-8 rounded-full flex items-center justify-center text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
                          title="Decrease Quantity"
                        >
                          <Minus size={14} />
                        </motion.button>

                        <span className="w-10 text-center font-semibold text-gray-800 text-sm">
                          {item.quantity}
                        </span>

                        <motion.button
                          whileHover={{ scale: 1.08, backgroundColor: "#f3f4f6" }}
                          whileTap={{ scale: 0.92 }}
                          onClick={() => {
                            if (item.quantity >= item.product.stock) {
                              toast.error(`Maximum available quantity reached. Only ${item.product.stock} units left in stock.`);
                            } else {
                              updateQuantity(
                                item.product._id,
                                item.quantity + 1,
                                item.product.stock,
                                item.product.name
                              );
                            }
                          }}
                          className="w-8 h-8 rounded-full flex items-center justify-center text-gray-600 hover:text-[#b8860b] transition-colors cursor-pointer"
                          title="Increase Quantity"
                        >
                          <Plus size={14} />
                        </motion.button>
                      </div>
                      
                      {item.product.stock <= 5 && (
                        <span className="text-xs text-red-500 font-medium ml-2 animate-pulse self-center">
                          Only {item.product.stock} left in stock!
                        </span>
                      )}
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => removeItem(item.product._id)}
                    className="flex-shrink-0 p-1 self-start text-gray-400 hover:text-red-500 transition-colors duration-200 cursor-pointer"
                  >
                    <Trash2 size={20} />
                  </motion.button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Right - Summary */}
          <ScrollReveal y={20} className="bg-white rounded-2xl shadow-sm p-6 h-fit border border-gray-50">
            <h2 className="text-2xl font-semibold mb-6 text-gray-800">
              Order Summary
            </h2>

            <div className="space-y-4 text-gray-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-gray-800">
                  ₹{subtotal.toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="font-semibold text-gray-800">
                  {shipping === 0 ? "Free" : `₹${shipping}`}
                </span>
              </div>

              <hr className="border-gray-100" />

              <div className="flex justify-between text-xl font-bold text-gray-800">
                <span>Total</span>
                <span className="text-[#b8860b]">
                  ₹{total.toLocaleString()}
                </span>
              </div>
            </div>

            <motion.div
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className="mt-8"
            >
              <Link
                href="/checkout"
                className="block text-center bg-[#d4af37] text-white py-3.5 rounded-xl font-semibold hover:bg-[#b8860b] transition-colors duration-200 shadow-md shadow-[#d4af37]/10"
              >
                Proceed To Checkout
              </Link>
            </motion.div>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={clearCart}
              className="w-full mt-3 border border-gray-200 py-3.5 rounded-xl font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors duration-200 cursor-pointer"
            >
              Clear Cart
            </motion.button>
          </ScrollReveal>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={!!confirmRemoveItem} onOpenChange={(open) => !open && setConfirmRemoveItem(null)}>
        <DialogContent className="sm:max-w-md bg-white rounded-2xl p-6 shadow-xl border border-gray-100">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-800">Remove from Cart?</DialogTitle>
            <DialogDescription className="text-gray-500 mt-2">
              Are you sure you want to remove <span className="font-medium text-gray-800">"{confirmRemoveItem?.product.name}"</span> from your cart?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-6 flex flex-row justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setConfirmRemoveItem(null)}
              className="rounded-xl px-5 border-gray-200 hover:bg-gray-50 text-gray-600 transition-all font-medium h-10 cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                removeItem(confirmRemoveItem.product._id);
                setConfirmRemoveItem(null);
              }}
              className="rounded-xl px-5 bg-red-600 hover:bg-red-700 text-white transition-all font-medium h-10 cursor-pointer"
            >
              Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}