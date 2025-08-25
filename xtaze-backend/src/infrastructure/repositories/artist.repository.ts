import { IAlbum } from "../../domain/entities/IAlbum";
import { ArtistMonetization, MusicMonetization } from "../../domain/entities/IMonetization";
import { ITrack } from "../../domain/entities/ITrack";
import IUser from "../../domain/entities/IUser";
import { IVerificationRequest } from "../../domain/entities/IVeridicationRequest";
import { IArtistRepository } from "../../domain/repositories/IArtistRepository";
import { AlbumModel } from "../db/models/AlbumModel";
import { Track } from "../db/models/TrackModel";
import UserModel from "../db/models/UserModel";
import VerificationModel from "../db/models/VerificationRequestModel";
import { BaseRepository } from "./BaseRepository";

// export default class ArtistRepository implements IArtistRepository {
export default class ArtistRepository
  extends BaseRepository<IUser> implements IArtistRepository {

  constructor() {
    super(UserModel); // ee modelne base classilek pass

  }


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

      return updatedUser as IUser | null;
    } catch (error) {
      console.log(error);
      return null;
    }
  }


  async upload(track: ITrack): Promise<ITrack | null> {
    const newTrack = new Track(track);
    const savedTrack = await newTrack.save();

    if (savedTrack && track.albumId) {
      await AlbumModel.findByIdAndUpdate(
        track.albumId,
        { $push: { tracks: savedTrack._id } },
        { new: true }
      );
    }

    return savedTrack;
  }

  async uploadAlbum(album: IAlbum): Promise<IAlbum | null> {
    const newAlbum = new AlbumModel(album);
    const savedAlbum = await newAlbum.save();
    return savedAlbum.toObject() as IAlbum;
  }

  async updateTrackByArtist(track: ITrack, trackId: string): Promise<ITrack | null> {
    try {
      const updatedTrack = await Track.findByIdAndUpdate(
        trackId,
        { $set: track },
        { new: true, runValidators: true }
      );
      await AlbumModel.findByIdAndUpdate(
        track.albumId,
        { $push: { tracks: trackId } },
        { new: true }
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
  }




  async allAlbums(userId: string): Promise<IAlbum[] | null> {
    return await AlbumModel.find({ artistId: userId });
  }

  async albumsongs(userId: string): Promise<IAlbum | null> {
    const album = await AlbumModel.findOne({ _id: userId });
    if (!album) {
      return null;
    }
    const tracks = await Track.find({ _id: { $in: album.tracks } });
    return { ...album.toObject(), tracks } as unknown as IAlbum;
  }

  async findTracksByIds(trackIds: string[]): Promise<ITrack[]> {
    return await Track.find({ _id: { $in: trackIds } });
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
      console.log(rrrr, "basil")
      await track.save();

      return track;
    } catch (error: unknown) {
      throw new Error("Failed to update track listenersss");
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


async statsOfArtist(
  userId: string,
  page: number,
  limit: number
): Promise<{ data: ArtistMonetization[]; total: number }> {
  try {
    const artist = await UserModel.findById(userId);
    if (!artist) {
      throw new Error("Artist not found");
    }

    const skip = (page - 1) * limit;

    const [tracks, total] = await Promise.all([
      Track.find({
        artists: { $regex: new RegExp(`^${artist.username}$`, "i") },
      })
        .skip(skip)
        .limit(limit),

      Track.countDocuments({
        artists: { $regex: new RegExp(`^${artist.username}$`, "i") },
      }),
    ]);

    const currentMonth = new Date().toISOString().slice(0, 7); // e.g. "2025-08"

    const monetizationData: ArtistMonetization[] = tracks
      .map((track) => {
        const typedTrack = track as ITrack;

        // ✅ Total plays across all months
        const totalPlays =
          typedTrack.playHistory?.reduce((sum, h) => sum + h.plays, 0) || 0;

        // ✅ Only current month plays
        const monthlyPlays =
          typedTrack.playHistory?.find((h) => h.month === currentMonth)?.plays ||
          0;

        return {
          trackName: typedTrack.title,
          totalPlays,
          monthlyPlays,
          lastUpdated: typedTrack?.createdAt?.toISOString() || "",
        };
      })
      .sort((a, b) => b.totalPlays - a.totalPlays);

    return {
      data: monetizationData,
      total,
    };
  } catch (error: unknown) {
    console.error("Error in statsOfArtist:", error);
    throw new Error((error as Error).message || "Failed to fetch artist stats");
  }
}

}
