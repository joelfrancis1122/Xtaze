

import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { HttpStatus } from "../../domain/constants/httpStatus";
import UserModel from "../../infrastructure/db/models/UserModel";

dotenv.config();

const SECRET_KEY = process.env.JWT_SECRET || "kitila";

interface AuthenticatedRequest extends Request {
  user?: { id: string; email: string; role: string;[key: string]: any };
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

  if (!token) {
    throw new AppError("Unauthorized: No token provided", HttpStatus.UNAUTHORIZED);
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY) as AuthenticatedRequest["user"];
    req.user = decoded;
    next();
  } catch (error) {
    throw new AppError("Forbidden: Invalid token", HttpStatus.UNAUTHORIZED);
  }
};

export const authenticateUser = async (req: AuthenticatedRequest,res: Response,next: NextFunction): Promise<void> => {
  try {

    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      throw { status: HttpStatus.UNAUTHORIZED, message: "No token provided" };
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    req.user = { id: decoded.userId, email: decoded.email, role: decoded.role };
    const user = await UserModel.findById(req.user.id);
    if (!user) {
      throw { status: HttpStatus.UNAUTHORIZED, message: "User not found" };
    }
    if (!user.isActive) {
      throw { status: HttpStatus.FORBIDDEN, message: "Account disabled" };
    }
    if (req.user.role !== "user") {
      throw { status: HttpStatus.FORBIDDEN, message: "User role required" };
    }
    next();
  } catch (err: any) {
    next({
      statusCode: err.status || HttpStatus.UNAUTHORIZED,
      message: err.message || "Invalid token",
    });
  }
}

export const authenticateArtist = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  try {
    authenticateToken(req, res, () => {
      if (req.user?.role !== "artist") {
        throw new AppError("Forbidden: Artist role required", HttpStatus.FORBIDDEN);
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
        throw new AppError("Forbidden: Admin role required", HttpStatus.FORBIDDEN);
      }
      next();
    });
  } catch (error) {
    next(error);
  }
};