import express from "express";

import { protect } from "../middlewares/auth";

import {
  createOrder,
  getMyOrders,
  getOrderById,
  downloadInvoice,
} from "../controllers/orderController";

const router = express.Router();

router.post("/", protect, createOrder);

router.get("/", protect, getMyOrders);

router.get("/:id", protect, getOrderById);

router.get("/:id/invoice", protect, downloadInvoice);

export default router;
