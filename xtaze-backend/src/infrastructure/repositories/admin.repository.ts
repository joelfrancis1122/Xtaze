import { IBanner } from "../../domain/entities/IBanner";
import { ICoupon } from "../../domain/entities/ICoupon";
import { MusicMonetization } from "../../domain/entities/IMonetization";
import IUser from "../../domain/entities/IUser";
import { IVerificationRequest } from "../../domain/entities/IVerificationRequest";
import { IAdminRepository } from "../../domain/repositories/IAdminRepository";
import BannerModel from "../db/models/BannerModel";
import { CouponModel } from "../db/models/CouponModel";
import { ITrack, Track } from "../db/models/TrackModel";
import UserModel from "../db/models/UserModel";
import VerificationModel from "../db/models/VerificationRequestModel";
import { uploadProfileCloud } from "../service/cloudinary.service";
import { BaseRepository } from "./BaseRepository";

// export default class AdminRepository implements IAdminRepository {
export default class AdminRepository extends BaseRepository<IUser> implements IAdminRepository {
  constructor() {
    super(UserModel)
  }

  async findByEmail(email: string): Promise<IUser | null> {
    try {
      const admin = await UserModel.findOne({ email });
      return admin as unknown as IUser
    } catch (error) {
      throw error
    }
  }

  async findById(userId: string): Promise<IUser | null> {
    try {
      return await UserModel.findById(userId);
    } catch (error) {
      console.error("Error finding user by ID:", error);
      return null;
    }
  }

  async updateVerificationStatus(
    status: string,
    feedback: string | null,
    id: string
  ): Promise<IVerificationRequest | null> {
    try {
      const updatedVerification = await VerificationModel.findByIdAndUpdate(
        id,
        {
          status,
          feedback,
          reviewedAt: new Date(),
        },
        { new: true }
      );

      if (!updatedVerification) {
        return null;
      }

      return updatedVerification.toObject() as IVerificationRequest;
    } catch (error) {
      console.error("Error updating verification status:", error);
      throw error;
    }
  }


  async getUsersByIds(userIds: string[]): Promise<IUser[] | null> {
    try {
      const users = await UserModel.find({ _id: { $in: userIds } });
      const formattedUsers: IUser[] = users.map(user =>
        typeof user.toObject === 'function'
          ? { ...user.toObject(), _id: user._id.toString() }
          : { ...user, _id: user._id.toString() }
      );
      return formattedUsers;
    } catch (error) {
      throw error;
    }
  }

  async getAllTracks(): Promise<ITrack[] | null> {
    try {

      const track = await Track.find();
      return track
    } catch (error: unknown) {
      throw new Error((error as Error).message || "Failed to check coupon usage");
    }
  }

