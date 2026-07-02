/**
 * ==========================================================
 * EMAIL SERVICE (Nodemailer / SMTP)
 * ==========================================================
 * Production email service for SUHAGAN. Replaces the previous
 * console-log placeholder. Sends via any standard SMTP provider
 * (Gmail SMTP, SendGrid, Mailgun, Amazon SES, Brevo, etc.) —
 * configure SMTP_HOST / SMTP_PORT / SMTP_USER / SMTP_PASS /
 * EMAIL_FROM in your .env.
 *
 * All send functions are safe to call without awaiting from a
 * request handler (the caller decides whether to await or fire
 * non-blocking with .catch()), and every function throws on
 * failure so callers can log/report it — but a broken email
 * provider should never crash the request that triggered it,
 * which is why every call site in this codebase wraps these in
 * try/catch or .catch().
 * ==========================================================
 */

import nodemailer from "nodemailer";
import { env } from "../config/env";

// ==========================================================
// TRANSPORTER
// ==========================================================
// Lazily created so importing this module never throws even if
// SMTP env vars aren't set yet (e.g. during local dev without
// email configured) — the error only surfaces when an email is
// actually attempted, with a clear message.
let transporter: nodemailer.Transporter | null = null;

const getTransporter = (): nodemailer.Transporter => {
  if (transporter) return transporter;

  if (!env.SMTP_HOST || !env.SMTP_USER || !env.SMTP_PASS) {
    throw new Error(
      "Email is not configured. Set SMTP_HOST, SMTP_USER and SMTP_PASS in your environment."
    );
  }

  transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_SECURE, // true for port 465, false for 587/25 (STARTTLS)
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    },
  });

  return transporter;
};

const BRAND_COLOR = "#d4af37";

const wrapTemplate = (title: string, bodyHtml: string) => `
  <div style="font-family: Georgia, 'Times New Roman', serif; max-width: 560px; margin: 0 auto; color: #2b2b2b;">
    <div style="background: ${BRAND_COLOR}; padding: 24px; text-align: center;">
      <h1 style="color: #ffffff; margin: 0; font-size: 24px; letter-spacing: 2px;">SUHAGAN</h1>
    </div>
    <div style="background: #ffffff; padding: 32px 24px; border: 1px solid #eee; border-top: none;">
      <h2 style="margin-top: 0; color: #2b2b2b;">${title}</h2>
      ${bodyHtml}
    </div>
    <p style="text-align: center; color: #999; font-size: 12px; margin-top: 16px;">
      SUHAGAN — Luxury Sarees, Surat, India
    </p>
  </div>
`;

const send = async (to: string, subject: string, html: string, text?: string) => {
  const mailer = getTransporter();

  await mailer.sendMail({
    from: `"SUHAGAN" <${env.EMAIL_FROM}>`,
    to,
    subject,
    html,
    text: text || html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim(),
  });
};

// ==========================================================
// WELCOME EMAIL
// ==========================================================
export const sendWelcomeEmail = async ({
  to,
  customerName,
}: {
  to: string;
  customerName: string;
}): Promise<void> => {
  const html = wrapTemplate(
    `Welcome, ${customerName}! 🌸`,
    `<p>Thank you for creating an account with SUHAGAN. Explore our handcrafted
     collection of Banarasi, Kanjivaram, Silk and Designer sarees, curated for
     every occasion.</p>
     <p><a href="${env.FRONTEND_URL}/shop" style="display:inline-block;background:${BRAND_COLOR};color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;margin-top:8px;">
       Start Shopping
     </a></p>`
  );

  await send(to, "Welcome to SUHAGAN 🌸", html);
};

// ==========================================================
// OTP EMAIL
// ==========================================================
export const sendOTPEmail = async ({
  to,
  otp,
}: {
  to: string;
  otp: string;
}): Promise<void> => {
  const html = wrapTemplate(
    "Your Verification Code",
    `<p>Use the code below to verify your request. This code expires in 10 minutes.</p>
     <p style="font-size: 32px; font-weight: bold; letter-spacing: 6px; text-align: center; margin: 24px 0;">${otp}</p>
     <p style="color:#999; font-size: 13px;">If you didn't request this, you can safely ignore this email.</p>`
  );

  await send(to, "Your SUHAGAN verification code", html);
};

// ==========================================================
// RESET PASSWORD EMAIL
// ==========================================================
export const sendResetPasswordEmail = async ({
  to,
  customerName,
  resetUrl,
}: {
  to: string;
  customerName: string;
  resetUrl: string;
}): Promise<void> => {
  const html = wrapTemplate(
    "Reset Your Password",
    `<p>Hi ${customerName},</p>
     <p>We received a request to reset your SUHAGAN account password. This link
     is valid for 30 minutes.</p>
     <p><a href="${resetUrl}" style="display:inline-block;background:${BRAND_COLOR};color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;margin-top:8px;">
       Reset Password
     </a></p>
     <p style="color:#999; font-size: 13px; margin-top: 20px;">
       If you didn't request a password reset, you can safely ignore this
       email — your password will remain unchanged.
     </p>
     <p style="color:#999; font-size: 12px; word-break: break-all;">${resetUrl}</p>`
  );

  await send(to, "Reset your SUHAGAN password", html);
};

