import { ArtistMonetization, MusicMonetization } from "../../domain/entities/IMonetization";
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

      const track = await Track.findById(trackId);
      if (!track) throw new Error("Track not found");

      if (track.listeners === undefined) {
        track.listeners = 0;
      }
      if (!track.playHistory) {
        track.playHistory = [];
      }

      const monthIndex = track.playHistory.findIndex((h) => h.month === currentMonth);

      if (monthIndex === -1) {
        track.playHistory.push({ month: currentMonth, plays: 1 });
      } else {
        track.playHistory[monthIndex].plays += 1;
      }

      track.listeners += 1;

      await track.save();

      console.log("Updated track:", track);
      return track;
    } catch (error: any) {
      console.error("Error updating track listeners:", error);
      throw new Error("Failed to update track listeners");
    }
  }
  async saveCard(artistId: string, paymentMethodId: string): Promise<IUser | null> {
    try {
      const updatedArtist = await UserModel.findByIdAndUpdate(
        artistId,
        { stripePaymentMethodId: paymentMethodId },
        { new: true } // Ensures the updated document is returned
      );
  
      return updatedArtist ? { ...updatedArtist.toObject(), _id: updatedArtist._id.toString() } : null;
    } catch (error) {
      console.error(error);
      return null;
    }
  }
  async checkcard(artistId: string): Promise<IUser | null> {
    try {
      // Find the artist by ID
      const artist = await UserModel.findById(artistId);

      if (!artist || !artist.stripePaymentMethodId) {
        return null;
      }

      // Return the artist document, converting _id to string
      return { ...artist.toObject(), _id: artist._id.toString() };
    } catch (error) {
      console.error("Error in checkcard:", error);
      return null; // Return null on error to keep it simple
    }
  }
  

  async statsOfArtist(userId: string): Promise<ArtistMonetization[]> {
    try {
      const artist = await UserModel.findById(userId);
      if (!artist) {
        throw new Error("Artist not found");
      }
      console.log(artist, "as");

      const tracks = await Track.find({ artists: { $regex: new RegExp(`^${artist.username}$`, "i") } });

      const currentMonth = new Date().toISOString().slice(0, 7); // e.g., "2025-03"

      const monetizationData: ArtistMonetization[] = tracks
        .map((track) => {
          const typedTrack = track as ITrack;
          const monthlyPlays = typedTrack.playHistory?.find((h) => h.month === currentMonth)?.plays || 0;

          return {
            trackName: typedTrack.title,
            totalPlays: typedTrack.listeners || 0,
            monthlyPlays,
            lastUpdated: typedTrack?.createdAt?.toISOString() || "",

          };
        })
        .sort((a, b) => b.totalPlays - a.totalPlays);

      return monetizationData;
    } catch (error: any) {
      console.error("Error in statsOfArtist:", error);
      throw new Error(error.message || "Failed to fetch artist stats");
    }
  }


}