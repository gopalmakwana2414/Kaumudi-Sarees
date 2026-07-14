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
    <section className="py-20 min-h-[80vh] flex items-center bg-gradient-to-tr from-[#fff8f8] via-[#fffbfb] to-[#ffffff]">
      <div className="container-custom">
        <div className="max-w-md mx-auto bg-white rounded-3xl shadow-sm border border-gray-100 p-8 shadow-[0_20px_50px_rgba(128,0,32,0.04)]">
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
                    className="w-full border border-gray-200 p-3 rounded-xl outline-none focus:border-primary focus:ring-1 focus:ring-primary transition bg-gray-50/50"
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
                    className="w-full border border-gray-200 p-3 rounded-xl outline-none focus:border-primary focus:ring-1 focus:ring-primary transition bg-gray-50/50"
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
                  className="w-full bg-primary text-white py-3 rounded-xl font-semibold hover:bg-primary-dark transition disabled:opacity-60 shadow-md hover:shadow-lg shadow-primary/20 cursor-pointer hover:scale-[1.02] duration-300"
                >
                  {loading ? "Resetting..." : "Reset Password"}
                </button>

                <p className="text-center text-sm text-gray-600">
                  <Link href="/login" className="text-primary font-medium hover:underline inline-flex items-center gap-1.5">
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