  async getAllTracksByArtist(userId: string): Promise<ITrack[]> {
    try {

      const artist = await UserModel.findById({ _id: userId });
      if (!artist) {
        throw new Error("Artist not found");
      }

      const tracks = await Track.find({ artists: { $regex: new RegExp(`^${artist.username}$`, "i") } });
      return tracks;
    } catch (error) {
      console.error("Error fetching tracks:", error);
      throw new Error("Failed to fetch tracks");
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


    return await UserModel.findByIdAndUpdate(id, { isActive: status }, { new: true });

  }
  async createBanner(title: string, description: string, action: string, isActive: boolean, createdBy: string, file: Express.Multer.File): Promise<IBanner | null> {
    const getBannerURl = await uploadProfileCloud(file);
    const url = getBannerURl.secure_url.toString()
    const banner = new BannerModel({ title, description, imageUrl: url, action, createdBy, isActive })

    return await banner.save() as any
  }
  async getAllBanners(): Promise<IBanner[] | null> {
    const data = await BannerModel.find()

    return data as any
  }

  async findBanner(id: string): Promise<IBanner | null> {
    const data = await BannerModel.findByIdAndDelete(id)

    return data as any
  }


  async createCoupon(couponData: ICoupon): Promise<ICoupon | null> {
    try {
      const newCoupon = new CouponModel(couponData);
      const savedCoupon = await newCoupon.save();
      return savedCoupon;
    } catch (error: unknown) {
      if ((error as any).code === 11000) {
        throw new Error(`Coupon code '${couponData.code}' already exists`);
      }
      throw new Error("Failed to save coupon: " + (error as Error).message);
    }
  }

  async getCoupons(): Promise<ICoupon[] | null> {
    try {
      const coupons = await CouponModel.find();
      return coupons
    } catch (error: unknown) {
      throw new Error("Failed to save coupon: " + (error as Error).message);
    }
  }

  async deleteCoupon(couponId: string): Promise<ICoupon | null> {
    try {
      const coupons = await CouponModel.findByIdAndDelete(couponId);
      return coupons as any
    } catch (error: unknown) {
      throw new Error("Failed to save coupon: " + (error as Error).message);
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
    } catch (error: unknown) {
      if ((error as any).code === 11000) {
        throw new Error(`Coupon code already exists`);
      }
      throw new Error((error as Error).message || "Failed to update coupon");
    }
  }

  async findBannerforUpdate(id: string, title: string, description: string, action: string, isActive: boolean, file: Express.Multer.File): Promise<IBanner | null> {
    try {
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
      if (!updatedBanner) {
        throw new Error("Banner not found or failed to update");
      }

      return updatedBanner as any
    } catch (error) {
      console.error("Error updating banner:", error);
      throw new Error("Failed to update banner");
    }
  }


  async findCouponByCode(code: string): Promise<ICoupon | null> {
    const coupon = await CouponModel.findOne({ code });
    return coupon ? coupon.toObject() as ICoupon : null;
  }
  async fetchVerification(
    page: number,
    limit: number
  ): Promise<{ data: (IVerificationRequest & { username?: string })[]; total: number }> {
    const skip = (page - 1) * limit;

    const [rawData, total] = await Promise.all([
      VerificationModel.find()
        .skip(skip)
        .limit(limit)
        .lean(),
      VerificationModel.countDocuments(),
    ]);
    const artistIds = rawData.map((v) => v.artistId);

    const users = await UserModel.find({ _id: { $in: artistIds }, role: "artist" })
      .select("username _id")
      .lean();
    const usersMap: Record<string, string> = {};
    users.forEach((u: any) => {
      usersMap[u._id.toString()] = u.username;
    });

    const data: (IVerificationRequest & { username?: string })[] = rawData.map((doc: any) => ({
      ...doc,
      _id: doc._id?.toString(),
      username: usersMap[doc.artistId] ?? "Unknown",
    }));

    return { data, total };
  }

  async findTracks(name: string): Promise<ITrack[] | null> {
    const tracks = await Track.find({ artists: name });
    return tracks as unknown as ITrack[]
  }
  async findArtist(name: string): Promise<IUser | null> {
    const artist = await UserModel.findOne({ username: name, role: "artist" });
    if (artist) {
      artist.paymentStatus = true;
      await artist.save();
    }
    return artist as unknown as IUser;
  }



  async getMusicMonetization(page: number, limit: number) {
    try {
      const revenuePerPlay = 0.5;
      const currentMonth = new Date().toISOString().slice(0, 7);

      const tracks = await Track.find()
        .skip((page - 1) * limit)
        .limit(limit);

      const totalItems = await Track.countDocuments();

      const monetizationData = await Promise.all(
        tracks.map(async (track) => {
          const totalPlays =
            track.playHistory?.reduce((sum, h) => sum + h.plays, 0) || 0;

          const monthlyPlays =
            track.playHistory?.find((h) => h.month === currentMonth)?.plays || 0;

          let paymentStatus = false;
          let artistName = "";

          if (track.artists?.[0]) {
            const artist = await UserModel.findOne({ username: track.artists[0] });
            artistName = artist?.username || track.artists[0];
            paymentStatus = artist?.paymentStatus ?? false;
          }

          return {
            trackId: track._id?.toString() || "",
            trackName: track.title,
            artistName,
            totalPlays,
            monthlyPlays,
            totalRevenue: totalPlays * revenuePerPlay,
            monthlyRevenue: monthlyPlays * revenuePerPlay,
            lastUpdated: track.createdAt ? track.createdAt.toISOString() : "",
            paymentStatus,
          };
        })
      );

      return {
        data: monetizationData.sort((a, b) => b.totalPlays - a.totalPlays),
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalItems / limit),
          totalItems,
        },
      };
    } catch (error: any) {
      console.error("Error in getMusicMonetization:", error);
      throw new Error(error.message || "Failed to fetch music monetization data");
    }
  }

}