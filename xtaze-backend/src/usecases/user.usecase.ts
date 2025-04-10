import IUser from '../domain/entities/IUser';
import { IUserRepository } from '../domain/repositories/IUserRepository';
import IOtpService from '../domain/service/IOtpService';
import IPasswordService from '../domain/service/IPasswordService';
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { uploadImageToCloud, uploadProfileCloud } from '../framework/service/cloudinary.service';
import UserModel from '../adapter/db/models/UserModel';
import { OAuth2Client } from "google-auth-library";
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
import Stripe from "stripe";
import IEmailService from '../domain/service/IEmailService';
import { IPlaylist } from '../domain/entities/IPlaylist';
import { ITrack } from '../domain/entities/ITrack';
import { IBanner } from '../domain/entities/IBanner';
import { SubscriptionHistory } from '../domain/entities/ISubscriptionHistory';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2023-08-16" });
dotenv.config();

dotenv.config();
interface useCaseDependencies {
  repository: {
    userRepository: IUserRepository
  },
  service: {
    PasswordService: IPasswordService,
    OtpService: IOtpService;
    EmailService: IEmailService;
  }
}

export default class UserUseCase {
  private _userRepository: IUserRepository //space for storage box 
  private _passwordService: IPasswordService // space for painting brush 
  private _otpService: IOtpService; // space for another tool
  private _emailService: IEmailService;
  private stripe: Stripe;

