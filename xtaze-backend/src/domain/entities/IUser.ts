import { ObjectId } from "mongoose";

export default interface IUser {
  _id?: ObjectId;
  username: string;
  country: string;
  gender: string;
  year: number;
  phone: number;
  email: string;
  password: string;
  premium?: boolean;
  role?: "user" | "artist" | "provider" | "admin";
  isActive?: boolean; 
}
