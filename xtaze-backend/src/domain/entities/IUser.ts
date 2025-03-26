import { ObjectId } from "mongoose";

export default interface IUser {
  _id?: string;
  username: string;
  country: string;
  gender: string;
  year: number;
  phone: number;
  email: string;
  password: string;
  premium?: string;
  role?: "user" | "artist" | "provider" | "admin";
  isActive?: boolean; 
  profilePic?:string;
  bio?:string;
  banner?:string;
  likedSongs?:string[];
  stripePaymentMethodId?:string| null
}

