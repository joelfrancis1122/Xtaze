import { IBanner } from "../../domain/entities/IBanner";
import { ICoupon } from "../../domain/entities/ICoupon";
import { IPlaylist } from "../../domain/entities/IPlaylist";
import IUser from "../../domain/entities/IUser";
import { IUserRepository } from "../../domain/repositories/IUserRepository";
import BannerModel from "../db/models/BannerModel";
import { CouponModel } from "../db/models/CouponModel";
import PlaylistModel from "../db/models/PlaylistModel";
import { ITrack, Track } from "../db/models/TrackModel";
import UserModel from "../db/models/UserModel"; // Assuming your User model is in this location

export default class UserRepository implements IUserRepository {

  async add(userData: IUser): Promise<IUser> {
    try {
      const user = await UserModel.create(userData)
      console.log("workk avanee repo", user);

      return user as unknown as IUser
    } catch (error) {
      throw error
    }
  }
  async updatePassword(user: IUser): Promise<IUser> {
    try {
      const updatedUser = await UserModel.findByIdAndUpdate(
        user._id, // Find user by ID
        { $set: user }, // Update with new data
        { new: true, runValidators: true } // Return updated document & validate
      );
      console.log(updatedUser, "change")
      return updatedUser as unknown as IUser

    } catch (error) {
      throw error
    }
  }

  async findByEmail(email: string): Promise<IUser | null> {
    try {
      const user = await UserModel.findOne({ email });
      return user as unknown as IUser
    } catch (error) {
      throw error
    }
  }

  async findByPhone(phone: number): Promise<IUser | null> {
    try {
      const user = await UserModel.findOne({ phone });
      return user as unknown as IUser
    } catch (error) {
      throw error
    }
  }

  async getUserUpdated(userId: string): Promise<IUser | null> {
    return await UserModel.findById({ _id: userId });
  }

  async updateProfile(userId: string, pic: string): Promise<IUser | null> {
    try {
      const updatedUser = await UserModel.findByIdAndUpdate(
        userId,
        { profilePic: pic },
        { new: true, runValidators: true }
      ).lean();

      return updatedUser as IUser | null;
    } catch (error) {
      console.log(error);
      return null;
    }
  }
  async uploadBanner(userId: string, BannerPicUrl: string): Promise<IUser | null> {
    try {
      const updatedUser = await UserModel.findByIdAndUpdate(
        userId,
        { banner: BannerPicUrl },
        { new: true, runValidators: true }
      ).lean();

      return updatedUser as IUser | null;
    } catch (error) {
      console.log(error);
      return null;
    }
  }
  async updateBio(userId: string, bio: string): Promise<IUser | null> {
    try {
      const updatedUser = await UserModel.findByIdAndUpdate(
        userId,
        { bio: bio },
        { new: true, runValidators: true }
      ).lean();

      return updatedUser as IUser | null;
    } catch (error) {
      console.log(error);
      return null;
    }
  }


  async getupdatedArtist(artistId: string): Promise<IUser | null> {
    const updatedArtist = await UserModel.findOne({ _id: artistId });
    return updatedArtist as unknown as IUser
  }

  async findByUsername(username: string): Promise<IUser | null> {
    return await UserModel.findOne({ username: { $regex: `^${username}$`, $options: "i" } });


  }

  async findById(userId: string): Promise<IUser | null> {
    try {
      return await UserModel.findById(userId);
    } catch (error) {
      console.error("Error finding user by ID:", error);
      return null;
    }
  }

  async getPlaylist(id: string, pageNum: number, limitNum: number, skip: number): Promise<{ tracks: ITrack[]; total: number } | null> {
    try {
      console.log(id, "this is the playlist id");

      // Find the playlist and get only the "tracks" field
      const playlist = await PlaylistModel.findById(id).select("tracks");

      if (!playlist || !playlist.tracks || playlist.tracks.length === 0) {
        console.error("Playlist not found or has no tracks");
        return { tracks: [], total: 0 };
      }

      // Fetch all track details based on the track IDs
      const tracks = await Track.find({ _id: { $in: playlist.tracks } })
        .skip(skip)
        .limit(limitNum);
      const total = playlist.tracks.length;
      console.log({ tracks, total }, "Response data");
      return { tracks, total }; // Return an array of track details
    } catch (error) {
      console.error("Error finding tracks for playlist:", error);
      return null;
    }
  }

