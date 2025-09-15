import { IAlbum } from "../../domain/entities/IAlbum";
import { IBanner } from "../../domain/entities/IBanner";
import { ICoupon } from "../../domain/entities/ICoupon";
import { IPlaylist } from "../../domain/entities/IPlaylist";
import IUser from "../../domain/entities/IUser";
import { IUserRepository } from "../../domain/repositories/IUserRepository";
import { AlbumModel } from "../db/models/AlbumModel";
import BannerModel from "../db/models/BannerModel";
import { CouponModel } from "../db/models/CouponModel";
import PlaylistModel from "../db/models/PlaylistModel";
import { ITrack, Track } from "../db/models/TrackModel";
import UserModel from "../db/models/UserModel";
import { BaseRepository } from "./BaseRepository";

export default class UserRepository extends BaseRepository<IUser> implements IUserRepository {
  constructor() {
    super(UserModel);
  }


  async add(userData: IUser): Promise<IUser> {
    try {
      return await this.create(userData);
    } catch (err) {
      throw err
    }
  }

  async resetPaymentStatus(): Promise<void> {
    try {
      const result = await UserModel.updateMany(
        {},
        { $set: { paymentStatus: false } }
      );
    } catch (error) {
      throw error
    }
  }

  async increment(trackId: string, userId: string) {
    const trackDoc = await Track.findById(trackId);

    if (!trackDoc) return null;
    trackDoc.listeners = trackDoc.listeners || [];
    trackDoc.playHistory = trackDoc.playHistory || [];

    const currentMonth = new Date().toISOString().slice(0, 7);
    const monthIndex = trackDoc.playHistory.findIndex(
      (h) => h.month === currentMonth
    );

    if (monthIndex === -1) {
      trackDoc.playHistory.push({ month: currentMonth, plays: 1 });
    } else {
      trackDoc.playHistory[monthIndex].plays += 1;
    }

    // ✅ Add listener without 
    await Track.updateOne(
      { _id: trackId },
      { $addToSet: { listeners: userId } }
    );

    // Save updated document
    await trackDoc.save();
    const plainTrack = { ...trackDoc.toObject(), _id: trackDoc._id.toString() };
    return plainTrack
  }

