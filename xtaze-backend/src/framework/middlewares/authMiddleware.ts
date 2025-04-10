

import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const SECRET_KEY = process.env.JWT_SECRET || "kitila";

interface AuthenticatedRequest extends Request {
  user?: { id: string; email: string; role: string; [key: string]: any };
}

class AppError extends Error {
  statusCode: number;
  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  const token = req.headers.authorization?.split(" ")[1];
  console.log("Checking token:", token);

  if (!token) {
    throw new AppError("Unauthorized: No token provided", 401);
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY) as AuthenticatedRequest["user"];
    req.user = decoded;
    next();
  } catch (error) {
    console.log(error,"sasaaa")
    throw new AppError("Forbidden: Invalid token", 401);
  }
};

//role based access control 
export const authenticateUser = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  try {
    authenticateToken(req, res, () => {
      if (req.user?.role !== "user") {
        throw new AppError("Forbidden: User role required", 403);
      }
      next();
    });
  } catch (error) {
    next(error);
  }
};

export const authenticateArtist = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  try {
    authenticateToken(req, res, () => {
      if (req.user?.role !== "artist") {
        throw new AppError("Forbidden: Artist role required", 403);
      }
      next();
    });
  } catch (error) {
    next(error);
  }
};

export const authenticateAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  try {
    authenticateToken(req, res, () => {
      if (req.user?.role !== "admin") {
        throw new AppError("Forbidden: Admin role required", 403);
      }
      next();
    });
  } catch (error) {
    next(error);
  }
};