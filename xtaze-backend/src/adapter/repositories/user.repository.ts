import { IPlaylist } from "../../domain/entities/IPlaylist";
import IUser from "../../domain/entities/IUser";
import { IUserRepository } from "../../domain/repositories/IUserRepository";
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

  async getPlaylist(id: string): Promise<ITrack[] | null> {
    try {
      console.log(id, "this is the playlist id");

      // Find the playlist and get only the "tracks" field
      const playlist = await PlaylistModel.findById(id).select("tracks");

      if (!playlist || !playlist.tracks || playlist.tracks.length === 0) {
          console.error("Playlist not found or has no tracks");
          return [];
      }

      // Fetch all track details based on the track IDs
      const tracks = await Track.find({ _id: { $in: playlist.tracks } });

      return tracks; // Return an array of track details
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

  async createPlaylist(newPlaylist: IPlaylist): Promise<IPlaylist | null> {
    try {
      const playlist = new PlaylistModel({
        ...newPlaylist,
        createdBy: newPlaylist.createdBy ? newPlaylist.createdBy : "",
        tracks: newPlaylist.tracks || [],
      });

      const savedPlaylist = await playlist.save();
      return savedPlaylist as IPlaylist;
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

  async updateUserSubscription(userId: string, isPremium: boolean): Promise<IUser | null> {
    try {
      const updatedUser = await UserModel.findByIdAndUpdate(
        userId,
        { premium: isPremium },
        { new: true, runValidators: true }
      );

      if (!updatedUser) {
        throw new Error("User not found or update failed");
      }

      return updatedUser.toObject<IUser>(); // Convert Mongoose document to plain object
    } catch (error) {
      console.error("Error updating user subscription:", error);
      throw error; // Propagate error to use case
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


}