  constructor(dependencies: useCaseDependencies) { // boss giving the toys here 
    this._userRepository = dependencies.repository.userRepository // got the storage box 
    this._passwordService = dependencies.service.PasswordService // got the paint brush 
    this._otpService = dependencies.service.OtpService;
    this._emailService = dependencies.service.EmailService;
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2023-08-16",
    });
  }

  async registerUser(username: string, country: string, gender: string, year: number, phone: number, email: string, password: string): Promise<IUser> {

    const [existingUserByEmail] = await Promise.all([
      this._userRepository.findByEmail(email),
      // this._userRepository.findByPhone(phone)
    ]);

    if (existingUserByEmail) {

      throw new Error("User already exists with this email");
    }

    // if (existingUserByPhone) {
    //   throw new Error("User already exists with this phone number");
    // }

    const hashedPassword = await this._passwordService.hashPassword(password);

    const user = { username, country, gender, year, phone, email, password: hashedPassword }

    const userData = await this._userRepository.add(user);

    return userData;
  }

  async sendOTP(email: string): Promise<string> {

    const findEmail = await this._userRepository.findByEmail(email) //using the storage 

    if (findEmail) {
      return "403"
    }
    return this._otpService.sendOTP(email);
  }



  async checkUnique(username: string): Promise<boolean> {
    const user = await this._userRepository.findByUsername(username);
    return user === null;
  }

  async forgotPassword(email: string): Promise<{ success: boolean; message: string }> {
    const user = await this._userRepository.findByEmail(email);
    if (!user) {
      throw new Error("User not found");
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET!, {
      expiresIn: "1h",
    });

    await this._emailService.sendEmail(email, "Password Reset", token);

    return { success: true, message: "Reset link sent successfully" };  // ✅ Add return statement
  }

  async resetPassword(token: string, password: string): Promise<{ success: boolean; message: string }> {
    // Create an instance of PasswordService

    try {
      // Verify JWT token
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
      if (!decoded) {
      }
      // Find user
      const user = await this._userRepository.findById(decoded.userId);
      if (!user) {
        throw new Error("User not found");
      }

      // Use PasswordService to hash the new password
      const hashedPassword = await this._passwordService.hashPassword(password);

      // Update user's password
      user.password = hashedPassword;
      await this._userRepository.updatePassword(user);

      return {
        success: true,
        message: "Password reset successfully"
      };
    } catch (error) {
      throw error; // You might want to handle this more specifically based on your needs
    }
  }


  async verifyOTP(otp: string): Promise<{ success: boolean; message: string }> {
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

  async login(email: string, password: string): Promise<{ success: boolean; message: string; token?: string; refreshToken?: string; user?: IUser }> {
    const user = await this._userRepository.findByEmail(email);
    if (!user) return { success: false, message: "User not found" };
    if (user.role === "admin" || user.role === "artist") return { success: false, message: "This login form is for users" };
    if (user.isActive === false) return { success: false, message: "Your account is suspended!" };

    const isPasswordValid = await this._passwordService.comparePassword(password, user.password);
    if (!isPasswordValid) throw new Error("Invalid credentials!");
    console.log("JWT_SECRET at login:", process.env.JWT_SECRET);

    const token = jwt.sign(
      { userId: user._id, email: user.email, role: "user" },
      process.env.JWT_SECRET!,
      { expiresIn: "15m" } // Short-lived access token
    );
    const refreshToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_REFRESH_SECRET!,
      { expiresIn: "7d" } // Long-lived refresh token
    );
    console.log("ith unda asaa", refreshToken);

    return {
      success: true,
      message: "Login successful!",
      token,
      refreshToken,
      user,
    };
  }

  async googleLogin(Token: string): Promise<{ success: boolean; message: string; token?: string; refreshToken?: string; user?: IUser | null }> {
    try {
      const ticket = await client.verifyIdToken({
        idToken: Token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();
      if (!payload) throw new Error("Invalid Google token");
      const { email } = payload;
      console.log("Google Payload:", payload);

      const user = await UserModel.findOne({ email });
      if (user?.isActive === false) return { success: false, message: "Your account is suspended!" };
      if (user?.role === "admin" || user?.role === "artist") return { success: false, message: "This login form is for users" };
      if (!user) return { success: false, message: "User not found. Please sign up." };

      const userObj: IUser = { ...user.toObject(), _id: user._id.toString() };

      const token = jwt.sign(
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
        token,
        refreshToken,
        user: userObj,
      };
    } catch (error) {
      console.error("Google Login Error:", error);
      return { success: false, message: "Google login failed" };
    }
  }

  async refresh(refreshToken: string): Promise<{ success: boolean; message: string; token?: string; refreshToken?: string }> {
    try {
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as { userId: string };
      const user = await this._userRepository.findById(decoded.userId);
      if (!user) return { success: false, message: "User not found" };
      if (user.isActive === false) return { success: false, message: "Your account is suspended!" };

      const newToken = jwt.sign(
        { userId: user._id, email: user.email, role: "user" },
        process.env.JWT_SECRET!,
        { expiresIn: "15m" }
      );
      const newRefreshToken = jwt.sign(
        { userId: user._id },
        process.env.JWT_REFRESH_SECRET!,
        { expiresIn: "7d" }
      );

      return {
        success: true,
        message: "Token refreshed successfully",
        token: newToken,
        refreshToken: newRefreshToken,
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
  async updateImagePlaylist(id: string, file: Express.Multer.File): Promise<{ success: boolean; message: string, data?: IPlaylist }> {
    try {
      const cloudinaryResponse = await uploadImageToCloud(file);

      const coverpage = cloudinaryResponse.secure_url;
      const updatedData = await this._userRepository.updateImagePlaylist(id, coverpage);
      if (!updatedData) {
        return { success: false, message: "Failed to update profile" };
      }

      return { success: true, message: "Banner updated successfully", data: updatedData };
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

  async addToPlaylist(userId: string, playlistId: string, trackId: string): Promise<IPlaylist | null> {
    try {
      const user = await this._userRepository.addToPlaylist(userId, trackId, playlistId);
      if (!user) {
        return null;
      }

      return user;
    } catch (error) {
      console.error("Error during adding liked song:", error);
      throw new Error("An error occurred while updating liked songs.");
    }
  }


  async createPlaylist(_id: string, newplaylist: IPlaylist): Promise<IPlaylist | null> {
    try {
      const playlist = await this._userRepository.createPlaylist(_id, newplaylist);

      if (!playlist) {
        return null;
      }

      return playlist; // Directly return the user object
    } catch (error) {
      console.error("Error during adding playlist:", error);
      throw new Error("An error occurred while creating playlist.");
    }
  }
  async getAllPlaylist(userId: string): Promise<IPlaylist[] | null> {
    try {
      const playlist = await this._userRepository.findByCreator(userId);

      if (!playlist) {
        return null;
      }

      return playlist;
    } catch (error) {
      console.error("Error during adding playlist:", error);
      throw new Error("An error occurred while creating playlist.");
    }
  }
  async getPlaylist(id: string, pageNum: number, limitNum: number, skip: number): Promise<{ tracks: ITrack[]; total: number } | null> {
    try {
      const playlist = await this._userRepository.getPlaylist(id, pageNum, limitNum, skip);

      if (!playlist) {
        return null;
      }

      return playlist;
    } catch (error) {
      console.error("Error during adding playlist:", error);
      throw new Error("An error occurred while creating playlist.");
    }
  }
  async deletePlaylist(id: string): Promise<IPlaylist | null> {
    try {
      const playlist = await this._userRepository.deletePlaylist(id);
      if (!playlist) {
        return null
      }
      return playlist

    } catch (error) {
      console.error("Error during deleteing playlist:", error);
      throw new Error("An error occurred while deleteing.");
    }
  }
  async updateNamePlaylist(id: string, playlistName: string): Promise<IPlaylist | null> {
    try {
      const playlist = await this._userRepository.updateNamePlaylist(id, playlistName);
      if (!playlist) {
        return null
      }
      return playlist

    } catch (error) {
      console.error("Error during editing playlist:", error);
      throw new Error("An error occurred while editing.");
    }
  }
  async getAllTracks(): Promise<ITrack[] | null> {
    try {
      const tracks = await this._userRepository.getAllTracks();
      if (!tracks) {
        return null
      }
      return tracks

    } catch (error) {
      console.error("Error during editing playlist:", error);
      throw new Error("An error occurred while editing.");
    }
  }
  async fetchGenreTracks(GenreName: string): Promise<ITrack[] | null> {
    try {
      const tracks = await this._userRepository.fetchGenreTracks(GenreName);
      if (!tracks) {
        return null
      }
      return tracks

    } catch (error) {
      console.error("Error during editing playlist:", error);
      throw new Error("An error occurred while editing.");
    }
  }
  async resetPaymentStatus(): Promise<void> {
    try {
      await this._userRepository.resetPaymentStatus();
  
    } catch (error) {
      console.error("Error during reset:", error);
      throw new Error("An error occurred while reset.");
    }
  }


  async getUpdatedArtist(artistId: string): Promise<IUser | null> {
    return await this._userRepository.getupdatedArtist(artistId);
  }
  async execute(userId: string, priceId: string, couponCode?: string): Promise<Stripe.Checkout.Session> {
    try {
      const user = await this._userRepository.findById(userId);
      if (!user) {
        throw new Error("User not found");
      }

      // Retrieve price and product
      const price = await this.stripe.prices.retrieve(priceId);
      const product = await this.stripe.products.retrieve(price.product as string);
      const planName = product.name;

      // Base session configuration
      const sessionConfig: Stripe.Checkout.SessionCreateParams = {
        payment_method_types: ["card", "link"],
        line_items: [{ price: priceId, quantity: 1 }],
        mode: "subscription",
        success_url: "https://xtaze.fun/success",
        cancel_url: "https://xtaze.fun/cancel",
        metadata: {
          userId,
          couponCode: couponCode || "",
          planName, // Store planName for webhook
        },
      };

      // Handle coupon if provided
      if (couponCode) {
        const coupon = await this._userRepository.findCouponByCode(couponCode);
        if (!coupon) throw new Error("Incorrect coupon code");

        const currentUses = coupon.uses ?? 0;
        const usedUsers = coupon.users ?? [];

        if (
          coupon.status !== "active" ||
          currentUses >= coupon.maxUses ||
          new Date(coupon.expires) < new Date()
        ) {
          throw new Error("Coupon is expired");
        }

        const isCouponUsed = await this._userRepository.checkCouponisUsed(couponCode, userId);
        if (isCouponUsed) {
          throw new Error("You've already used this coupon. Try a different one");
        }

        const stripeCoupon = await this.stripe.coupons.create({
          percent_off: coupon.discountAmount,
          duration: "once",
          name: `Coupon_${couponCode}`,
        });

        sessionConfig.discounts = [{ coupon: stripeCoupon.id }];
      }

      const session = await this.stripe.checkout.sessions.create(sessionConfig);
      return session;
    } catch (error: any) {
      console.error("Error in UserUseCase.execute:", error);
      throw error;
    }
  }



  async confirmPayment(rawBody: Buffer, signature: string): Promise<void> {
    try {
      const webhookSecret = "whsec_FcgdilLPqYodrGbfaDLfygnA9ZD3nMlv"; // Your CLI secret
      const event = this.stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);

      if (event.type === "checkout.session.completed") {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        const couponCode = session.metadata?.couponCode;
        const planName = session.metadata?.planName;

        if (!userId || !planName) {
          throw new Error("Missing metadata in session");
        }

        // Update user subscription
        const updatedUser = await this._userRepository.updateUserSubscription(userId, planName);
        if (!updatedUser) {
          throw new Error("Failed to update user subscription status");
        }

        // Update coupon if used
        if (couponCode) {
          const coupon = await this._userRepository.findCouponByCode(couponCode);
          if (coupon) {
            const currentUses = coupon.uses ?? 0;
            const usedUsers = coupon.users ?? [];
            await this._userRepository.updateCouponByCode(couponCode, {
              uses: currentUses + 1,
              users: [...usedUsers, userId],
            });
          }
        }

        console.log(`Payment confirmed for user ${userId} with plan ${planName}`);
      }
    } catch (error: any) {
      console.error("Error in UserUseCase.confirmPayment:", error);
      throw error;
    }
  }


  async checkAndUpdateCouponStatus(): Promise<void> {
    try {
      const coupons = await this._userRepository.getCoupons();
      const currentDate = new Date();
      if (coupons)
        for (const coupon of coupons) {
          const expirationDate = new Date(coupon.expires);
          if (expirationDate < currentDate && coupon.status === "active") {
            await this._userRepository.updateCouponByCode(coupon.code, {
              status: "expired",
            });
            console.log(`Coupon ${coupon.code} expired and status updated to expired`);
          }
        }
      console.log("Coupon status check completed");
    } catch (error: any) {
      console.error("Error in checkAndUpdateCouponStatus:", error);
      throw error;
    }
  }

  async getAllBanners(): Promise<IBanner[] | null> {
    const banners = await this._userRepository.findAll()
    return banners;

  }
  async becomeArtist(id: string): Promise<IUser | null> {
    return await this._userRepository.becomeArtist(id)
  }


  async getSubscriptionHistoryFromStripe(): Promise<SubscriptionHistory[]> {
    try {
      // Fetch recent checkout sessions from Stripe
      const sessions = await this.stripe.checkout.sessions.list({
        limit: 50, // Max 100, adjust as needed
        expand: ["data.customer"], // Expand customer for email
      });

      // Filter only completed sessions
      const completedSessions = sessions.data.filter(
        (session) => session.status === "complete"
      );

      const history: SubscriptionHistory[] = await Promise.all(
        completedSessions.map(async (session) => {
          const userId = session.metadata?.userId || "unknown";
          const planName = session.metadata?.planName || "Unknown Plan";
          const price = (session.amount_total || 0) / 100; // Convert cents to dollars
          const purchaseDate = new Date(session.created * 1000).toISOString(); // Convert Unix timestamp

          // Fetch email from customer if available, or fallback to repository
          let email = (session.customer as Stripe.Customer)?.email || "N/A";
          if (!email || email === "N/A") {
            const user = await this._userRepository.findById(userId);
            email = user?.email || "N/A";
          }

          return {
            userId,
            email,
            planName,
            price,
            purchaseDate,
          };
        })
      );

      // Sort by purchase date descending (most recent first)
      return history.sort((a, b) => new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime());
    } catch (error: any) {
      console.error("Error in getSubscriptionHistoryFromStripe:", error);
      throw error;
    }
  }

  async getArtistByName(username:string): Promise<IUser|null> {

    const users = await this._userRepository.getArtistByName(username)
    return users

  }
}