// ==========================================================
// ORDER STATUS UPDATE EMAIL
// ==========================================================
export const sendOrderStatusEmail = async ({
  to,
  customerName,
  orderId,
  status,
}: {
  to: string;
  customerName: string;
  orderId: string;
  status: string;
}): Promise<void> => {
  const html = wrapTemplate(
    "Your Order Status Has Been Updated",
    `<p>Hi ${customerName},</p>
     <p>Your order <strong>#${orderId.slice(-8).toUpperCase()}</strong> is now:</p>
     <p style="font-size: 20px; font-weight: bold; text-transform: capitalize; color: ${BRAND_COLOR};">${status}</p>
     <p><a href="${env.FRONTEND_URL}/orders/${orderId}" style="display:inline-block;background:${BRAND_COLOR};color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;margin-top:8px;">
       Track Your Order
     </a></p>`
  );

  await send(to, `Order Update: ${status}`, html);
};

// ==========================================================
// CUSTOMER ORDER CONFIRMATION EMAIL
// ==========================================================
export const sendOrderConfirmationEmail = async (data: {
  to: string;
  customerName: string;
  orderId: string;
  items: { name: string; quantity: number; price: number }[];
  totalAmount: number;
  paymentMethod: string;
  address: string;
}): Promise<void> => {
  const itemsHtml = data.items
    .map(
      (item) => `
      <tr>
        <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${item.name} × ${item.quantity}</td>
        <td style="padding: 8px 0; border-bottom: 1px solid #eee; text-align: right;">₹${(
          item.price * item.quantity
        ).toLocaleString("en-IN")}</td>
      </tr>`
    )
    .join("");

  const html = wrapTemplate(
    "Order Confirmed! 🎉",
    `<p>Hi ${data.customerName},</p>
     <p>Thank you for your order. Here's a summary:</p>
     <p style="color:#999; font-size: 13px;">Order ID: #${data.orderId
       .slice(-8)
       .toUpperCase()}</p>
     <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
       ${itemsHtml}
       <tr>
         <td style="padding: 12px 0; font-weight: bold;">Total</td>
         <td style="padding: 12px 0; font-weight: bold; text-align: right;">₹${data.totalAmount.toLocaleString(
           "en-IN"
         )}</td>
       </tr>
     </table>
     <p><strong>Payment method:</strong> ${
       data.paymentMethod === "COD" ? "Cash on Delivery" : "Online Payment"
     }</p>
     <p><strong>Delivery address:</strong> ${data.address}</p>
     <p><a href="${env.FRONTEND_URL}/orders/${data.orderId}" style="display:inline-block;background:${BRAND_COLOR};color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;margin-top:8px;">
       View Order
     </a></p>`
  );

  await send(data.to, "Your SUHAGAN order is confirmed", html);
};

// ==========================================================
// ADMIN NEW ORDER ALERT
// ==========================================================
export const sendAdminOrderAlert = async (data: {
  orderId: string;
  customerName: string;
  customerEmail: string;
  totalAmount: number;
  paymentMethod: string;
  itemCount: number;
}): Promise<void> => {
  const html = wrapTemplate(
    "🛍️ New Order Received",
    `<p><strong>Order:</strong> #${data.orderId.slice(-8).toUpperCase()}</p>
     <p><strong>Customer:</strong> ${data.customerName} (${data.customerEmail})</p>
     <p><strong>Items:</strong> ${data.itemCount}</p>
     <p><strong>Total:</strong> ₹${data.totalAmount.toLocaleString("en-IN")}</p>
     <p><strong>Payment:</strong> ${data.paymentMethod}</p>
     <p><a href="${env.FRONTEND_URL}/admin/orders" style="display:inline-block;background:${BRAND_COLOR};color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;margin-top:8px;">
       View in Admin Panel
     </a></p>`
  );

  await send(env.ADMIN_EMAIL, `New Order: ₹${data.totalAmount.toLocaleString("en-IN")}`, html);
};

// ==========================================================
// CONTACT FORM EMAIL
// ==========================================================
export const sendContactEmail = async (data: {
  name: string;
  email: string;
  phone?: string;
  message: string;
}): Promise<void> => {
  const html = wrapTemplate(
    "📩 New Contact Form Submission",
    `<p><strong>Name:</strong> ${data.name}</p>
     <p><strong>Email:</strong> ${data.email}</p>
     ${data.phone ? `<p><strong>Phone:</strong> ${data.phone}</p>` : ""}
     <p><strong>Message:</strong></p>
     <p style="white-space: pre-wrap; background:#f8f8f8; padding:12px; border-radius:8px;">${data.message}</p>`
  );

  // Sent to the store's admin inbox — the customer does not receive a copy
  // here since this is an internal notification, not a customer-facing email.
  await send(env.ADMIN_EMAIL, `Contact Form: ${data.name}`, html);
};

export default {
  sendWelcomeEmail,
  sendOTPEmail,
  sendResetPasswordEmail,
  sendOrderStatusEmail,
  sendOrderConfirmationEmail,
  sendAdminOrderAlert,
  sendContactEmail,
};
