import { Request, Response } from "express";
import { Banner } from "../models/Banner";
import {
  uploadToCloudinary,
  deleteFromCloudinary,
} from "../services/cloudinaryService";

// ====================================
// CREATE BANNER
// ====================================
export const createBanner = async (req: Request, res: Response) => {
  try {
    const { title, subtitle, link, buttonText, position, order } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "Banner image is required" });
    }

    const uploadResult = await uploadToCloudinary(
      req.file.buffer,
      "suhagan/banners"
    );

    const banner = await Banner.create({
      title,
      subtitle,
      link,
      buttonText,
      position: position || "hero",
      order: order ? Number(order) : 0,
      image: {
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id,
      },
    });

    return res.status(201).json(banner);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

// ====================================
// GET ALL BANNERS (Admin — all, including inactive)
// ====================================
export const getAllBannersAdmin = async (req: Request, res: Response) => {
  try {
    const banners = await Banner.find().sort({ position: 1, order: 1 });
    return res.status(200).json(banners);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

// ====================================
// GET ACTIVE BANNERS (Public — for homepage)
// ====================================
export const getActiveBanners = async (req: Request, res: Response) => {
  try {
    const { position } = req.query;

    const filter: any = { isActive: true };
    if (position) filter.position = position;

    const banners = await Banner.find(filter).sort({ order: 1 });
    return res.status(200).json(banners);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

// ====================================
// TOGGLE BANNER ACTIVE STATUS
// ====================================
export const toggleBannerStatus = async (req: Request, res: Response) => {
  try {
    const banner = await Banner.findById(req.params.id);

    if (!banner) {
      return res.status(404).json({ message: "Banner not found" });
    }

    banner.isActive = !banner.isActive;
    await banner.save();

    return res.status(200).json(banner);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

// ====================================
// DELETE BANNER
// ====================================
export const deleteBanner = async (req: Request, res: Response) => {
  try {
    const banner = await Banner.findById(req.params.id);

    if (!banner) {
      return res.status(404).json({ message: "Banner not found" });
    }

    if (banner.image?.publicId) {
      await deleteFromCloudinary(banner.image.publicId).catch(() => {});
    }

    await banner.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Banner deleted successfully",
    });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};
