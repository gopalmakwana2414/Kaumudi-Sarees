import dotenv from "dotenv";

dotenv.config();

export const env = {
  PORT: process.env.PORT || 5000,

  MONGO_URI: process.env.MONGO_URI as string,

  JWT_SECRET: process.env.JWT_SECRET as string,

  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME as string,

  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY as string,

  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET as string,

  RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID as string,

  RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET as string,

  NODE_ENV: process.env.NODE_ENV || "development",

  FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:3000",

  // ── Email (SMTP via Nodemailer) ──
  SMTP_HOST: process.env.SMTP_HOST || "",
  SMTP_PORT: Number(process.env.SMTP_PORT) || 587,
  SMTP_SECURE: process.env.SMTP_SECURE === "true",
  SMTP_USER: process.env.SMTP_USER || "",
  SMTP_PASS: process.env.SMTP_PASS || "",

  // Address emails are sent "from". Falls back to SMTP_USER if unset.
  EMAIL_FROM: process.env.EMAIL_FROM || process.env.SMTP_USER || "",

  // Where contact-form submissions and new-order alerts are sent.
  ADMIN_EMAIL: process.env.ADMIN_EMAIL || "g91652251@gmail.com",
};
