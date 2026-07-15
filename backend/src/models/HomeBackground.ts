import mongoose, { Document, Schema } from "mongoose";

export interface IHomeBackground extends Document {
  image: {
    url: string;
    public_id: string;
  };
  title?: string;
  subtitle?: string;
  buttonText?: string;
  buttonLink?: string;
  displayOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const homeBackgroundSchema = new Schema<IHomeBackground>(
  {
    image: {
      url: { type: String, required: true },
      public_id: { type: String, required: true },
    },
    title: {
      type: String,
      trim: true,
      default: "",
    },
    subtitle: {
      type: String,
      trim: true,
      default: "",
    },
    buttonText: {
      type: String,
      trim: true,
      default: "",
    },
    buttonLink: {
      type: String,
      trim: true,
      default: "",
    },
    displayOrder: {
      type: Number,
      default: 0,
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

homeBackgroundSchema.index({ isActive: 1, displayOrder: 1 });

export const HomeBackground = mongoose.model<IHomeBackground>(
  "HomeBackground",
  homeBackgroundSchema
);
