import mongoose from "mongoose";
import { env } from "./env";

export const connectDB = async () => {
  try {
    if (!env.MONGO_URI) {
      throw new Error("MONGO_URI missing in environment");
    }

    await mongoose.connect(env.MONGO_URI);

    console.log("✅ MongoDB Connected Successfully");
  } catch (error: any) {
    console.error("❌ MongoDB Connection Failed:", error.message);
    process.exit(1);
  }
};