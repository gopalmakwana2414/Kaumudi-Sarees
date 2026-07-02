import { Request, Response } from "express";
import slugify from "slugify";
import { Category } from "../models/Category";

export const createCategory = async (
  req: Request,
  res: Response
) => {
  try {
    const { name, description } = req.body;

    const existing = await Category.findOne({ name });

    if (existing) {
      return res.status(400).json({
        message: "Category already exists",
      });
    }

    const category = await Category.create({
      name,
      slug: slugify(name, {
        lower: true,
      }),
      description,
    });

    res.status(201).json(category);
  } catch (error: any) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const getCategories = async (
  req: Request,
  res: Response
) => {
  try {
    const categories = await Category.find();

    res.status(200).json(categories);
  } catch (error: any) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const deleteCategory = async (
  req: Request,
  res: Response
) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.status(200).json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
