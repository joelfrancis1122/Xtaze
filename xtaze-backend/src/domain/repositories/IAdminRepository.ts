import Stripe from "stripe";
import { IBanner } from "../entities/IBanner";
import { ICoupon } from "../entities/ICoupon";
import { MusicMonetization } from "../entities/IMonetization";
import { ITrack } from "../entities/ITrack";
import IUser from "../entities/IUser";
import { IVerificationRequest } from "../entities/IVeridicationRequest";

export interface IAdminRepository {
  findByEmail: (email: string) => Promise<IUser | null>;
  getArtistById(id: string): Promise<IUser | null>;
  updateArtistStatus(id: string, status: boolean): Promise<IUser | null>;
  createBanner(title: string, description: string, action: string, isActive: boolean, createdBy: string, file: Express.Multer.File): Promise<IBanner | null>
  getAllBanners(): Promise<IBanner[] | null>
  findBanner(id: string): Promise<IBanner | null>
  findBannerforUpdate(id: string, title: string, description: string, action: string, isActive: boolean, file: Express.Multer.File): Promise<IBanner | null>
  createCoupon(couponData: ICoupon): Promise<ICoupon | null>
  getCoupons(): Promise<ICoupon[] | null>
  deleteCoupon(couponId: string): Promise<ICoupon | null>
  updateCoupon(couponId: string, updateData: ICoupon): Promise<ICoupon | null>
  findCouponByCode(code: string): Promise<ICoupon | null>

  getMusicMonetization(): Promise<MusicMonetization[] | null>
  StripefindByname(artistName: string): Promise<string | null>;
  getUsersByIds(userIds: string[]): Promise<IUser[] | null>;
  fetchVerification(): Promise<IVerificationRequest | null>
  updateVerificationStatus(status: string, feedback: string | null, id: string): Promise<IVerificationRequest | null>
  findArtist(name: string): Promise<IUser | null>
  findTracks(name: string): Promise<ITrack[] | null>
}
