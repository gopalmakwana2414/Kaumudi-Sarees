import express from "express";

import { protect } from "../middlewares/auth.js";
import { createOrderLimiter } from "../middlewares/rateLimiter.js";

import {
  createOrder,
  getMyOrders,
  getOrderById,
  downloadInvoice,
} from "../controllers/orderController.js";

const router = express.Router();

router.post("/", protect, createOrderLimiter, createOrder);

router.get("/", protect, getMyOrders);

router.get("/:id", protect, getOrderById);

router.get("/:id/invoice", protect, downloadInvoice);

export default router;
