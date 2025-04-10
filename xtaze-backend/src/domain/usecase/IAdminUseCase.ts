import Stripe from "stripe";
import { IBanner } from "../entities/IBanner";
import { IPlan } from "../entities/IPlan";
import IUser from "../entities/IUser";
import { ICoupon } from "../entities/ICoupon";
import { ITrack } from "../entities/ITrack";
import { MusicMonetization } from "../entities/IMonetization";
import { IVerificationRequest } from "../entities/IVeridicationRequest";

export default interface IAdminUseCase {
    login(email: string, password: string): Promise<{ success: boolean; message: string; token?: string; user?: IUser }>;
    toggleBlockUnblockArtist(id: string): Promise<IUser | null>
    addBanner(title: string, description: string, action: string, isActive: boolean, createdBy: string, file: Express.Multer.File): Promise<IBanner | null>
    getAllBanners(): Promise<IBanner[] | null>
    deleteBanner(id: string): Promise<IBanner | null>
    updateBanner(id: string, title: string, description: string, action: string, isActive: boolean, file: Express.Multer.File): Promise<IBanner | null>
    createPlan(name: string, description: string, price: number, interval: string): Promise<{ product: Stripe.Product; price: Stripe.Price }>
    getPlans(): Promise<{ product: Stripe.Product; price: Stripe.Price }[]>
    archivePlan(productId: string): Promise<Stripe.Product>
    updatePlan(productId: string, name: string, description: string, price: number, interval: "month" | "year"): Promise<{ product: Stripe.Product; price: Stripe.Price }>
    createCoupon(code: string, discountAmount: number, expires: Date, maxUses: number, uses: number): Promise<ICoupon | null>
    getCoupons(): Promise<ICoupon[] | null>
    deleteCoupon(couponId: string): Promise<ICoupon | null>
    updateCoupon(couponId: string, updateData: ICoupon): Promise<ICoupon | null>
    verifyCoupon(code: string): Promise<ICoupon | null>
    getMusicMonetization(): Promise<MusicMonetization[] | null>
    artistPayout(artistName: string): Promise<{ success: boolean; payoutId?: string }>
    getUsersByIds(userIds: string[]): Promise<IUser[] | null>
    fetchVerification(): Promise<IVerificationRequest | null>
    updateVerificationStatus(status:string,feedback: string | null,id:string) :Promise<IVerificationRequest|null>

}

