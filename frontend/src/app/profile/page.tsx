"use client";

import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { User, Mail, Shield, LogOut } from "lucide-react";
import Link from "next/link";

export default function ProfilePage() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const router = useRouter();

  useEffect(() => {
    if (!user) router.push("/login");
  }, [user, router]);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  if (!user) return null;

  return (
    <section className="py-16">
      <div className="container-custom">
        <div className="max-w-xl mx-auto">
          <h1 className="text-4xl font-bold mb-10">My Profile</h1>

          <div className="bg-white rounded-3xl shadow-sm border p-8">
            {/* Avatar */}
            <div className="flex items-center gap-5 mb-8">
              <div className="w-20 h-20 bg-[#fff8e7] border-2 border-[#d4af37] rounded-full flex items-center justify-center">
                <User size={36} className="text-[#d4af37]" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">{user.name}</h2>
                <span
                  className={`text-sm px-3 py-0.5 rounded-full font-medium ${
                    user.role === "admin"
                      ? "bg-purple-100 text-purple-700"
                      : "bg-green-100 text-green-700"
                  }`}
                >
                  {user.role === "admin" ? "Administrator" : "Customer"}
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                <User size={18} className="text-gray-400" />
                <div>
                  <p className="text-xs text-gray-400">Full Name</p>
                  <p className="font-medium">{user.name}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                <Mail size={18} className="text-gray-400" />
                <div>
                  <p className="text-xs text-gray-400">Email Address</p>
                  <p className="font-medium">{user.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                <Shield size={18} className="text-gray-400" />
                <div>
                  <p className="text-xs text-gray-400">Account Role</p>
                  <p className="font-medium capitalize">{user.role}</p>
                </div>
              </div>
            </div>

            <div className="mt-8 space-y-3">
              <Link
                href="/orders"
                className="flex items-center justify-center gap-2 w-full border border-[#d4af37] text-[#b8860b] py-3 rounded-xl font-medium hover:bg-[#fff8e7] transition"
              >
                View My Orders
              </Link>

              {user.role === "admin" && (
                <Link
                  href="/admin"
                  className="flex items-center justify-center w-full bg-[#d4af37] text-white py-3 rounded-xl font-medium hover:bg-[#b8860b] transition"
                >
                  Go to Admin Panel
                </Link>
              )}

              <button
                onClick={handleLogout}
                className="flex items-center justify-center gap-2 w-full bg-red-50 text-red-600 py-3 rounded-xl font-medium hover:bg-red-100 transition"
              >
                <LogOut size={18} />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
