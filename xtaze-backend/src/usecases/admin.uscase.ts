import { IAdminRepository } from "../domain/repositories/IAdminRepository";
import IPasswordService from "../domain/service/IPasswordService"

import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import IUser from "../domain/entities/IUser";
import { uploadImageToCloud, uploadProfileCloud } from "../framework/service/cloudinary.service";
import { IBanner } from "../domain/entities/IBanner";
import Stripe from "stripe";
import AppError from "../utils/AppError";
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
    console.log("Artist coming to the toggle");
    const artist = await this._adminRepository.getArtistById(id);
    console.log("kittiyo", artist)
    if (!artist) {
      throw new Error("Artist not found");
    }
    const newStatus = !artist.isActive;
    console.log(newStatus, "new status");

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
  async deleteBanner(id:string): Promise<IBanner | null> {
    const banners = await this._adminRepository.findBanner(id)
    return banners;

  }
  async updateBanner(id:string,title:string,description:string,action:string,isActive:boolean,file:Express.Multer.File): Promise<IBanner | null> {
    const banners = await this._adminRepository.findBannerforUpdate(id,title,description,action,isActive,file)
    return banners;

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
    } catch (error: any) {
      console.error("Error in UserUseCase.createPlan:", error);
      throw new AppError("Failed to create subscription plan", 500);
    }
  }
  async getPlans(): Promise<{ product: Stripe.Product; price: Stripe.Price }[]> {
    try {
      const products = await this.stripe.products.list({ limit: 100, active: true });
      const prices = await this.stripe.prices.list({ limit: 100 });
      console.log(products, "ssssssssssssss");
      console.log(prices, "ooo");
      const plans = products.data
        .map((product) => {
          const price = prices.data.find((p) => p.product === product.id && p.active);
          return { product, price };
        })
        .filter((plan): plan is { product: Stripe.Product; price: Stripe.Price } => !!plan.price);
  
      return plans;
    } catch (error: any) {
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
}