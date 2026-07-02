"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import api from "@/lib/api";

import {
  registerSchema,
  RegisterFormData,
} from "@/lib/validations/auth";

import { useAuthStore } from "@/store/authStore";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const login = useAuthStore((state) => state.login);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setLoading(true);

      // Backend expects: { name, email, password }
      // phone is stored only on frontend for now
      const res = await api.post("/auth/register", {
        name: data.name,
        email: data.email,
        password: data.password,
      });

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

      toast.success(`Welcome to Suhagan, ${user.name}!`);

      router.push("/");
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message ||
          "Registration failed. Please try again."
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
            <h1 className="text-3xl font-bold">Create Account</h1>
            <p className="text-gray-500 mt-2 text-sm">
              Join Suhagan and explore premium sarees
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Full Name
              </label>
              <input
                {...register("name")}
                placeholder="Priya Sharma"
                className="w-full border border-gray-200 p-3 rounded-xl outline-none focus:border-[#d4af37] transition"
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.name.message}
                </p>
              )}
            </div>

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

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Phone Number
              </label>
              <input
                {...register("phone")}
                type="tel"
                placeholder="9876543210"
                className="w-full border border-gray-200 p-3 rounded-xl outline-none focus:border-[#d4af37] transition"
              />
              {errors.phone && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.phone.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <input
                type="password"
                {...register("password")}
                placeholder="Min. 6 characters"
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
              {loading ? "Creating Account..." : "Create Account"}
            </button>

            <p className="text-center text-sm text-gray-600">
              Already have an account?
              <Link
                href="/login"
                className="text-[#b8860b] ml-1 font-medium hover:underline"
              >
                Login
              </Link>
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}
