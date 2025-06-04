import { IAdminRepository } from "../domain/repositories/IAdminRepository";
import IPasswordService from "../domain/service/IPasswordService"

import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import IUser from "../domain/entities/IUser";
import { uploadImageToCloud, uploadProfileCloud } from "../framework/service/cloudinary.service";
import { IBanner } from "../domain/entities/IBanner";
import Stripe from "stripe";
import AppError from "../utils/AppError";
import { ICoupon } from "../domain/entities/ICoupon";
import { ITrack } from "../domain/entities/ITrack";
import { MusicMonetization } from "../domain/entities/IMonetization";
import UserModel from "../adapter/db/models/UserModel";
import { Track } from "../adapter/db/models/TrackModel";
import { IVerificationRequest } from "../domain/entities/IVeridicationRequest";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2023-08-16" });

dotenv.config();

interface useCaseDependencies {
  repository: {
    adminRepository: IAdminRepository
  },
  service: {
    passwordService: IPasswordService
  }
}

export default class AdminUseCase {
  private _adminRepository: IAdminRepository
  private _passwordService: IPasswordService
  private stripe: Stripe;

  constructor(dependencies: useCaseDependencies) {
    this._adminRepository = dependencies.repository.adminRepository
    this._passwordService = dependencies.service.passwordService
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2023-08-16",
    });
  }

  async login(email: string, password: string): Promise<{ success: boolean; message: string; token?: string; admin?: IUser }> {
    const admin = await this._adminRepository.findByEmail(email);
    console.log("thisi is admin broo", admin)
    if (!admin) {
      return { success: false, message: "User not found!" };
    }
    if (admin.role !== "admin") {
      return { success: false, message: "Only admins are allowed to login!" };
    }

    const isPasswordValid = await this._passwordService.comparePassword(password, admin.password);
    if (!isPasswordValid) {
      return { success: false, message: "Invalid credentials!" };
    }
    const token = jwt.sign({ userId: admin._id, email: admin.email, role: "admin" }, process.env.JWT_SECRET!, { expiresIn: "7d" });

    return {
      success: true,
      message: "Login successful!",
      token,
      admin
    };
  }

  async toggleBlockUnblockArtist(id: string): Promise<IUser | null> {
    const artist = await this._adminRepository.getArtistById(id);
    if (!artist) {
      throw new Error("Artist not found");
    }
    const newStatus = !artist.isActive;

    return await this._adminRepository.updateArtistStatus(id, newStatus);
  }

  async addBanner(title: string, description: string, action: string, isActive: boolean, createdBy: string, file: Express.Multer.File) {

    const addBanner = await this._adminRepository.createBanner(title, description, action, isActive, createdBy, file)
    return addBanner;

  }
  async getAllBanners(): Promise<IBanner[] | null> {
    const banners = await this._adminRepository.findAll()
    return banners;

  }
  async deleteBanner(id: string): Promise<IBanner | null> {
    const banners = await this._adminRepository.findBanner(id)
    return banners;

  }
  async updateBanner(id: string, title: string, description: string, action: string, isActive: boolean, file: Express.Multer.File): Promise<IBanner | null> {
    const banners = await this._adminRepository.findBannerforUpdate(id, title, description, action, isActive, file)
    return banners;

  }
  async getCoupons(): Promise<ICoupon[] | null> {
    const coupons = await this._adminRepository.getCoupons()
    return coupons;
  }
  async deleteCoupon(couponId: string): Promise<ICoupon | null> {
    const coupons = await this._adminRepository.deleteCoupon(couponId)
    return coupons;
  }



  async updateCoupon(couponId: string, couponData: ICoupon): Promise<ICoupon | null> {
    if (!couponId) {
      throw new Error("Coupon ID is required");
    }

    // Validation for provided fields
    if (couponData.code && !couponData.code.trim()) {
      throw new Error("Coupon code cannot be empty");
    }
    if (couponData.discountAmount !== undefined) {
      if (couponData.discountAmount < 0) {
        throw new Error("Discount amount must be 0 or more");
      }
      if (couponData.discountAmount > 100) {
        throw new Error("Discount cannot exceed 100%");
      }
    }
    if (couponData.expires) {
      const expiresDate = new Date(couponData.expires);
      if (expiresDate < new Date()) {
        throw new Error("Expiration date must be future");
      }
      couponData.expires = expiresDate.toISOString(); // Normalize to string
    }
    if (couponData.maxUses !== undefined && couponData.maxUses < 0) {
      throw new Error("Max uses must be 0 or more");
    }

    // Add status: "active" to the update data
    const updatedCouponData: ICoupon = {
      ...couponData,
      status: "active", // Always set to active
    };

    try {
      const updatedCoupon = await this._adminRepository.updateCoupon(couponId, updatedCouponData);
      if (!updatedCoupon) {
        throw new Error("Coupon not found");
      }
      return updatedCoupon;
    } catch (error: unknown) {
      throw new Error((error as Error).message || "Failed to update coupon");
    }
  }



  async createPlan(
    name: string,
    description: string,
    price: number, // In dollars, e.g., 10.00
    interval: "month" | "year"
  ): Promise<{ product: Stripe.Product; price: Stripe.Price }> {
    try {
      // Create the product in Stripe
      const product = await this.stripe.products.create({
        name,
        description,
      });

      // Create the price for the product
      const priceObj = await this.stripe.prices.create({
        product: product.id,
        unit_amount: Math.round(price * 100), // Convert to cents, e.g., 10.00 → 1000
        currency: "usd",
        recurring: { interval },
      });

      return { product, price: priceObj };
    } catch (error: unknown) {
      console.error("Error in UserUseCase.createPlan:", error);
      throw new AppError("Failed to create subscription plan", 500);
    }
  }
  async getPlans(): Promise<{ product: Stripe.Product; price: Stripe.Price }[]> {
    try {
      const products = await this.stripe.products.list({ limit: 100, active: true });
      const prices = await this.stripe.prices.list({ limit: 100 });
      const plans = products.data
        .map((product) => {
          const price = prices.data.find((p) => p.product === product.id && p.active);
          return { product, price };
        })
        .filter((plan): plan is { product: Stripe.Product; price: Stripe.Price } => !!plan.price);

      return plans;
    } catch (error: unknown) {
      console.error("Error in UserUseCase.getPlans:", error);
      throw new AppError("Failed to fetch subscription plans", 500);
    }
  }
  async archivePlan(productId: string): Promise<Stripe.Product> {
    try {
      const product = await this.stripe.products.update(productId, {
        active: false,
      });

      return product;
    } catch (error: any) {
      console.error("Error in UserUseCase.archivePlan:", error);
      if (error.type === "StripeInvalidRequestError" && error.code === "resource_missing") {
        throw new AppError("Product not found", 404);
      }
      throw new AppError("Failed to archive subscription plan", 500);
    }
  }
  async updatePlan(
    productId: string,
    name: string,
    description: string,
    price: number, // In dollars
    interval: "month" | "year"
  ): Promise<{ product: Stripe.Product; price: Stripe.Price }> {
    try {
      // Update the product
      const product = await this.stripe.products.update(productId, {
        name,
        description,
      });

      // Get existing prices for this product
      const existingPrices = await this.stripe.prices.list({ product: productId });
      const activePrice = existingPrices.data.find((p) => p.active);

      // If price or interval changed, create new price and deactivate old one
      const newUnitAmount = Math.round(price * 100);
      if (
        !activePrice ||
        activePrice.unit_amount !== newUnitAmount ||
        activePrice.recurring?.interval !== interval
      ) {
        // Deactivate old price if it exists
        if (activePrice) {
          await this.stripe.prices.update(activePrice.id, { active: false });
        }
        // Create new price
        const newPrice = await this.stripe.prices.create({
          product: productId,
          unit_amount: newUnitAmount,
          currency: "usd",
          recurring: { interval },
        });
        return { product, price: newPrice };
      }

      return { product, price: activePrice! };
    } catch (error: any) {
      console.error("Error in UserUseCase.updatePlan:", error);
      if (error.type === "StripeInvalidRequestError" && error.code === "resource_missing") { 
        throw new AppError("Product not found", 404);
      }
      throw new AppError("Failed to update subscription plan", 500);
    }
  }
  async createCoupon(
    code: string,
    discountAmount: number,
    expires: Date,
    maxUses: number,
    uses: number
  ): Promise<ICoupon | null> {
    // Validation
    if (!code || discountAmount === undefined || !expires || maxUses === undefined) {
      throw new Error("All fields (code, discountType, discountAmount, expires, maxUses) are required");
    }



    if (typeof discountAmount !== "number" || discountAmount < 0) {
      throw new Error("discountAmount must be a non-negative number");
    }

    if (typeof maxUses !== "number" || maxUses < 0) {
      throw new Error("maxUses must be a non-negative number");
    }



    if (expires && new Date(expires) < new Date()) {
      throw new Error("Expiration date must be future");
    }

    if (typeof uses !== "number" || uses < 0) {
      throw new Error("uses must be a non-negative number");
    }
    const couponData = {
      code,
      discountAmount,
      expires: expires.toISOString(),
      status: "active",
      maxUses,
      uses,
    };

    try {
      const savedCoupon = await this._adminRepository.createCoupon(couponData);
      return savedCoupon;
    } catch (error: unknown) {
      throw error;
    }
  }




  async verifyCoupon(code: string): Promise<ICoupon> {
    if (!code) throw new Error("Coupon code is required");
    const coupon = await this._adminRepository.findCouponByCode(code);
    if (!coupon) throw new Error("Invalid coupon");
    if (!coupon.uses) {
      coupon.uses = 0
    }
    if (coupon.status !== "active" || coupon.uses >= coupon.maxUses || new Date(coupon.expires) < new Date()) {
      throw new Error("Coupon is expired");
    }
    return coupon;
  }


  async getMusicMonetization(): Promise<MusicMonetization[] | null> {

    const tracks = await this._adminRepository.getMusicMonetization()
    return tracks

  }
  async getUsersByIds(userIds:string[]): Promise<IUser[]|null> {

    const users = await this._adminRepository.getUsersByIds(userIds)
    return users

  }
  async updateVerificationStatus(status:string,feedback: string | null,id:string) :Promise<IVerificationRequest|null> {

    const updated = await this._adminRepository.updateVerificationStatus(status,feedback,id)
    return updated

  }

  async fetchVerification(): Promise<IVerificationRequest | null> {

    return await this._adminRepository.fetchVerification();
  }

  async artistPayout(artistName: string): Promise<{ success: boolean; sessionUrl: string }> {
    try {
      const artist = await UserModel.findOne({ username: artistName, role: "artist" });
     
      if (!artist) throw new Error("Artist not found");

      const paymentMethodId = artist.stripePaymentMethodId;
      if (!paymentMethodId) throw new Error("Artist has no payment method linked");

      const tracks = await Track.find({ artists: artistName });
      if (!tracks.length) throw new Error("No tracks found for artist");

      const revenuePerPlay = 0.50;
      const currentMonth = new Date().toISOString().slice(0, 7);
      const monthlyRevenue = tracks.reduce((sum, track) => {
        const monthlyPlays = track.playHistory?.find((h) => h.month === currentMonth)?.plays || 0;
        return sum + monthlyPlays * revenuePerPlay;
      }, 0);

      if (monthlyRevenue <= 0) throw new Error("No revenue to payout for this month");

      const amount = Math.round(monthlyRevenue * 100); 
      artist.paymentStatus = true;
      await artist.save()

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: `Payout for ${artistName}`,
                description: `Earnings for ${currentMonth}`,
              },
              unit_amount: amount, // Amount in cents
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: "https://xtaze.fun/admin/payoutSuccess?artistName=" + encodeURIComponent(artistName),
        cancel_url: "https://xtaze.fun/admin/payoutCancel",
        metadata: { artistName, amount: amount.toString() }, // Track artist details
      });

      console.log(`Checkout Session created for ${artistName}, URL: ${session.url}`);
      return { success: true, sessionUrl: session.url! }; // Return URL for redirect
    } catch (error: unknown) {
      console.error("Error in artistPayout:", error);
      throw new Error((error as Error).message || "Failed to create payout session");
    }
  }
}
  
  


