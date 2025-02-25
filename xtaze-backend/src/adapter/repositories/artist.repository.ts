import { ITrack } from "../../domain/entities/ITrack";
import IUser from "../../domain/entities/IUser";
import { IArtistRepository } from "../../domain/repositories/IArtistRepository";
import { Track } from "../db/models/TrackModel";
import UserModel from "../db/models/UserModel";

export default class ArtistRepository implements IArtistRepository {

  async findByEmail(email: string): Promise<IUser> {
    try {
      console.log(email, "ith enth oi")
      const artist = await UserModel.findOne({ email });
      console.log(artist, "ith entha ")
      return artist as unknown as IUser
    } catch (error) {
      throw error
    }
  }
  async upload(track: ITrack): Promise<ITrack | null> {
    console.log(track, "ithan last ")
    const newTrack = new Track(track)
    console.log(newTrack, "ithan last final destination ")
    return await newTrack.save()
  }
  async getAllArtists(): Promise<IUser[]> {
    return await UserModel.find({ role: { $ne: "admin" } });
  }
  async getAllTracksByArtist(userId: string): Promise<ITrack[]> {
    try {
      console.log("Fetching tracks for artist with userId:", userId);

      const artist = await UserModel.findById({ _id: userId });
      if (!artist) {
        throw new Error("Artist not found");
      }

      const tracks = await Track.find({ artists: { $regex: new RegExp(`^${artist.username}$`, "i") } });
      console.log("Tracks found:", tracks.length, artist.username);
      return tracks;
    } catch (error) {
      console.error("Error fetching tracks:", error);
      throw new Error("Failed to fetch tracks");
    }
  }
  async increment(trackId: string): Promise<ITrack | null> { 
    try {
        console.log("Fetching track with ID:", trackId);

        const updatedTrack = await Track.findByIdAndUpdate(
            trackId,
            { $inc: { listeners: 1 } }, 
            { new: true } 
        );

        if (!updatedTrack) {
            throw new Error("Track not found");
        }

        console.log(updatedTrack,"ith an ambu");
        return updatedTrack; 
    } catch (error) {
        console.error("Error updating track listeners:", error);
        throw new Error("Failed to update track listeners");
    }
}



  // async getArtistById(id: string): Promise<IUser|null> {
  //   return await UserModel.findById(id);
  // }

  // async updateArtistStatus(id: string, status: boolean): Promise<IUser|null> {
  //     console.log(status,"ss");


  //   return  await UserModel.findByIdAndUpdate(id, { isActive:status}, { new: true });

  // }
}