import { injectable } from "inversify";
import { IArtistRepository } from "../../domain/repositories/IArtistRepository";
import { ITrack } from "../../domain/entities/ITrack";
import IUser from "../../domain/entities/IUser";
import { IVerificationRequest } from "../../domain/entities/IVerificationRequest";
import { IAlbum } from "../../domain/entities/IAlbum";
import { ArtistMonetization } from "../../domain/entities/IMonetization";
import { Track } from "../db/models/TrackModel";
import UserModel from "../db/models/UserModel";
import { AlbumModel } from "../db/models/AlbumModel";
import VerificationModel from "../db/models/VerificationRequestModel";

@injectable()
export class ArtistRepository implements IArtistRepository {
  async findByEmail(email: string): Promise<IUser> {
    return (await UserModel.findOne({ email }).lean<IUser>().exec())!;
  }

  async upload(data: ITrack): Promise<ITrack | null> {
    try {
      const track = new Track(data);
      const savedTrack = await track.save();

      if (data.albumId) {
        await AlbumModel.findByIdAndUpdate(
          data.albumId,
          { $addToSet: { tracks: savedTrack._id } },
          { new: true }
        ).exec();
      }

      return savedTrack.toObject() as any;
    } catch (error) {
      console.error("Error uploading track:", error);
      throw new Error("Failed to upload track");
    }
  }


  async updateTrackByArtist(
    data: ITrack,
    trackId: string
  ): Promise<ITrack | null> {
    try {

      const updatedTrack = await Track.findByIdAndUpdate(trackId, data, {
        new: true,
      })
        .lean<ITrack>()
        .exec();

      if (!updatedTrack) {
        throw new Error("Track not found");
      }

      if (data.albumId) {
        const albumObjectId = data.albumId

        await AlbumModel.findByIdAndUpdate(
          albumObjectId,
          { $addToSet: { tracks: updatedTrack._id } },
          { new: true }
        ).exec();
      }

      return updatedTrack;
    } catch (error) {
      console.error("Error updating track:", error);
      throw new Error("Failed to update track");
    }
  }

  async getAllArtists(): Promise<IUser[]> {
    return await UserModel.find().lean<IUser[]>().exec();
  }

