import IUser from '../domain/entities/IUser';
import { IUserRepository } from '../domain/repositories/IUserRepository';
import IOtpService from '../domain/service/IOtpService';
import IPasswordService from '../domain/service/IPasswordService';
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { uploadProfileCloud } from '../framework/service/cloudinary.service';
import UserModel from '../adapter/db/models/UserModel';
import { OAuth2Client } from "google-auth-library";
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2023-08-16" });

dotenv.config();
interface useCaseDependencies {
  repository: {
    userRepository: IUserRepository
  },
  service: {
    PasswordService: IPasswordService,
    OtpService: IOtpService;
  }
}

export default class UserUseCase {
  private _userRepository: IUserRepository //space for storage box 
  private _passwordService: IPasswordService // space for painting brush 
  private _otpService: IOtpService; // space for another tool
  private stripe: Stripe;

  constructor(dependencies: useCaseDependencies) { // boss giving the toys here 
    this._userRepository = dependencies.repository.userRepository // got the storage box 
    this._passwordService = dependencies.service.PasswordService // got the paint brush 
    this._otpService = dependencies.service.OtpService;
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2023-08-16",
    });
  }

  async registerUser(username: string, country: string, gender: string, year: number, phone: number, email: string, password: string): Promise<IUser> {

    console.log("najjn vanneee vannee vanne ")
    const [existingUserByEmail] = await Promise.all([
      this._userRepository.findByEmail(email),
      // this._userRepository.findByPhone(phone)
    ]);

    if (existingUserByEmail) {
      console.log("lml");

      throw new Error("User already exists with this email");
    }

    // if (existingUserByPhone) {
    //   throw new Error("User already exists with this phone number");
    // }

    const hashedPassword = await this._passwordService.hashPassword(password);
    console.log(hashedPassword, "ith hahed an ee ");

    const user = { username, country, gender, year, phone, email, password: hashedPassword }

    const userData = await this._userRepository.add(user);

    console.log(userData, "userdata anee ");
    return userData;
  }

  async sendOTP(email: string): Promise<string> {

    const findEmail = await this._userRepository.findByEmail(email) //using the storage 

    if (findEmail) {
      console.log("lml");
      return "403"
    }

    return this._otpService.sendOTP(email);
  }
  async checkUnique(username: string): Promise<boolean> {
    const user = await this._userRepository.findByUsername(username);
    return user === null;
  }



  async verifyOTP(otp: string): Promise<{ success: boolean; message: string }> {
    console.log("email ila ennn ariya otp enda", otp)
    const isStore = await this._otpService.isEmpty()
    if (isStore) {
      return { success: false, message: "This Otp is expired click the resend button" };
    }
    const data = await this._otpService.verifyOTP(otp);
    if (data) {
      return { success: true, message: "Otp verified successfully" };
    } else {
      return { success: false, message: "Invalid Otp" };
    }

  }



  async login(email: string, password: string): Promise<{ success: boolean; message: string; accessToken?: string;refreshToken?:string; user?: IUser }> {
    const user = await this._userRepository.findByEmail(email);
    if (!user) {
      return { success: false, message: "User not found" };
    }
    if (user.role === "admin" || user.role === "artist") {
      return { success: false, message: "This login form is for users" };
    }
    if (user.isActive === false) {
      return { success: false, message: "Your account is suspended!" };
    }
    const isPasswordValid = await this._passwordService.comparePassword(password, user.password);
    if (!isPasswordValid) {
      throw new Error("Invalid credentials!");
    }

    const accessToken = jwt.sign(
      { userId: user._id, email: user.email, role: "user" },
      process.env.JWT_SECRET!,
      { expiresIn: "15m" } // Short-lived
    );

    const refreshToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_REFRESH_SECRET!,
      { expiresIn: "7d" } // Long-lived
    );

    // No DB storage—cookie handles it in controller
    return {
      success: true,
      message: "Login successful!",
      accessToken,
      user,
      refreshToken // Send to controller to set in cookie
    };
  }

  async googleLogin(Token: string): Promise<{ success: boolean; message: string; accessToken?: string; refreshToken?: string; user?: IUser | null }> {
    try {
      const ticket = await client.verifyIdToken({
        idToken: Token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();
      if (!payload) throw new Error("Invalid Google token");
      const { email } = payload;

      const user = await UserModel.findOne({ email });
      if (user?.isActive === false) {
        return { success: false, message: "Your account is suspended!" };
      }
      if (user?.role === "admin" || user?.role === "artist") {
        return { success: false, message: "This login form is for users" };
      }
      if (!user) {
        return { success: false, message: "User not found. Please sign up." };
      }

      const userObj: IUser = { ...user.toObject(), _id: user._id.toString() };

      const accessToken = jwt.sign(
        { userId: user._id.toString(), email: user.email, role: "user" },
        process.env.JWT_SECRET!,
        { expiresIn: "15m" }
      );

      const refreshToken = jwt.sign(
        { userId: user._id.toString() },
        process.env.JWT_REFRESH_SECRET!,
        { expiresIn: "7d" }
      );

      return {
        success: true,
        message: "Login successful!",
        accessToken,
        refreshToken, // Send to controller for cookie
        user: userObj,
      };
    } catch (error) {
      console.error("Google Login Error:", error);
      return { success: false, message: "Google login failed" };
    }
  }

  async refresh(refreshToken: string): Promise<{ success: boolean; message: string; accessToken?: string; refreshToken?: string }> {
    try {
      // Verify refresh token from cookie
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as { userId: string };
      const user = await this._userRepository.findById(decoded.userId);

      if (!user) {
        return { success: false, message: "User not found" };
      }

      // Generate new access token
      const newAccessToken = jwt.sign(
        { userId: user._id, email: user.email, role: "user" },
        process.env.JWT_SECRET!,
        { expiresIn: "15m" }
      );

      // Optional: Rotate refresh token
      const newRefreshToken = jwt.sign(
        { userId: user._id },
        process.env.JWT_REFRESH_SECRET!,
        { expiresIn: "7d" }
      );

      return {
        success: true,
        message: "Token refreshed successfully",
        accessToken: newAccessToken,
        refreshToken: newRefreshToken // Send back for cookie update
      };
    } catch (error) {
      console.error("Refresh Token Error:", error);
      return { success: false, message: "Invalid or expired refresh token" };
    }
  }

  async uploadProfile(userId: string, file: Express.Multer.File): Promise<{ success: boolean; message: string, user?: IUser }> {
    try {
      const cloudinaryResponse = await uploadProfileCloud(file);

      const profilePicUrl = cloudinaryResponse.secure_url;

      // Update the user profile with the new image URL
      const updatedUser = await this._userRepository.updateProfile(userId, profilePicUrl);

      if (!updatedUser) {
        return { success: false, message: "Failed to update profile" };
      }

      return { success: true, message: "Profile updated successfully", user: updatedUser };
    } catch (error) {
      console.error("Error during profile upload:", error);
      return { success: false, message: "An error occurred while updating the profile" };
    }

  }
  async uploadBanner(userId: string, file: Express.Multer.File, isVideo: boolean): Promise<{ success: boolean; message: string, user?: IUser, isVideo?: boolean }> {
    try {
      const cloudinaryResponse = await uploadProfileCloud(file);

      const BannerPicUrl = cloudinaryResponse.secure_url;
      const updatedUser = await this._userRepository.uploadBanner(userId, BannerPicUrl);
      if (!updatedUser) {
        return { success: false, message: "Failed to update profile" };
      }

      return { success: true, message: "Banner updated successfully", user: updatedUser, isVideo: isVideo };
    } catch (error) {
      console.error("Error during Banner upload:", error);
      return { success: false, message: "An error occurred while updating the profile" };
    }

  }
  async updateBio(userId: string, bio: string): Promise<{ success: boolean; message: string, user?: IUser }> {
    try {

      const updated = await this._userRepository.updateBio(userId, bio);

      if (!updated) {
        return { success: false, message: "Failed to update profile" };
      }

      return { success: true, message: "Profile updated successfully", user: updated };
    } catch (error) {
      console.error("Error during profile upload:", error);
      return { success: false, message: "An error occurred while updating the profile" };
    }

  }
  async addToLiked(userId: string, trackId: string): Promise<IUser | null> {
    try {
      const user = await this._userRepository.addToLiked(userId, trackId);

      if (!user) {
        return null;
      }

      return user; // Directly return the user object
    } catch (error) {
      console.error("Error during adding liked song:", error);
      throw new Error("An error occurred while updating liked songs.");
    }
  }


  async getUpdatedArtist(artistId: string): Promise<IUser | null> {
    return await this._userRepository.getupdatedArtist(artistId);
  }
  async execute(userId: string, priceId: string): Promise<Stripe.Checkout.Session> {
    try {
      // Check if user exists
      const user = await this._userRepository.findById(userId);
      if (!user) {
        throw new Error("User not found");
      }

      // Create checkout session with Stripe
      const session = await this.stripe.checkout.sessions.create({
        payment_method_types: ["card", "link"], // Add "link" for one-click
        line_items: [{ price: priceId, quantity: 1 }],
        mode: "subscription",
        success_url: "http://localhost:5000/success", // Match frontend URL
        cancel_url: "http://localhost:5000/cancel",
        metadata: { userId },
      });

      // Update user subscription status (premium: true)
      const updatedUser = await this._userRepository.updateUserSubscription(userId, true);
      if (!updatedUser) {
        throw new Error("Failed to update user subscription status");
      }

      return session;
    } catch (error: any) {
      console.error("Error in UserUseCase.execute:", error);
      throw error; // Propagate error to controller
    }
  }
}



