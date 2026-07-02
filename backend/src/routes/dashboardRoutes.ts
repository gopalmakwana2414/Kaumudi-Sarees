import express from "express";

import { protect } from "../middlewares/auth";
import { adminOnly } from "../middlewares/admin";

import {
  getDashboardStats,
} from "../controllers/dashboardController";

const router = express.Router();

router.get(
  "/",
  protect,
  adminOnly,
  getDashboardStats
);

export default router;