import express from "express";

import { protect } from "../middlewares/auth";
import { adminOnly } from "../middlewares/admin";

import {
  createCoupon,
  getCoupons,
  applyCoupon,
  deleteCoupon,
} from "../controllers/couponController";

const router = express.Router();



// ADMIN
router.post(
  "/",
  protect,
  adminOnly,
  createCoupon
);

router.delete(
  "/:id",
  protect,
  adminOnly,
  deleteCoupon
);

router.get(
  "/",
  protect,
  adminOnly,
  getCoupons
);



// USER
router.post(
  "/apply",
  applyCoupon
);

export default router;