import express from "express";
import {
  createRazorpayOrder,
  verifyPaymentAndCreateOrder,
  createCODOrder,
} from "../controllers/paymentController";

import { protect } from "../middlewares/auth";

const router = express.Router();

// Create Razorpay order
router.post(
  "/create-order",
  protect,
  createRazorpayOrder
);

// Verify payment + create order
router.post(
  "/verify",
  protect,
  verifyPaymentAndCreateOrder
);

// COD order
router.post(
  "/cod",
  protect,
  createCODOrder
);

export default router;