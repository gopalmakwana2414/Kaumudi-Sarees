"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import api from "@/lib/api";

import {
  loginSchema,
  LoginFormData,
} from "@/lib/validations/auth";

import { useAuthStore } from "@/store/authStore";

export default function LoginPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  const login = useAuthStore((state) => state.login);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setLoading(true);

      const res = await api.post("/auth/login", data);

      // Backend returns: { user: { _id, name, email, role }, token }
      const { user, token } = res.data;

      login(
        {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        token
      );

      toast.success(`Welcome back, ${user.name}!`);

      if (user.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/");
      }
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || "Login failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-20 min-h-[80vh] flex items-center">
      <div className="container-custom">
        <div className="max-w-md mx-auto bg-white rounded-3xl shadow-sm border p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold">Welcome Back</h1>
            <p className="text-gray-500 mt-2 text-sm">
              Login to your Suhagan account
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Email Address
              </label>
              <input
                {...register("email")}
                type="email"
                placeholder="you@example.com"
                className="w-full border border-gray-200 p-3 rounded-xl outline-none focus:border-[#d4af37] transition"
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium">Password</label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-[#b8860b] hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <input
                type="password"
                {...register("password")}
                placeholder="••••••••"
                className="w-full border border-gray-200 p-3 rounded-xl outline-none focus:border-[#d4af37] transition"
              />
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#d4af37] text-white py-3 rounded-xl font-semibold hover:bg-[#b8860b] transition disabled:opacity-60"
            >
              {loading ? "Logging in..." : "Login"}
            </button>

            <p className="text-center text-sm text-gray-600">
              Don&apos;t have an account?
              <Link
                href="/register"
                className="text-[#b8860b] ml-1 font-medium hover:underline"
              >
                Create Account
              </Link>
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}
