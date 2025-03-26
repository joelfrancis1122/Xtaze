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
  
      const currentMonth = new Date().toISOString().slice(0, 7); // e.g., "2025-03"
  
      // 1️⃣ **Find the track**
      const track = await Track.findById(trackId);
      if (!track) throw new Error("Track not found");
  
      // 2️⃣ **Ensure `listeners` has a default value**
      if (track.listeners === undefined) {
        track.listeners = 0;
      }
  
      // 3️⃣ **Ensure `playHistory` is initialized**
      if (!track.playHistory) {
        track.playHistory = []; // Initialize if undefined
      }
  
      // 4️⃣ **Check if the current month already exists**
      const monthIndex = track.playHistory.findIndex((h) => h.month === currentMonth);
  
      if (monthIndex === -1) {
        // If the current month is missing, add a new entry
        track.playHistory.push({ month: currentMonth, plays: 1 });
      } else {
        // If month exists, increment the play count
        track.playHistory[monthIndex].plays += 1;
      }
  
      // 5️⃣ **Increment the total listener count**
      track.listeners += 1;
  
      // 6️⃣ **Save the updated track**
      await track.save();
  
      console.log("Updated track:", track);
      return track;
    } catch (error: any) {
      console.error("Error updating track listeners:", error);
      throw new Error("Failed to update track listeners");
    }
  }
  



  async statsOfArtist(): Promise<void> {
      console.log(status,"ss");



  }
}