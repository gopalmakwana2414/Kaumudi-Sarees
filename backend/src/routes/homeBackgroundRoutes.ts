import express from "express";

import { protect } from "../middlewares/auth";
import { adminOnly } from "../middlewares/admin";
import { upload } from "../middlewares/upload";

import {
  createBackgrounds,
  getActiveBackgrounds,
  getAllBackgroundsAdmin,
  updateBackground,
  toggleBackgroundStatus,
  reorderBackgrounds,
  deleteBackground,
} from "../controllers/homeBackgroundController";

const router = express.Router();

// PUBLIC
router.get("/", getActiveBackgrounds);

// ADMIN
router.get("/admin/all", protect, adminOnly, getAllBackgroundsAdmin);

// Upload multiple background images at once
router.post(
  "/",
  protect,
  adminOnly,
  upload.array("images"),
  createBackgrounds
);

// Bulk reorder backgrounds
router.patch(
  "/reorder",
  protect,
  adminOnly,
  reorderBackgrounds
);

// Edit title/sub/button fields or replace image file for a single background
router.patch(
  "/:id",
  protect,
  adminOnly,
  upload.single("image"),
  updateBackground
);

// Toggle quick active status
router.patch(
  "/:id/toggle",
  protect,
  adminOnly,
  toggleBackgroundStatus
);

// Delete background
router.delete(
  "/:id",
  protect,
  adminOnly,
  deleteBackground
);

export default router;
