"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { User } from "lucide-react";

export default function AdminCustomersPage() {
  const { data: customers = [], isLoading } = useQuery({
    queryKey: ["admin-customers"],
    queryFn: async () => {
      // We use dashboard stats to get total users,
      // For listing users, add a /admin/users route to backend
      // For now fetch from a users endpoint
      const res = await api.get("/admin/customers");
      return res.data;
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#b8860b]">Customers</h1>
        <p className="text-gray-500 text-sm mt-1">View all registered users</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-3">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="h-14 bg-gray-100 rounded-xl animate-pulse"
              />
            ))}
          </div>
        ) : customers.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <User size={48} className="mx-auto mb-3 opacity-30" />
            <p>No customers found.</p>
            <p className="text-sm mt-2">
              Note: Add the{" "}
              <code className="bg-gray-100 px-1 rounded">/admin/customers</code>{" "}
              route to the backend to list users here.
            </p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left">
              <tr>
                <th className="p-4">#</th>
                <th className="p-4">Name</th>
                <th className="p-4">Email</th>
                <th className="p-4">Role</th>
                <th className="p-4">Joined</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((user: any, i: number) => (
                <tr key={user._id} className="border-t hover:bg-gray-50">
                  <td className="p-4 text-gray-400">{i + 1}</td>
                  <td className="p-4 font-medium">{user.name}</td>
                  <td className="p-4 text-gray-500">{user.email}</td>
                  <td className="p-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${
                        user.role === "admin"
                          ? "bg-purple-100 text-purple-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="p-4 text-gray-500 text-xs">
                    {new Date(user.createdAt).toLocaleDateString("en-IN")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
