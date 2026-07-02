import { Request, Response } from "express";
import { sendContactEmail } from "../services/emailService";

export const submitContactForm = async (req: Request, res: Response) => {
  try {
    const { name, email, phone, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        message: "Name, email and message are required",
      });
    }

    await sendContactEmail({ name, email, phone, message });

    return res.status(200).json({
      success: true,
      message: "Message sent successfully! We'll get back to you soon.",
    });
  } catch (error: any) {
    console.error("Contact form error:", error.message);
    return res.status(500).json({
      message: "Failed to send message. Please try again later.",
    });
  }
};
