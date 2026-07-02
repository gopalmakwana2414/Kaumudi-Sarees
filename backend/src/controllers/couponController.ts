import { Request, Response } from "express";
import { Coupon } from "../models/Coupon";



// CREATE COUPON
export const createCoupon = async (
  req: Request,
  res: Response
) => {
  try {
    const coupon = await Coupon.create(req.body);

    return res.status(201).json(coupon);
  } catch (error: any) {
    return res.status(500).json({
      message: error.message,
    });
  }
};



// GET ALL COUPONS
export const getCoupons = async (
  req: Request,
  res: Response
) => {
  try {
    const coupons = await Coupon.find().sort({
      createdAt: -1,
    });

    return res.status(200).json(coupons);
  } catch (error: any) {
    return res.status(500).json({
      message: error.message,
    });
  }
};



// APPLY COUPON
export const applyCoupon = async (
  req: Request,
  res: Response
) => {
  try {
    const { code, orderAmount } = req.body;

    const coupon = await Coupon.findOne({
      code: code.toUpperCase(),
      isActive: true,
    });

    if (!coupon) {
      return res.status(404).json({
        message: "Invalid coupon",
      });
    }

    if (new Date() > coupon.expiresAt) {
      return res.status(400).json({
        message: "Coupon expired",
      });
    }

    if (
      orderAmount <
      coupon.minimumOrderAmount
    ) {
      return res.status(400).json({
        message:
          "Minimum order amount not reached",
      });
    }

    const discount =
      (orderAmount *
        coupon.discountPercentage) /
      100;

    const finalAmount =
      orderAmount - discount;

    return res.status(200).json({
      success: true,

      coupon: coupon.code,

      discountPercentage:
        coupon.discountPercentage,

      discount,

      finalAmount,
    });
  } catch (error: any) {
    return res.status(500).json({
      message: error.message,
    });
  }
};



// DELETE COUPON
export const deleteCoupon = async (
  req: Request,
  res: Response
) => {
  try {
    await Coupon.findByIdAndDelete(
      req.params.id
    );

    return res.status(200).json({
      success: true,
      message:
        "Coupon deleted successfully",
    });
  } catch (error: any) {
    return res.status(500).json({
      message: error.message,
    });
  }
};