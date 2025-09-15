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
    const track = new Track(data);
    return await track.save() as any
  }

  async updateTrackByArtist(data: ITrack, trackId: string): Promise<ITrack | null> {
    return await Track.findByIdAndUpdate(trackId, data, { new: true }).lean<ITrack>().exec();
  }

  async getAllArtists(): Promise<IUser[]> {
    return await UserModel.find().lean<IUser[]>().exec();
  }

  async getAllArtistsP(page: number, limit: number): Promise<{ data: IUser[]; total: number }> {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      UserModel.find().skip(skip).limit(limit).lean<IUser>().exec(),
      UserModel.countDocuments()
    ]);
    return { data, total } as any
  }

  async listActiveArtists(page: number, limit: number): Promise<{ data: IUser[]; total: number }> {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      UserModel.find({ isActive: true,role:"artist" }).skip(skip).limit(limit).lean<IUser>().exec(),
      UserModel.countDocuments({ isActive: true })
    ]);
    return { data, total } as any
  }   

  async getAllTracksByArtist(userId: string, page: number, limit: number): Promise<{ data: ITrack[]; total: number }> {
    try {
      const skip = (page - 1) * limit;
      const artist = await UserModel.findById(userId);
      if (!artist) { throw new Error("Artist not found"); }
      const query = { artists: artist.username };
      const [data, total] = await Promise.all(
        [Track.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(), Track.countDocuments(query),]);
      return { data, total } as any
    } catch (error) {
      console.error("Error fetching tracks:", error); throw new Error("Failed to fetch tracks");
    }
  }

async increment(trackId: string, userId: string): Promise<ITrack | null> {
  console.log("increment track play");

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
    return await UserModel.findByIdAndUpdate(artistId, { paymentMethodId }, { new: true }).lean<IUser>().exec();
  }

  async checkcard(artistId: string): Promise<IUser | null> {
    return await UserModel.findById(artistId).lean<IUser>().exec();
  }

  async getVerificationStatus(artistId: string): Promise<IVerificationRequest | null> {
    const verification = await VerificationModel.findOne({ artistId }).exec();
    return verification as any
  }

  async requestVerification(artistId: string, imageFile: string): Promise<IVerificationRequest | null> {
    const request = new UserModel({ artistId, documentUrl: imageFile, status: "pending" });
    return await request.save() as any
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
