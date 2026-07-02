import express from "express";

import { protect } from "../middlewares/auth";
import { adminOnly } from "../middlewares/admin";
import { upload } from "../middlewares/upload";

import {
  createBanner,
  getAllBannersAdmin,
  getActiveBanners,
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

router.patch("/:id/toggle", protect, adminOnly, toggleBannerStatus);

router.delete("/:id", protect, adminOnly, deleteBanner);

export default router;