  async updatePassword(user: IUser): Promise<IUser> {
    try {
      const updatedUser = await UserModel.findByIdAndUpdate(
        user._id,
        { $set: user },
        { new: true, runValidators: true }
      );
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

  async getCoupons(): Promise<ICoupon[] | null> {
    try {
      const coupons = await CouponModel.find();
      return coupons
    } catch (error: unknown) {
      throw new Error("Failed to save coupon: " + (error as Error).message);
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
  async usernameUpdate(userId: string, username: string): Promise<IUser | null> {
    try {
      const updatedUser = await UserModel.findByIdAndUpdate(
        userId,
        { username: username },
        { new: true, runValidators: true }
      ).lean();

      return updatedUser as IUser | null;
    } catch (error) {
      console.log(error);
      return null;
    }
  }



  async getAllArtistsP(
    page: number,
    limit: number
  ): Promise<{ data: IUser[]; total: number }> {
    const skip = (page - 1) * limit;

    const [artists, total] = await Promise.all([
      UserModel.find({ role: { $ne: "admin" } })
        .skip(skip)
        .limit(limit)
        .lean(),
      UserModel.countDocuments({ role: { $ne: "admin" } }),
    ]);

    const data: IUser[] = artists.map((artist: any) => ({
      ...artist,
      _id: artist._id.toString(),
    }));

    return { data, total };
  }
 async listActiveArtists(
  page: number,
  limit: number
): Promise<{ data: IUser[]; total: number }> {
  try {
    const skip = (page - 1) * limit;
    const query = { role: { $nin: ["admin", "user"] } };

    const [artists, total] = await Promise.all([
      UserModel.find(query)
        .skip(skip)
        .limit(limit)
        .lean(),
      UserModel.countDocuments(query),
    ]);

    const data: IUser[] = artists.map((artist: any) => ({
      ...artist,
      _id: artist._id.toString(),
    }));

    return { data, total };
  } catch (err: any) {
    console.error("Error listing active artists:", err.message || err);
    return { data: [], total: 0 }; 
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



  async getliked(songIds: string, userId: string) {
    try {
      const tracks = await Track.find({ _id: { $in: songIds } });
      return tracks as any
    } catch (error) {
      console.error("Error in getliked:", error);
      return null
    }
  }


  async allAlbums(): Promise<IAlbum[] | null> {
    const albumDocs = await AlbumModel.find().lean();
    if (!albumDocs) {
      return null;
    }
    return albumDocs as unknown as IAlbum[];
  }

  async albumView(albumId: string): Promise<IAlbum | null> {
    const album = await AlbumModel.findOne({ _id: albumId });
    if (!album) {
      return null;
    }
    const tracks = await Track.find({ _id: { $in: album.tracks } });
    return { ...album.toObject(), tracks } as unknown as IAlbum;
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
      return { tracks, total }; // Return an array of track details
    } catch (error) {
      console.error("Error finding tracks for playlist:", error);
      return null;
    }
  }

  async findByCreator(userId: string): Promise<IPlaylist[] | null> {
    try {
      const data = await PlaylistModel.find({ createdBy: userId }).lean();
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
      return await PlaylistModel.findByIdAndDelete(id);

    } catch (error) {
      console.error("Error deleting playlist:", error);
      return null;
    }
  }
  async playlistName(id: string, playlistName: string): Promise<IPlaylist | null> {
    try {

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
      return updatedUser as IPlaylist | null;
    } catch (error) {
      console.log(error);
      return null;
    }
  }
  async createPlaylist(userId: string, newPlaylist: IPlaylist): Promise<IPlaylist | null> {
    try {

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

      return completePlaylist as any;
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
      if (!playlist.tracks.includes(trackid)) {
        playlist.tracks.push(trackid);
      } else {
        return null
      }

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
  async getAllBanners(): Promise<IBanner[] | null> {
    const data = await BannerModel.find({ isActive: true }).lean()
    return data.map((banner: any) => ({
      ...banner,
      _id: banner._id.toString(),
    }));
  }



  async getAllTracksByArtist(
    userId: string,
    page: number,
    limit: number
  ): Promise<{ data: ITrack[]; total: number }> {
    try {
      const skip = (page - 1) * limit;

      // Step 1: Find artist
      const artist = await UserModel.findById(userId);
      if (!artist) {
        throw new Error("Artist not found");
      }

      const query = { artists: artist.username };
      const [data, total] = await Promise.all([
        Track.find(query)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),

        Track.countDocuments(query),
      ]);

      return { data, total };
    } catch (error) {
      console.error("Error fetching tracks:", error);
      throw new Error("Failed to fetch tracks");
    }
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
    } catch (error: unknown) {
      throw new Error((error as Error).message || "Failed to update coupon");
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
    } catch (error: unknown) {
      throw new Error((error as Error).message || "Failed to check coupon usage");
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
  async becomeArtist(id: string): Promise<IUser | null> {
    try {
      const updatedUser = await UserModel.findByIdAndUpdate(
        id,
        { $set: { role: "artist" } },
        { new: true } // Return the updated document
      );

      return updatedUser as unknown as IUser
    } catch (error: unknown) {
      throw new Error((error as Error).message || "Failed to update user role");
    }
  }




  async fetchGenreTracks(GenreName: string): Promise<ITrack[] | null> {
    try {
      const tracks = await Track.find({
        genre: { $regex: new RegExp(`^${GenreName}$`, "i") }
      });
      return tracks;
    } catch (error: unknown) {
      throw new Error((error as Error).message || "Failed to fetch tracks by genre");
    }
  }



  async getArtistByName(username: string): Promise<IUser | null> {
    try {
      const admin = await UserModel.findOne({ username });
      return admin as unknown as IUser
    } catch (error) {
      throw error
    }
  }
}
