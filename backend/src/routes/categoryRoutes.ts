import express from "express";
import {
  createCategory,
  getCategories,
  deleteCategory,
} from "../controllers/categoryController";

import { protect } from "../middlewares/auth";
import { adminOnly } from "../middlewares/admin";

const router = express.Router();

router.get("/", getCategories);

router.post("/", protect, adminOnly, createCategory);

router.delete("/:id", protect, adminOnly, deleteCategory);

export default router;
