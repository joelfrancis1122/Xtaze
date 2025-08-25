import { IAlbum } from "../entities/IAlbum";
import { ArtistMonetization, MusicMonetization } from "../entities/IMonetization";
import { ITrack } from "../entities/ITrack";
import IUser from "../entities/IUser";
import { IVerificationRequest } from "../entities/IVeridicationRequest";

export interface IArtistRepository {
  findByEmail: (email: string) => Promise<IUser>;
  upload: (data: ITrack) => Promise<ITrack | null>;
  updateTrackByArtist: (data: ITrack, TrackId: string) => Promise<ITrack | null>;
  getAllArtists(): Promise<IUser[]>;
  getAllArtistsP(page:number,limit:number): Promise<{data:IUser[],total:number}>;
  listActiveArtists(page:number,limit:number): Promise<{data:IUser[],total:number}>;
  getAllTracksByArtist(userId: string,page:number,limit:number): Promise<{data:ITrack[];total:number}>
  increment(trackId: string, id: string): Promise<ITrack | null>
  statsOfArtist(userId: string,page:number,limit:number): Promise<{data:ArtistMonetization[];total:number}>
  saveCard(artistId: string, paymentMethodId: string): Promise<IUser | null>;
  checkcard(artistId: string): Promise<IUser | null>;
  getVerificationStatus(artistId: string): Promise<IVerificationRequest | null>;
  requestVerification(artistId: string, imageFile: string): Promise<IVerificationRequest| null>
  usernameUpdate(userId:string,username:string): Promise<IUser|null>
  allAlbums(userId:string): Promise<IAlbum[]|null>
  albumsongs(userId:string): Promise<IAlbum|null>
  findTracksByIds(albumTracks: string[]): Promise<ITrack[]>;
  uploadAlbum(newAlbum:IAlbum): Promise<IAlbum|null>

}
