import { Request, Response } from "express";
import { HomeBackground } from "../models/HomeBackground";
import {
  uploadToCloudinary,
  deleteFromCloudinary,
  uploadMultipleToCloudinary,
} from "../services/cloudinaryService";

// Upload multiple backgrounds
export const createBackgrounds = async (req: Request, res: Response) => {
  try {
    if (!req.files || (req.files as Express.Multer.File[]).length === 0) {
      return res.status(400).json({ message: "At least one background image is required" });
    }

    const files = req.files as Express.Multer.File[];
    const uploadedResults = await uploadMultipleToCloudinary(files, "kaumudi/backgrounds");

    const existingCount = await HomeBackground.countDocuments();

    const newBackgrounds = await Promise.all(
      uploadedResults.map(async (result, idx) => {
        return await HomeBackground.create({
          image: {
            url: result.url,
            public_id: result.public_id,
          },
          displayOrder: existingCount + idx,
          isActive: true,
        });
      })
    );

    return res.status(201).json(newBackgrounds);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

// Get all active backgrounds (Public Hero Slider)
export const getActiveBackgrounds = async (req: Request, res: Response) => {
  try {
    const backgrounds = await HomeBackground.find({ isActive: true })
      .sort({ displayOrder: 1 })
      .lean();

    return res.status(200).json(backgrounds);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

// Get all backgrounds (Admin Console)
export const getAllBackgroundsAdmin = async (req: Request, res: Response) => {
  try {
    const backgrounds = await HomeBackground.find().sort({ displayOrder: 1 });
    return res.status(200).json(backgrounds);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

// Update background info and/or replace image
export const updateBackground = async (req: Request, res: Response) => {
  try {
    const background = await HomeBackground.findById(req.params.id);

    if (!background) {
      return res.status(404).json({ message: "Background not found" });
    }

    const { title, subtitle, buttonText, buttonLink, displayOrder, isActive } = req.body;

    if (title !== undefined) background.title = title;
    if (subtitle !== undefined) background.subtitle = subtitle;
    if (buttonText !== undefined) background.buttonText = buttonText;
    if (buttonLink !== undefined) background.buttonLink = buttonLink;
    if (displayOrder !== undefined) background.displayOrder = Number(displayOrder);
    
    if (isActive !== undefined) {
      background.isActive = isActive === "true" || isActive === true;
    }

    // Replace image if file is supplied
    if (req.file) {
      const uploadResult = await uploadToCloudinary(
        req.file.buffer,
        "kaumudi/backgrounds"
      );

      const oldPublicId = background.image?.public_id;

      background.image = {
        url: uploadResult.secure_url,
        public_id: uploadResult.public_id,
      };

      if (oldPublicId) {
        await deleteFromCloudinary(oldPublicId).catch(() => {});
      }
    }

    await background.save();
    return res.status(200).json(background);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

// Enable/Disable background toggle
export const toggleBackgroundStatus = async (req: Request, res: Response) => {
  try {
    const background = await HomeBackground.findById(req.params.id);

    if (!background) {
      return res.status(404).json({ message: "Background not found" });
    }

    background.isActive = !background.isActive;
    await background.save();

    return res.status(200).json(background);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

// Bulk reorder backgrounds
export const reorderBackgrounds = async (req: Request, res: Response) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids)) {
      return res.status(400).json({ message: "Background IDs array is required" });
    }

    // Set new display orders in sequence
    await Promise.all(
      ids.map(async (id: string, index: number) => {
        await HomeBackground.findByIdAndUpdate(id, { displayOrder: index });
      })
    );

    return res.status(200).json({
      success: true,
      message: "Backgrounds reordered successfully",
    });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

// Delete background and Cloudinary asset
export const deleteBackground = async (req: Request, res: Response) => {
  try {
    const background = await HomeBackground.findById(req.params.id);

    if (!background) {
      return res.status(404).json({ message: "Background not found" });
    }

    if (background.image?.public_id) {
      await deleteFromCloudinary(background.image.public_id).catch(() => {});
    }

    await background.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Background deleted successfully",
    });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};
