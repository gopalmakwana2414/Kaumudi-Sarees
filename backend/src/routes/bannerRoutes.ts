import express from "express";

import { protect } from "../middlewares/auth";
import { adminOnly } from "../middlewares/admin";
import { upload } from "../middlewares/upload";

import {
  createBanner,
  getAllBannersAdmin,
  getActiveBanners,
  updateBanner,
  toggleBannerStatus,
  deleteBanner,
} from "../controllers/bannerController";

const router = express.Router();

// PUBLIC
router.get("/", getActiveBanners);

// ADMIN
router.get("/admin/all", protect, adminOnly, getAllBannersAdmin);

router.post(
  "/",
  protect,
  adminOnly,
  upload.single("image"),
  createBanner
);

// Replace image and/or edit fields on an existing banner
router.patch(
  "/:id",
  protect,
  adminOnly,
  upload.single("image"),
  updateBanner
);

router.patch("/:id/toggle", protect, adminOnly, toggleBannerStatus);

router.delete("/:id", protect, adminOnly, deleteBanner);

export default router;
