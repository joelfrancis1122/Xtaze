import { ArtistMonetization, MusicMonetization } from "../../domain/entities/IMonetization";
import { ITrack } from "../../domain/entities/ITrack";
import IUser from "../../domain/entities/IUser";
import { IVerificationRequest } from "../../domain/entities/IVeridicationRequest";
import { IArtistRepository } from "../../domain/repositories/IArtistRepository";
import { Track } from "../db/models/TrackModel";
import UserModel from "../db/models/UserModel";
import VerificationModel from "../db/models/VerificationRequestModel";

export default class ArtistRepository implements IArtistRepository {

  async findByEmail(email: string): Promise<IUser> {
    try {
      const artist = await UserModel.findOne({ email });
      return artist as unknown as IUser
    } catch (error) {
      throw error
    }
  }

  async usernameUpdate(userId: string, username: string): Promise<IUser | null> {
    try {
      const updatedUser = await UserModel.findByIdAndUpdate(
        userId,
        { username: username },
        { new: true, runValidators: true }
      ).lean();

      console.log(updatedUser, "ASSSSSSSSSSs")
      return updatedUser as IUser | null;
    } catch (error) {
      console.log(error);
      return null;
    }
  }
  

  async upload(track: ITrack): Promise<ITrack | null> {
    const newTrack = new Track(track)
    return await newTrack.save()
  }
  async updateTrackByArtist(track: ITrack, trackId: string): Promise<ITrack | null> {
    try {
      const updatedTrack = await Track.findByIdAndUpdate(
        trackId,
        { $set: track },
        { new: true, runValidators: true }
      );

      return updatedTrack;
    } catch (error) {
      console.error("Error updating track:", error);
      return null;
    }
  }





  async getAllArtists(): Promise<IUser[]> {
    return await UserModel.find({ role: { $ne: "admin" } });
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


  async increment(trackId: string, id: string): Promise<ITrack | null> {
    try {

      const currentMonth = new Date().toISOString().slice(0, 7); //ith engana varum"2025-03"

      const track = await Track.findById(trackId);
      if (!track) throw new Error("Track not found");

      if (!track.listeners) {
        track.listeners = [];
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

      const rrrr = await Track.updateOne({ _id: trackId }, { $addToSet: { listeners: id } });
      await track.save();

      console.log("Updated track:", track);
      return track;
    } catch (error: unknown) {
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

      return updatedArtist ? ({ ...updatedArtist.toObject(), _id: updatedArtist._id.toString() } as unknown as IUser) : null; 
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
      return { ...artist.toObject(), _id: artist._id.toString() } as unknown as IUser;
    } catch (error) {
      console.error("Error in checkcard:", error);
      return null; // Return null on error to keep it simple
    }
  }

  async getVerificationStatus(artistId: string): Promise<IVerificationRequest | null> {
    try {
      const verification = await VerificationModel.findOne({ artistId }).exec();
      return verification;
    } catch (error) {
      console.error("Error in VERIFICATION:", error);
      return null;
    }
  }

  async requestVerification(artistId: string, idProof: string): Promise<IVerificationRequest | null> {
    try {
      await VerificationModel.deleteOne({ artistId });
  
      const verificationRequest: IVerificationRequest = {
        artistId,
        idProof,
        status: "pending",
        submittedAt: new Date(),
        reviewedAt: null,
        feedback: null,
      };
  
      const newVerification = new VerificationModel(verificationRequest);
      const savedVerification = await newVerification.save();
  
      return savedVerification;
    } catch (error) {
      console.error("Error in verificationRepository.requestVerification:", error);
      throw new Error("Failed to save verification request");
    }
  }
  

  async statsOfArtist(userId: string): Promise<ArtistMonetization[]> {
    try {
      const artist = await UserModel.findById(userId);
      if (!artist) {
        throw new Error("Artist not found");
      }

      const tracks = await Track.find({
        artists: { $regex: new RegExp(`^${artist.username}$`, "i") }
      });

      const currentMonth = new Date().toISOString().slice(0, 7); // e.g., "2025-03"

      const monetizationData: ArtistMonetization[] = tracks
        .map((track) => {
          const typedTrack = track as ITrack;

          // ✅ Corrected total plays calculation
          const totalPlays = typedTrack.playHistory?.reduce((sum, h) => sum + h.plays, 0) || 0;

          // Extract only the current month's plays
          const monthlyPlays = typedTrack.playHistory?.find((h) => h.month === currentMonth)?.plays || 0;

          return {
            trackName: typedTrack.title,
            totalPlays, // ✅ Now correctly sums all months' plays
            monthlyPlays, // Only current month plays
            lastUpdated: typedTrack?.createdAt?.toISOString() || "",
          };
        })
        .sort((a, b) => b.totalPlays - a.totalPlays);

      return monetizationData;
    } catch (error: unknown) {
      console.error("Error in statsOfArtist:", error);
      throw new Error((error as Error).message || "Failed to fetch artist stats");
    }
  }
}
