import { ITrack } from "../entities/ITrack";
import IUser from "../entities/IUser";

export interface IArtistRepository {
  findByEmail: (email: string) => Promise<IUser>;
  upload: (data: ITrack) => Promise<ITrack | null>;
  getAllArtists(): Promise<IUser[]>;
  getAllTracksByArtist(userId:string):Promise<ITrack[]>
  increment(trackId:string):Promise<ITrack|null>

}
