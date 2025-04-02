import { ArtistMonetization, MusicMonetization } from "../entities/IMonetization";
import { ITrack } from "../entities/ITrack";
import IUser from "../entities/IUser";

export interface IArtistRepository {
  findByEmail: (email: string) => Promise<IUser>;
  upload: (data: ITrack) => Promise<ITrack | null>;
  updateTrackByArtist: (data: ITrack,TrackId:string) => Promise<ITrack | null>;
  getAllArtists(): Promise<IUser[]>;
  getAllTracksByArtist(userId:string):Promise<ITrack[]>
  increment(trackId:string):Promise<ITrack|null>
  statsOfArtist(userId:string):Promise<ArtistMonetization[]>
  saveCard(artistId:string,paymentMethodId:string):Promise<IUser|null>;
  checkcard(artistId:string):Promise<IUser|null>;
}
