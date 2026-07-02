import express from "express";
import {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
} from "../controllers/authController";
import { protect, AuthRequest } from "../middlewares/auth";
import { authLimiter } from "../middlewares/rateLimiter";

const router = express.Router();

// Public Routes (rate-limited against brute-force attacks)
router.post("/register", authLimiter, registerUser);
router.post("/login", authLimiter, loginUser);

// Password reset — rate-limited to stop email/token brute-forcing
router.post("/forgot-password", authLimiter, forgotPassword);
router.post("/reset-password/:token", authLimiter, resetPassword);

// Protected Route
router.get("/profile", protect, (req: AuthRequest, res) => {
  res.status(200).json({
    success: true,
    user: req.user,
  });
});

export default router;
