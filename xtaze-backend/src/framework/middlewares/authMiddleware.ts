import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const SECRET_KEY = process.env.JWT_SECRET || "your_secret_key"; // Store in .env

// Extend Request type to include 'user'
interface AuthenticatedRequest extends Request {
  user?: any;
}
//token check
export const authenticateUser = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  console.log("vannila")
  const token = req.headers.authorization?.split(" ")[1]; // Extract token from "Bearer <token>"
  console.log("vannil22a")
if (!token) {
  console.log("pani kitty")
  res.status(401).json({ success: false, message: "Unauthorized: No token provided" });
  return; 
}

try {
  const decoded = jwt.verify(token, SECRET_KEY);
  req.user = decoded; 
    next();
  } catch (error) {
    res.status(403).json({ success: false, message: "Forbidden: Invalid token" });
    return; 
  }
};
