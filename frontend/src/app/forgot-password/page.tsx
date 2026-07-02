"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ArrowLeft, MailCheck } from "lucide-react";

import api from "@/lib/api";
import {
  forgotPasswordSchema,
  ForgotPasswordFormData,
} from "@/lib/validations/auth";

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      setLoading(true);
      await api.post("/auth/forgot-password", data);
      // Always show the same success state regardless of whether the
      // email exists — the backend intentionally returns a generic
      // response so we don't leak which emails are registered.
      setSubmitted(true);
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-20 min-h-[80vh] flex items-center">
      <div className="container-custom">
        <div className="max-w-md mx-auto bg-white rounded-3xl shadow-sm border p-8">
          {submitted ? (
            <div className="text-center">
              <MailCheck size={48} className="mx-auto text-[#d4af37]" />
              <h1 className="text-2xl font-bold mt-4">Check Your Email</h1>
              <p className="text-gray-500 mt-2 text-sm">
                If an account exists for that email, we&apos;ve sent a link to
                reset your password. The link expires in 30 minutes.
              </p>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 mt-8 text-[#b8860b] font-medium hover:underline text-sm"
              >
                <ArrowLeft size={14} /> Back to Login
              </Link>
            </div>
          ) : (
            <>
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold">Forgot Password?</h1>
                <p className="text-gray-500 mt-2 text-sm">
                  Enter your email and we&apos;ll send you a reset link.
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#d4af37] text-white py-3 rounded-xl font-semibold hover:bg-[#b8860b] transition disabled:opacity-60"
                >
                  {loading ? "Sending..." : "Send Reset Link"}
                </button>

                <p className="text-center text-sm text-gray-600">
                  <Link
                    href="/login"
                    className="text-[#b8860b] font-medium hover:underline inline-flex items-center gap-1"
                  >
                    <ArrowLeft size={14} /> Back to Login
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
