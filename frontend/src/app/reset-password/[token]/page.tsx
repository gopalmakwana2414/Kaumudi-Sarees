"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { CheckCircle2 } from "lucide-react";

import api from "@/lib/api";
import {
  resetPasswordSchema,
  ResetPasswordFormData,
} from "@/lib/validations/auth";

export default function ResetPasswordPage() {
  const { token } = useParams();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    try {
      setLoading(true);
      await api.post(`/auth/reset-password/${token}`, {
        password: data.password,
      });
      setSuccess(true);
      setTimeout(() => router.push("/login"), 2500);
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message ||
          "This reset link is invalid or has expired. Please request a new one."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-20 min-h-[80vh] flex items-center">
      <div className="container-custom">
        <div className="max-w-md mx-auto bg-white rounded-3xl shadow-sm border p-8">
          {success ? (
            <div className="text-center">
              <CheckCircle2 size={48} className="mx-auto text-green-500" />
              <h1 className="text-2xl font-bold mt-4">Password Reset!</h1>
              <p className="text-gray-500 mt-2 text-sm">
                Redirecting you to login...
              </p>
            </div>
          ) : (
            <>
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold">Reset Password</h1>
                <p className="text-gray-500 mt-2 text-sm">
                  Choose a new password for your account.
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    New Password
                  </label>
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

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    {...register("confirmPassword")}
                    placeholder="••••••••"
                    className="w-full border border-gray-200 p-3 rounded-xl outline-none focus:border-[#d4af37] transition"
                  />
                  {errors.confirmPassword && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.confirmPassword.message}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#d4af37] text-white py-3 rounded-xl font-semibold hover:bg-[#b8860b] transition disabled:opacity-60"
                >
                  {loading ? "Resetting..." : "Reset Password"}
                </button>

                <p className="text-center text-sm text-gray-600">
                  <Link href="/login" className="text-[#b8860b] font-medium hover:underline">
                    Back to Login
                  </Link>
                </p>
              </form>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