  async getAllArtistsP(page: number, limit: number): Promise<{ data: IUser[]; total: number }> {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      UserModel.find({ role: { $ne: "admin" } }).skip(skip).limit(limit).lean<IUser>().exec(),
      UserModel.countDocuments({ role: { $ne: "admin" } })
    ]);
    return { data, total } as any
  }

  async listActiveArtists(page: number, limit: number): Promise<{ data: IUser[]; total: number }> {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      UserModel.find({ isActive: true, role: "artist" }).skip(skip).limit(limit).lean<IUser>().exec(),
      UserModel.countDocuments({ isActive: true })
    ]);
    return { data, total } as any
  }

  async getAllTracksByArtist(userId: string, page: number, limit: number): Promise<{ data: ITrack[]; total: number }> {
    try {
      const skip = (page - 1) * limit;
      const artist = await UserModel.findById(userId);
      if (!artist) { throw new Error("Artist not found"); }
      const query = { artists: { $regex: `^${artist.username}$`, $options: "i" } };
      const [data, total] = await Promise.all(
        [Track.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(), Track.countDocuments(query),]);
      return { data, total } as any
    } catch (error) {
      console.error("Error fetching tracks:", error); throw new Error("Failed to fetch tracks");
    }
  }

  async increment(trackId: string, userId: string): Promise<ITrack | null> {
    console.log("+")
    const currentMonth = new Date().toISOString().slice(0, 7);

    return await Track.findOneAndUpdate(
      { _id: trackId },
      [
        {
          $set: {
            listeners: { $setUnion: ["$listeners", [userId]] },
            playHistory: {
              $cond: [
                {
                  $in: [currentMonth, { $map: { input: "$playHistory", as: "p", in: "$$p.month" } }]
                },
                {
                  // month exists → increment plays
                  $map: {
                    input: "$playHistory",
                    as: "p",
                    in: {
                      $cond: [
                        { $eq: ["$$p.month", currentMonth] },
                        { $mergeObjects: ["$$p", { plays: { $add: ["$$p.plays", 1] } }] },
                        "$$p"
                      ]
                    }
                  }
                },
                {
                  // month not exists → append new object
                  $concatArrays: [
                    "$playHistory",
                    [{ month: currentMonth, plays: 1, paymentStatus: false }]
                  ]
                }
              ]
            }
          }
        }
      ],
      { new: true }
    )
      .lean<ITrack>()
      .exec();
  }

  async statsOfArtist(
    userId: string,
    page: number,
    limit: number
  ): Promise<{ data: ArtistMonetization[]; total: number }> {
    const skip = (page - 1) * limit;

    const artist = await UserModel.findById(userId);
    if (!artist) throw new Error("Artist not found");

    const allTracks = await Track.find({
      artists: { $regex: new RegExp(`^${artist.username}$`, "i") }
    });

    const currentMonth = new Date().toISOString().slice(0, 7);

    const monetizationData: ArtistMonetization[] = allTracks.map(track => {
      const typedTrack = track as any;
      const totalPlays = typedTrack.playHistory?.reduce((sum: any, h: any) => sum + h.plays, 0) || 0
      const monthlyPlays = typedTrack.playHistory?.find((h: { month: string; }) => h.month === currentMonth)?.plays || 0;

      return {
        trackName: typedTrack.title,
        totalPlays,
        monthlyPlays,
        lastUpdated: typedTrack.createdAt?.toISOString() || "",
      };
    }).sort((a, b) => b.totalPlays - a.totalPlays);

    const paginatedData = monetizationData.slice(skip, skip + limit);

    return { data: paginatedData, total: monetizationData.length };
  }


  async saveCard(artistId: string, paymentMethodId: string): Promise<IUser | null> {
    try {
      const updatedArtist = await UserModel.findByIdAndUpdate(
        artistId,
        { stripePaymentMethodId: paymentMethodId },
        { new: true }
      );

      return updatedArtist ? ({ ...updatedArtist.toObject(), _id: updatedArtist._id.toString() } as unknown as IUser) : null;
    } catch (error) {
      console.error(error);
      return null;
    }
  }
  async checkcard(artistId: string): Promise<IUser | null> {
    return await UserModel.findById(artistId).lean<IUser>().exec();
  }

  async getVerificationStatus(artistId: string): Promise<IVerificationRequest | null> {
    const verification = await VerificationModel.findOne({ artistId }).exec();
    return verification as any
  }

  async requestVerification(artistId: string, imageFile: string): Promise<IVerificationRequest | null> {
    try {
      await VerificationModel.deleteOne({ artistId });

      const verificationRequest: IVerificationRequest = {
        artistId,
        idProof: imageFile,
        status: "pending",
        submittedAt: new Date(),
        reviewedAt: null,
        feedback: null,
      };

      const newVerification = new VerificationModel(verificationRequest);
      const savedVerification = await newVerification.save();

      return savedVerification as any;
    } catch (error) {
      console.error("Error in verificationRepository.requestVerification:", error);
      throw new Error("Failed to save verification request");
    }
  }

  async usernameUpdate(userId: string, username: string): Promise<IUser | null> {
    return await UserModel.findByIdAndUpdate(userId, { username }, { new: true }).lean<IUser>().exec();
  }

  async allAlbums(userId: string): Promise<IAlbum[] | null> {
    return await AlbumModel.find({ artistId: userId }).lean<IAlbum[]>().exec();
  }

  async albumsongs(albumId: string): Promise<IAlbum | null> {
    return await AlbumModel.findById(albumId).lean<IAlbum>().exec();
  }

  async findTracksByIds(albumTracks: string[]): Promise<ITrack[]> {
    return await Track.find({ _id: { $in: albumTracks } }).lean<ITrack[]>().exec();
  }

  async uploadAlbum(newAlbum: IAlbum): Promise<IAlbum | null> {
    const album = new AlbumModel(newAlbum);
    return await album.save() as any
  }
}
