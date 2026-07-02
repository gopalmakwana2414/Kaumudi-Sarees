"use client";

import Link from "next/link";

import {
  Trash2,
  ShoppingBag,
} from "lucide-react";

import { useCartStore } from "@/store/cartStore";

export default function CartPage() {
  const {
    items,
    removeFromCart,
    clearCart,
  } = useCartStore();

  const subtotal = items.reduce(
    (total, item) =>
      total +
      item.product.salePrice *
        item.quantity,
    0
  );

  const shipping =
    subtotal > 999 ? 0 : 99;

  const total = subtotal + shipping;

  if (items.length === 0) {
    return (
      <section className="py-20">
        <div className="container-custom text-center">
          <ShoppingBag
            size={80}
            className="mx-auto text-gray-400"
          />

          <h1 className="text-3xl font-bold mt-6">
            Your Cart is Empty
          </h1>

          <p className="text-gray-500 mt-3">
            Add beautiful sarees to your cart.
          </p>

          <Link
            href="/shop"
            className="inline-block mt-8 bg-[#d4af37] text-white px-8 py-3 rounded-xl"
          >
            Continue Shopping
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16">
      <div className="container-custom">
        <h1 className="text-4xl font-bold mb-10">
          Shopping Cart
        </h1>

        <div className="grid lg:grid-cols-3 gap-10">
          {/* Left */}
          <div className="lg:col-span-2 space-y-6">
            {items.map((item) => (
              <div
                key={item.product._id}
                className="bg-white rounded-2xl shadow-sm p-4 flex gap-4"
              >
                <img
                  src={
                    item.product.thumbnail
                      .url
                  }
                  alt={item.product.name}
                  className="w-32 h-40 object-cover rounded-xl"
                />

                <div className="flex-1">
                  <h2 className="font-semibold text-lg">
                    {item.product.name}
                  </h2>

                  <p className="text-gray-500 mt-1">
                    {
                      item.product
                        .shortDescription
                    }
                  </p>

                  <p className="font-bold text-[#b8860b] mt-3">
                    ₹
                    {
                      item.product
                        .salePrice
                    }
                  </p>

                  <p className="text-sm text-gray-500 mt-1">
                    Quantity:
                    {" "}
                    {item.quantity}
                  </p>
                </div>

                <button
                  onClick={() =>
                    removeFromCart(
                      item.product._id
                    )
                  }
                >
                  <Trash2
                    size={20}
                    className="text-red-500"
                  />
                </button>
              </div>
            ))}
          </div>

          {/* Right */}
          <div className="bg-white rounded-2xl shadow-sm p-6 h-fit">
            <h2 className="text-2xl font-semibold mb-6">
              Order Summary
            </h2>

            <div className="space-y-4">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>
                  ₹{subtotal}
                </span>
              </div>

              <div className="flex justify-between">
                <span>Shipping</span>
                <span>
                  {shipping === 0
                    ? "Free"
                    : `₹${shipping}`}
                </span>
              </div>

              <hr />

              <div className="flex justify-between text-xl font-bold">
                <span>Total</span>
                <span>
                  ₹{total}
                </span>
              </div>
            </div>

            <Link
              href="/checkout"
              className="block text-center mt-8 bg-[#d4af37] text-white py-3 rounded-xl"
            >
              Proceed To Checkout
            </Link>

            <button
              onClick={clearCart}
              className="w-full mt-3 border py-3 rounded-xl"
            >
              Clear Cart
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}