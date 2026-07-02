import express from "express";

import { protect } from "../middlewares/auth";

import {
  createAddress,
  getAddresses,
  updateAddress,
  setDefaultAddress,
  deleteAddress,
} from "../controllers/addressController";

const router = express.Router();

router.post(
  "/",
  protect,
  createAddress
);

router.get(
  "/",
  protect,
  getAddresses
);

router.put(
  "/:id",
  protect,
  updateAddress
);

router.patch(
  "/default/:id",
  protect,
  setDefaultAddress
);

router.delete(
  "/:id",
  protect,
  deleteAddress
);

export default router;