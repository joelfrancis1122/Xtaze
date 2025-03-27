import { User } from "lucide-react";
import { IBanner } from "../../domain/entities/IBanner";
import { ICoupon } from "../../domain/entities/ICoupon";
import { MusicMonetization } from "../../domain/entities/IMonetization";
import IUser from "../../domain/entities/IUser";
import { IAdminRepository } from "../../domain/repositories/IAdminRepository";
import { uploadImageToCloud, uploadProfileCloud } from "../../framework/service/cloudinary.service";
import BannerModel from "../db/models/BannerModel";
import { CouponModel } from "../db/models/CouponModel";
import { ITrack, Track } from "../db/models/TrackModel";
import UserModel from "../db/models/UserModel";

export default class AdminRepository implements IAdminRepository {

  async findByEmail(email: string): Promise<IUser | null> {
    try {
      console.log(email, "ith enth oi")
      const admin = await UserModel.findOne({ email });
      console.log(admin, "ith entha ")
      return admin as unknown as IUser
    } catch (error) {
      throw error
    }
  }

  async getArtistById(id: string): Promise<IUser | null> {
    return await UserModel.findById(id);
  }
async StripefindByname(artistName: string): Promise<string | null> {
  const artist = await UserModel.findOne({ username: artistName });
  
  if (!artist) return null; // Ensure artist exists before accessing properties

  return artist.stripePaymentMethodId || null; // Return stripePaymentId or null if undefined
}


  async updateArtistStatus(id: string, status: boolean): Promise<IUser | null> {
    console.log(status, "ss");


    return await UserModel.findByIdAndUpdate(id, { isActive: status }, { new: true });

  }
  async createBanner(title: string, description: string, action: string, isActive: boolean, createdBy: string, file: Express.Multer.File): Promise<IBanner | null> {
    console.log(title, description, action, isActive, createdBy, file, "ss");
    const getBannerURl = await uploadProfileCloud(file);
    const url = getBannerURl.secure_url.toString()
    console.log(getBannerURl, "saaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa", url)
    const banner = new BannerModel({ title, description, imageUrl: url, action, createdBy, isActive })

    return await banner.save()
  }
  async findAll(): Promise<IBanner[] | null> {
    console.log("odi");
    const data = await BannerModel.find()

    return data
  }

  async findBanner(id: string): Promise<IBanner | null> {
    console.log("odi", id);
    const data = await BannerModel.findByIdAndDelete(id)

    return data
  }


  async createCoupon(couponData: ICoupon): Promise<ICoupon | null> {
    try {
      const newCoupon = new CouponModel(couponData);
      const savedCoupon = await newCoupon.save();
      console.log(savedCoupon, "odi odi odi odi")
      return savedCoupon;
    } catch (error: any) {
      if (error.code === 11000) {
        throw new Error(`Coupon code '${couponData.code}' already exists`);
      }
      throw new Error("Failed to save coupon: " + error.message);
    }
  }

  async getCoupons(): Promise<ICoupon[] | null> {
    try {
      const coupons = await CouponModel.find();
      return coupons
    } catch (error: any) {
      throw new Error("Failed to save coupon: " + error.message);
    }
  }

  async deleteCoupon(couponId: string): Promise<ICoupon | null> {
    try {
      const coupons = await CouponModel.findByIdAndDelete(couponId);
      return coupons
    } catch (error: any) {
      throw new Error("Failed to save coupon: " + error.message);
    }
  }

  async updateCoupon(
    couponId: string,
    updateData: ICoupon
  ): Promise<ICoupon | null> {
    try {
      const updatedCoupon = await CouponModel.findByIdAndUpdate(
        couponId,
        { $set: updateData },
        { new: true, runValidators: true }
      );
      if (!updatedCoupon) {
        throw new Error(`Coupon with ID ${couponId} not found`);
      }
      return updatedCoupon.toObject() as ICoupon;
    } catch (error: any) {
      if (error.code === 11000) {
        throw new Error(`Coupon code already exists`);
      }
      throw new Error(error.message || "Failed to update coupon");
    }
  }

  async findBannerforUpdate(id: string, title: string, description: string, action: string, isActive: boolean, file: Express.Multer.File): Promise<IBanner | null> {
    try {
      console.log("Updating banner with ID:", id);

      let data = await uploadProfileCloud(file);
      let url = data.secure_url
      const updatedBanner = await BannerModel.findByIdAndUpdate(
        id,
        {
          title,
          description,
          action,
          isActive,
          imageUrl: url,
        },
        { new: true }
      );
      console.log(updatedBanner, "ethy ambuuu")
      if (!updatedBanner) {
        throw new Error("Banner not found or failed to update");
      }

      return updatedBanner;
    } catch (error) {
      console.error("Error updating banner:", error);
      throw new Error("Failed to update banner");
    }
  }


  async findCouponByCode(code: string): Promise<ICoupon | null> {
    const coupon = await CouponModel.findOne({ code });
    return coupon ? coupon.toObject() as ICoupon : null;
  }





  async getMusicMonetization(): Promise<MusicMonetization[]> {
    try {
      // Fetch all artists
      const artists = await UserModel.find({ role: "artist" });
      const artistNames = artists.map((artist) => artist.username);
      
      // Fetch tracks for these artists
      const tracks = await Track.find({ artists: { $in: artistNames } });
  
      const revenuePerPlay = 0.50;
      const currentMonth = new Date().toISOString().slice(0, 7); // e.g., "2025-03"
  
      const monetizationData: MusicMonetization[] = await Promise.all(
        tracks.map(async (track) => {
          const typedTrack = track as {
            _id: string;
            title: string;
            artists: string[];
            listeners?: number;
            playHistory?: { month: string; plays: number }[];
            createdAt?: Date;
          };
  
          // Fetch the artist's details for this track
          const artist = await UserModel.findOne({ username: typedTrack.artists[0] });
  
          const monthlyPlays = typedTrack.playHistory?.find((h) => h.month === currentMonth)?.plays || 0;
          
          return {
            trackId: typedTrack._id.toString(),
            trackName: typedTrack.title,
            artistName: typedTrack.artists[0] || "Unknown Artist",
            totalPlays: typedTrack.listeners || 0,
            monthlyPlays,
            paymentStatus: artist?.paymentStatus ?? false, // Ensure boolean value
            totalRevenue: (typedTrack.listeners || 0) * revenuePerPlay,
            monthlyRevenue: monthlyPlays * revenuePerPlay, // Current month's revenue
            lastUpdated: typedTrack.createdAt ? typedTrack.createdAt.toISOString() : "",
          };
        })
      );
  
      return monetizationData.sort((a, b) => b.totalPlays - a.totalPlays);
    } catch (error: any) {
      console.error("Error in getMusicMonetization:", error);
      throw new Error(error.message || "Failed to fetch music monetization data");
    }
  }
  
}