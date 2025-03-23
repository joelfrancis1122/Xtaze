import Stripe from "stripe";
import { IBanner } from "../entities/IBanner";
import { IPlan } from "../entities/IPlan";
import IUser from "../entities/IUser";

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
    updatePlan(productId: string,name: string,description: string,price: number,interval: "month" | "year"): Promise<{ product: Stripe.Product; price: Stripe.Price }>
}

