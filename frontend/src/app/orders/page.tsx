"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Package, ShoppingBag } from "lucide-react";
import api from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  confirmed: "bg-blue-100 text-blue-700",
  processing: "bg-purple-100 text-purple-700",
  shipped: "bg-indigo-100 text-indigo-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

export default function OrdersPage() {
  const user = useAuthStore((state) => state.user);
  const router = useRouter();

  useEffect(() => {
    if (!user) router.push("/login");
  }, [user, router]);

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["my-orders"],
    queryFn: async () => {
      const res = await api.get("/orders");
      return res.data;
    },
    enabled: !!user,
  });

  if (!user) return null;

  if (isLoading) {
    return (
      <section className="py-16">
        <div className="container-custom">
          <h1 className="text-4xl font-bold mb-10">My Orders</h1>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-gray-100 rounded-2xl h-28 animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (orders.length === 0) {
    return (
      <section className="py-20">
        <div className="container-custom text-center">
          <ShoppingBag size={80} className="mx-auto text-gray-300" />
          <h1 className="text-3xl font-bold mt-6">No Orders Yet</h1>
          <p className="text-gray-500 mt-3">
            You haven&apos;t placed any orders yet. Start shopping!
          </p>
          <Link
            href="/shop"
            className="inline-block mt-8 bg-primary text-white px-8 py-3 rounded-xl font-medium hover:bg-primary-dark cursor-pointer hover:scale-[1.02] duration-300 shadow-md transition-all"
          >
            Shop Now
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16">
      <div className="container-custom">
        <h1 className="text-4xl font-bold mb-10">My Orders</h1>

        <div className="space-y-6">
          {orders.map((order: any) => (
            <Link
              href={`/orders/${order._id}`}
              key={order._id}
              className="block bg-white rounded-2xl shadow-sm border p-6 hover:shadow-md hover:border-primary transition cursor-pointer"
            >
              <div className="flex flex-wrap justify-between items-start gap-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Order ID</p>
                  <p className="font-mono font-semibold text-sm">
                    #{order._id.slice(-8).toUpperCase()}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500 mb-1">Date</p>
                  <p className="text-sm font-medium">
                    {new Date(order.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500 mb-1">Total</p>
                  <p className="font-bold text-primary">
                    ₹{order.totalAmount?.toLocaleString()}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500 mb-1">Payment</p>
                  <p className="text-sm font-medium">{order.paymentMethod}</p>
                </div>

                <div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${
                      STATUS_COLORS[order.orderStatus] || "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {order.orderStatus}
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t flex items-center gap-2 text-gray-500 text-sm">
                <Package size={16} />
                <span>{order.totalItems} item(s)</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
