import { z } from "zod";

export const registerSchema = z.object({
  name: z
    .string()
    .min(3, "Name must be at least 3 characters"),

  email: z
    .email("Invalid email address"),

  phone: z
    .string()
    .min(10, "Phone number must be 10 digits"),

  password: z
    .string()
    .min(6, "Password must be at least 6 characters"),
});

export const loginSchema = z.object({
  email: z
    .email("Invalid email address"),

  password: z
    .string()
    .min(6, "Password must be at least 6 characters"),
});

export const forgotPasswordSchema = z.object({
  email: z.email("Invalid email address"),
});

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(6, "Password must be at least 6 characters"),

    confirmPassword: z
      .string()
      .min(6, "Password must be at least 6 characters"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type RegisterFormData =
  z.infer<typeof registerSchema>;

export type LoginFormData =
  z.infer<typeof loginSchema>;

export type ForgotPasswordFormData =
  z.infer<typeof forgotPasswordSchema>;

export type ResetPasswordFormData =
  z.infer<typeof resetPasswordSchema>;