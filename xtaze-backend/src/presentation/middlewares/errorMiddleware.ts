import { Request, Response, NextFunction } from "express";

interface ErrorResponse {
  success: boolean;
  message: string;
  statusCode?: number;
  error?: unknown;
}

const errorMiddleware = (err: unknown, req: Request, res: Response, next: NextFunction) => {
  console.error("middleware called :", err, (err as Error).message);

  const statusCode = (err as any).statusCode || 500;

  const response: ErrorResponse = {
    success: false,
    message: (err as Error).message || "Internal Server Error",
    error: process.env.NODE_ENV === "development" ? err : undefined, // Include error details only in development
  };

  res.status(statusCode).json(response);
};

export default errorMiddleware;