  async findByCreator(userId: string): Promise<IPlaylist[] | null> {
    try {
      const data = await PlaylistModel.find({ createdBy: userId }).lean();
      console.log(data, "sa", userId)
      return data.map((playlist) => ({
        _id: playlist._id.toString(),
        title: playlist.title ?? "",
        description: playlist.description ?? "",
        imageUrl: playlist.imageUrl ?? "",
        trackCount: playlist.trackCount ?? 0,
        createdBy: playlist.createdBy ?? "",
        tracks: playlist.tracks ?? [],
      })) as IPlaylist[];

    } catch (error) {
      console.error("Error finding playlists by creator ID:", error);
      return [];
    }
  }
  async deletePlaylist(id: string): Promise<IPlaylist | null> {
    try {
      console.log("this is id,", id)
      return await PlaylistModel.findByIdAndDelete(id);

    } catch (error) {
      console.error("Error deleting playlist:", error);
      return null;
    }
  }
  async playlistName(id: string, playlistName: string): Promise<IPlaylist | null> {
    try {
      console.log("this is id:", id);

      return await PlaylistModel.findByIdAndUpdate(
        id,
        { title: playlistName }, // Update the title field
        { new: true } // Return the updated document
      );

    } catch (error) {
      console.error("Error updating playlist name:", error);
      return null;
    }
  }
  async updateNamePlaylist(id: string, playlistName: string): Promise<IPlaylist | null> {
    try {
      const updatedUser = await PlaylistModel.findByIdAndUpdate(
        id,
        { title: playlistName },
        { new: true, runValidators: true }
      ).lean();
      console.log("amrutha pass")
      return updatedUser as IPlaylist | null;
    } catch (error) {
      console.log(error);
      return null;
    }
  }
  async createPlaylist(userId: string, newPlaylist: IPlaylist): Promise<IPlaylist | null> {
    try {
      console.log(newPlaylist, "ithe an odi");

      const playlist = new PlaylistModel({
        title: newPlaylist.title,
        description: newPlaylist.description,
        imageUrl: newPlaylist.imageUrl,
        createdBy: userId, // Assign userId instead of newPlaylist.createdBy
        tracks: newPlaylist.tracks || [],
      });

      const savedPlaylist = await playlist.save();

      // Fetch the fully saved playlist (ensuring all fields, including _id, are included)
      const completePlaylist = await PlaylistModel.findById(savedPlaylist._id).lean();

      console.log("Saved playlist:", completePlaylist);
      return completePlaylist as IPlaylist;
    } catch (error) {
      console.error("Error creating playlist:", error);
      return null;
    }
  }


  async addToPlaylist(userId: string, playlistId: string, trackId: string): Promise<IPlaylist | null> {
    try {
      const playlistid = trackId
      const trackid = playlistId
      const playlist = await PlaylistModel.findOne({ createdBy: userId, _id: playlistid });

      if (!playlist) {
        console.error("Playlist not found or does not belong to user");
        return null;
      }

      playlist.tracks = playlist.tracks || [];
      console.log("111")
      // Add the track to the playlist if it's not already present
      if (!playlist.tracks.includes(trackid)) {
        playlist.tracks.push(trackid);
      } else {
        return null
      }
      console.log("333")

      // Save the updated playlist
      const updatedPlaylist = await playlist.save();
      return updatedPlaylist as IPlaylist;
    } catch (error) {
      console.error("Error updating playlist:", error);
      return null;
    }
  }


  async updateImagePlaylist(id: string, file: string): Promise<IPlaylist | null> {
    try {
      const data = await PlaylistModel.findByIdAndUpdate(
        id,
        { imageUrl: file },
        { new: true, runValidators: true }
      ).lean();
      console.log()
      return data as IPlaylist | null;
    } catch (error) {
      console.log(error);
      return null;
    }
  }
  async updateUserSubscription(userId: string, planName: string): Promise<IUser | null> {
    try {
      const updatedUser = await UserModel.findByIdAndUpdate(
        userId,
        { premium: planName },
        { new: true, runValidators: true }
      );

      if (!updatedUser) {
        throw new Error("User not found or update failed");
      }

      return updatedUser.toObject<IUser>();
    } catch (error) {
      console.error("Error updating user subscription:", error);
      throw error;
    }
  }

  async addToLiked(userId: string, trackId: string): Promise<IUser | null> {
    try {
      const user = await UserModel.findById(userId);

      if (!user) {
        throw new Error("User not found");
      }

      let updatedUser;
      if (user.likedSongs?.includes(trackId)) {
        updatedUser = await UserModel.findByIdAndUpdate(
          userId,
          { $pull: { likedSongs: trackId } }, // Remove from likedSongs
          { new: true }
        );
      } else {
        updatedUser = await UserModel.findByIdAndUpdate(
          userId,
          { $addToSet: { likedSongs: trackId } }, // Add to likedSongs
          { new: true }
        );
      }

      if (!updatedUser) {
        throw new Error("User update failed");
      }

      return updatedUser.toObject<IUser>(); // Convert Mongoose document to plain object
    } catch (error) {
      console.error("Error in toggling liked song:", error);
      throw error;
    }
  }
  async findAll(): Promise<IBanner[] | null> {
    console.log("odi");
    const data = await BannerModel.find({ isActive: true })

    return data
  }

  async findCouponByCode(code: string): Promise<ICoupon | null> {
    const coupon = await CouponModel.findOne({ code });
    return coupon ? coupon.toObject() as ICoupon : null;
  }

  async updateCouponByCode(
    code: string,
    updateData: ICoupon
  ): Promise<ICoupon | null> {
    try {
      const updatedCoupon = await CouponModel.findOneAndUpdate(
        { code }, 
        { $set: updateData },
        { new: true, runValidators: true }
      );
      if (!updatedCoupon) {
        throw new Error(`Coupon with code ${code} not found`);
      }
      return updatedCoupon.toObject() as ICoupon;
    } catch (error: any) {
      throw new Error(error.message || "Failed to update coupon");
    }
  }
  async checkCouponisUsed(code: string, userId: string): Promise<boolean> {
    try {
      const coupon = await CouponModel.findOne({ code });
      if (!coupon) {
        throw new Error(`Coupon with code ${code} not found`);
      }
      const usedUsers = coupon.users ?? [];
      return usedUsers.includes(userId);
    } catch (error: any) {
      throw new Error(error.message || "Failed to check coupon usage");
    }
  }
}
