import { Request, Response, NextFunction } from "express";

interface ErrorResponse {
  success: boolean;
  message: string;
  statusCode?: number;
  error?: any;
}

const errorMiddleware = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error("middleware called :", err);

  const statusCode = err.statusCode || 500;
  const response: ErrorResponse = {
    success: false,
    message: err.message || "Internal Server Error",
    error: process.env.NODE_ENV === "development" ? err : undefined, // Send error stack only in development
  };

  res.status(statusCode).json(response);
};

export default errorMiddleware;
