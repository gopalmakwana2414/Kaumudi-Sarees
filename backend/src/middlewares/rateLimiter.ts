import rateLimit from "express-rate-limit";

// Strict limiter for login/register — prevents brute-force credential attacks.
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 attempts per window per IP
  message: {
    message: "Too many attempts. Please try again after 15 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Looser limiter for the contact form — stops spam submissions.
export const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: {
    message: "Too many messages sent. Please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// General API limiter — broad protection against abuse/scraping.
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // generous, since storefront browsing makes many requests
  message: {
    message: "Too many requests. Please slow down.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
