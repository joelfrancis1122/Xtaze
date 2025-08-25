
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import Stripe from "stripe";
import { IAdminRepository } from "../../domain/repositories/IAdminRepository";
import IPasswordService from "../../domain/service/IPasswordService";
import { ICoupon } from "../../domain/entities/ICoupon";
import { ITrack } from "../../domain/entities/ITrack";
import AppError from "../../utils/AppError";
import { MESSAGES } from "../../domain/constants/messages";
import TYPES from "../../domain/constants/types";
import { injectable } from "inversify";
import { inject } from "inversify";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2023-08-16" });

dotenv.config();
@injectable()
export default class UserUseCase {
  private _adminRepository: IAdminRepository
  private _passwordService: IPasswordService
  private stripe: Stripe;

  constructor(
    @inject(TYPES.AdminRepository) adminRepository: IAdminRepository,
    @inject(TYPES.PasswordService) passwordService: IPasswordService,
  ) {
    this._adminRepository = adminRepository
    this._passwordService = passwordService;
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2023-08-16",
    });
  }


  async login(email: string, password: string) {
    try{

      const admin = await this._adminRepository.findByEmail(email);
      if (!admin) return { success: false, message: MESSAGES.USER_NOT_FOUND };
      if (admin.role !== MESSAGES.ADMIN) return { success: false, message: MESSAGES.ONLY_ADMIN };
      const isPasswordValid = await this._passwordService.comparePassword(password, admin.password);
      if (!isPasswordValid) return { success: false, message: MESSAGES.LOGIN_FAILED };
      const token = jwt.sign({ userId: admin._id, email: admin.email, role: MESSAGES.ADMIN }, process.env.JWT_SECRET!, { expiresIn: "7d" });
      return { success: true, message: MESSAGES.LOGIN_SUCCESS, token, admin };
    }catch(err){

    }
  }

  async toggleBlockUnblockArtist(id: string) {
    const artist = await this._adminRepository.getArtistById(id);
    if (!artist)throw new Error(MESSAGES.ARTIST_NOTFOUND);
    const newStatus = !artist.isActive;
    return await this._adminRepository.updateArtistStatus(id, newStatus);
  }

  async addBanner(title: string, description: string, action: string, isActive: boolean, createdBy: string, file: Express.Multer.File) {
    const addBanner = await this._adminRepository.createBanner(title, description, action, isActive, createdBy, file)
    return addBanner;
  }


  async getAllTracks() {
    try {
      const tracks = await this._adminRepository.getAllTracks();
      if (!tracks) {
        return null
      }
      return tracks

    } catch (error) {
      console.error(MESSAGES.ERROR_UPDATING_PROFILE, error);
      throw new Error(MESSAGES.ERROR_UPDATING_PROFILE);
    }
  }
  async listArtistReleases(userId: string) {

    return await this._adminRepository.getAllTracksByArtist(userId) as ITrack[];

  }
  async getAllBanners() {
    const banners = await this._adminRepository.getAllBanners()
    return banners;

  }
  async deleteBanner(id: string) {
    const banners = await this._adminRepository.findBanner(id)
    return banners;

  }
  async updateBanner(id: string, title: string, description: string, action: string, isActive: boolean, file: Express.Multer.File) {
    const banners = await this._adminRepository.findBannerforUpdate(id, title, description, action, isActive, file)
    return banners;

  }
  async getCoupons() {
    const coupons = await this._adminRepository.getCoupons()
    return coupons;
  }
  async deleteCoupon(couponId: string) {
    const coupons = await this._adminRepository.deleteCoupon(couponId)
    return coupons;
  }



  async updateCoupon(couponId: string, couponData: ICoupon) {
    if (!couponId) {
      throw new Error(MESSAGES.MISSING_CRED);
    }

    if (couponData.code && !couponData.code.trim()) {
      throw new Error(MESSAGES.COUPON_CODE_EMPTY);
    }
    if (couponData.discountAmount !== undefined) {
      if (couponData.discountAmount < 0) {
        throw new Error(MESSAGES.DISCOUNT_AMOUNT_MIN);
      }
      if (couponData.discountAmount > 100) {
        throw new Error(MESSAGES.DISCOUNT_AMOUNT_MAX);
      }
    }
    if (couponData.expires) {
      const expiresDate = new Date(couponData.expires);
      if (expiresDate < new Date()) {
        throw new Error(MESSAGES.EXPIRATION_FUTURE);
      }
      couponData.expires = expiresDate.toISOString();
    }
    if (couponData.maxUses !== undefined && couponData.maxUses < 0) {
      throw new Error(MESSAGES.MAX_USES_MIN);
    }

    const updatedCouponData: ICoupon = {
      ...couponData,
      status: MESSAGES.ACTIVE,
    };

    try {
      const updatedCoupon = await this._adminRepository.updateCoupon(couponId, updatedCouponData);
      if (!updatedCoupon) {
        throw new Error(MESSAGES.COUPON_NOT_FOUND);
      }
      return updatedCoupon;
    } catch (error: unknown) {
      throw new Error((error as Error).message);
    }
  }



  async createPlan(
    name: string,
    description: string,
    price: number,
    interval: "month" | "year"
  ) {
    try {
      const product = await this.stripe.products.create({
        name,
        description,
      });

      const priceObj = await this.stripe.prices.create({
        product: product.id,
        unit_amount: Math.round(price * 100), //10.00 → 1000
        currency: "usd",
        recurring: { interval },
      });

      return { product, price: priceObj };
    } catch (error: unknown) {
      throw new AppError(MESSAGES.CREATE_PLAN_FAILED, 500);
    }
  }
  async getPlans() {
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
      throw new AppError(MESSAGES.FETCH_PLANS_FAILED, 500);
    }
  }
  async archivePlan(productId: string) {
    try {
      const product = await this.stripe.products.update(productId, {
        active: false,
      });

      return product;
    } catch (error: any) {
      if (error.type === MESSAGES.STRIPE_INVALID && error.code === MESSAGES.ER_CODE_MISSING) {
        throw new AppError(MESSAGES.PRODUCT_NOT_FOUND, 404);
      }
      throw new AppError(MESSAGES.ARCHIVE_PLAN_FAILED, 500);
    }
  }
  async updatePlan(
    productId: string,
    name: string,
    description: string,
    price: number, // In dollars
    interval: "month" | "year"
  ) {
    try {
      const product = await this.stripe.products.update(productId, {
        name,
        description,
      });

      const existingPrices = await this.stripe.prices.list({ product: productId });
      const activePrice = existingPrices.data.find((p) => p.active);

      const newUnitAmount = Math.round(price * 100);
      if (
        !activePrice ||
        activePrice.unit_amount !== newUnitAmount ||
        activePrice.recurring?.interval !== interval
      ) {
   
        if (activePrice) {
          await this.stripe.prices.update(activePrice.id, { active: false });
        }
       
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
      if (error.type === MESSAGES.STRIPE_INVALID && error.code === MESSAGES.ER_CODE_MISSING) {
        throw new AppError(MESSAGES.PRODUCT_NOT_FOUND, 404);
      }
      throw new AppError(MESSAGES.SUBSCRIPTION_FAILED, 500);
    }
  }
  async createCoupon(
    code: string,
    discountAmount: number,
    expires: Date,
    maxUses: number,
    uses: number
  ) {
    // Validation
    if (!code || discountAmount === undefined || !expires || maxUses === undefined) {
      throw new Error(MESSAGES.CREATE_COUPON_ALL_REQUIRED);
    }



    if (typeof discountAmount !== MESSAGES.NUMBER || discountAmount < 0) {
      throw new Error(MESSAGES.DISCOUNT_AMOUNT_INVALID);
    }

    if (typeof maxUses !== MESSAGES.NUMBER || maxUses < 0) {
      throw new Error(MESSAGES.MAX_USES_INVALID);
    }



    if (expires && new Date(expires) < new Date()) {
      throw new Error(MESSAGES.EXPIRATION_FUTURE);
    }

    if (typeof uses !== MESSAGES.NUMBER || uses < 0) {
      throw new Error(MESSAGES.USES_INVALID);
    }
    const couponData = {
      code,
      discountAmount,
      expires: expires.toISOString(),
      status: MESSAGES.ACTIVE,
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




  async verifyCoupon(code: string) {
    if (!code) throw new Error(MESSAGES.COUPON_CODE_REQUIRED);
    const coupon = await this._adminRepository.findCouponByCode(code);
    if (!coupon) throw new Error(MESSAGES.INVALID_COUPON);
    if (!coupon.uses) {
      coupon.uses = 0
    }
    if (coupon.status !== MESSAGES.ACTIVE || coupon.uses >= coupon.maxUses || new Date(coupon.expires) < new Date()) {
      throw new Error(MESSAGES.COUPON_EXPIRED);
    }
    return coupon;
  }


  async getMusicMonetization(page: number, limit: number) {

    const tracks = await this._adminRepository.getMusicMonetization(page, limit)
    return tracks
  }


  async getUsersByIds(userIds: string[]) {

    const users = await this._adminRepository.getUsersByIds(userIds)
    return users

  }
  async updateVerificationStatus(status: string, feedback: string | null, id: string) {

    const updated = await this._adminRepository.updateVerificationStatus(status, feedback, id)
    return updated

  }

  async fetchVerification(page: number, limit: number) {

    const { data, total } = await this._adminRepository.fetchVerification(page, limit);
    return {
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    }
  }

  async artistPayout(artistName: string) {
    try {
      const artist = await this._adminRepository.findArtist(artistName as string)

      if (!artist) throw new Error(MESSAGES.ARTIST_NOTFOUND);

      const paymentMethodId = artist.stripePaymentMethodId;
      if (!paymentMethodId) throw new Error(MESSAGES.ARTIST_NO_PAYMENT_METHOD);

      const tracks = await this._adminRepository.findTracks(artistName as string)
      if (!tracks) throw new Error(MESSAGES.NO_TRACKS_FOUND);

      const revenuePerPlay = 0.50;
      const currentMonth = new Date().toISOString().slice(0, 7);
      const monthlyRevenue = tracks.reduce((sum, track) => {
        const monthlyPlays = track.playHistory?.find((h) => h.month === currentMonth)?.plays || 0;
        return sum + monthlyPlays * revenuePerPlay;
      }, 0);

      if (monthlyRevenue <= 0) throw new Error(MESSAGES.NO_REVENUE);

      const amount = Math.round(monthlyRevenue * 100);
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
              unit_amount: amount,
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: MESSAGES.FINAL_SUCCESS_URL + encodeURIComponent(artistName),
        cancel_url: MESSAGES.FINAL_CANCEL_URL,
        metadata: { artistName, amount: amount.toString() },
      });

      return { success: true, sessionUrl: session.url! };
    } catch (error: unknown) {
      throw new Error((error as Error).message);
    }
  }
}




