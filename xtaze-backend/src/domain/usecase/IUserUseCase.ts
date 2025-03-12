import Stripe from "stripe";
import IUser from "../entities/IUser";
import { IPlaylist } from "../entities/IPlaylist";

export default interface IuserUseCase{
    registerUser(username: string, country: string, gender: string, year: number, phone: number, email: string, password: string): Promise<IUser> 
    sendOTP(email: string): Promise<string>; 
    checkUnique(username: string): Promise<boolean>; 
    verifyOTP(otp:string):Promise<{success:boolean,message:string}>
    login(email: string, password: string): Promise<{ success: boolean; message: string; token?: string;refreshToken?:string; user?: IUser }>;
    googleLogin(Token: string): Promise<{ success: boolean; message: string; token?: string; refreshToken?:string;user?: IUser |null}>;
    forgotPassword(email: string): Promise<{ success: boolean; message: string; token?: string; refreshToken?:string;user?: IUser |null}>;
    resetPassword(token: string,password:string): Promise<{ success: boolean; message: string; token?: string; refreshToken?:string;user?: IUser |null}>;
    createPlaylist(_id: string,newplaylist:IPlaylist): Promise<IPlaylist | null>;
    getAllPlaylist(userId: string): Promise<IPlaylist[] | null>;

    refresh(refreshToken: string): Promise<{ success: boolean; message: string; token?: string; refreshToken?:string;user?: IUser |null}>;
    uploadProfile(userID:string,file:Express.Multer.File): Promise<{ success: boolean; message: string }>
    uploadBanner(userID:string,file:Express.Multer.File,isVideo:boolean): Promise<{ success: boolean; message: string }>
    updateBio(userID:string,bio:string): Promise<{ success: boolean; message: string }>
    getUpdatedArtist(artistId:string): Promise<IUser|null>
    execute(userId: string, priceId: string): Promise<Stripe.Checkout.Session>;
    addToLiked(userId: string,trackId:string): Promise<IUser|null>
}

