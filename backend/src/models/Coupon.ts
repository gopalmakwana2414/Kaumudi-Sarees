import mongoose, { Schema, Document } from "mongoose";

export interface ICoupon extends Document {
  code: string;

  discountPercentage: number;

  minimumOrderAmount: number;

  expiresAt: Date;

  isActive: boolean;

  createdAt: Date;
  updatedAt: Date;
}

const couponSchema = new Schema<ICoupon>(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },

    discountPercentage: {
      type: Number,
      required: true,
      min: 1,
      max: 100,
    },

    minimumOrderAmount: {
      type: Number,
      default: 0,
    },

    expiresAt: {
      type: Date,
      required: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Coupon = mongoose.model<ICoupon>(
  "Coupon",
  couponSchema
);