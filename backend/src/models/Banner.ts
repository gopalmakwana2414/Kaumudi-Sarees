import mongoose, { Document, Schema } from "mongoose";

export interface IBanner extends Document {
  title: string;
  subtitle?: string;
  image: {
    url: string;
    publicId: string;
  };
  link?: string;
  buttonText?: string;
  position: "hero" | "promo" | "category";
  isActive: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const bannerSchema = new Schema<IBanner>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    subtitle: {
      type: String,
      trim: true,
      default: "",
    },

    image: {
      url: { type: String, required: true },
      publicId: { type: String, required: true },
    },

    link: {
      type: String,
      default: "/shop",
    },

    buttonText: {
      type: String,
      default: "Shop Now",
    },

    position: {
      type: String,
      enum: ["hero", "promo", "category"],
      default: "hero",
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

bannerSchema.index({ position: 1, isActive: 1, order: 1 });

export const Banner = mongoose.model<IBanner>("Banner", bannerSchema);
