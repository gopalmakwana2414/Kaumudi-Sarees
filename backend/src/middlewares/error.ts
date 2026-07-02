import { Request, Response, NextFunction } from "express";

// 404 handler — for any route that doesn't match a registered endpoint.
export const notFound = (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
};

// Centralized error handler — catches anything thrown or passed to next(err)
// that wasn't already handled inside a controller's own try/catch.
export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error("Unhandled error:", err);

  // Mongoose bad ObjectId
  if (err.name === "CastError") {
    return res.status(400).json({
      success: false,
      message: "Invalid ID format",
    });
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((e: any) => e.message);
    return res.status(400).json({
      success: false,
      message: messages.join(", "),
    });
  }

  // Mongo duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || "field";
    return res.status(400).json({
      success: false,
      message: `Duplicate value for ${field}. Please use a different value.`,
    });
  }

  // Multer file size / type errors
  if (err.name === "MulterError") {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }

  const statusCode = err.statusCode || 500;

  return res.status(statusCode).json({
    success: false,
    message: err.message || "Something went wrong on our end. Please try again.",
  });
};
