import { z } from "zod";

const objectIdRegex = /^[0-9a-fA-F]{24}$/;
const mongoIdSchema = z.string().regex(objectIdRegex, "Invalid ObjectId format");

const cartItemSchema = z.object({
  product: mongoIdSchema,
  quantity: z.number().int().positive("Quantity must be at least 1"),
});

// Validate request for initiating Razorpay Order / Pending Order
export const createRazorpayOrderSchema = z.object({
  items: z.array(cartItemSchema).min(1, "Cart cannot be empty"),
  couponCode: z.string().trim().optional(),
  shippingAddress: mongoIdSchema,
});

// Validate request for verifying Razorpay checkout payment
export const verifyPaymentSchema = z.object({
  razorpay_order_id: z.string().min(1, "razorpay_order_id is required"),
  razorpay_payment_id: z.string().min(1, "razorpay_payment_id is required"),
  razorpay_signature: z.string().min(1, "razorpay_signature is required"),
});

// Validate request for placing Cash On Delivery order
export const createCODOrderSchema = z.object({
  items: z.array(cartItemSchema).min(1, "Cart cannot be empty"),
  couponCode: z.string().trim().optional(),
  shippingAddress: mongoIdSchema,
});
