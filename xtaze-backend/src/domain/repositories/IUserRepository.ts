import IUser from "../entities/IUser";
import {IPlaylist} from "../entities/IPlaylist";
import { ITrack } from "../entities/ITrack";

export interface IUserRepository {
  add: (user: IUser) => Promise<IUser>;
  findByEmail: (email: string) => Promise<IUser|null>;
  findByUsername: (username: string) => Promise<IUser|null>;
  findByPhone: (phone: number) => Promise<IUser | null>;
  updateProfile: (userId: string,pic:string) => Promise<IUser | null>;
  uploadBanner: (userId: string,file:string) => Promise<IUser | null>;
  updateBio: (userId: string,bio:string) => Promise<IUser | null>;
  getupdatedArtist: (userId: string) => Promise<IUser | null>;
  updateUserSubscription: (userId: string,isPremium:boolean) => Promise<IUser | null>;
  findById(userId: string): Promise<IUser | null>;
  updatePassword(user: IUser): Promise<IUser | null>;
  addToLiked(userId: string,trackId: string): Promise<IUser | null>;
  createPlaylist(_id:string,newplaylist:IPlaylist): Promise<IPlaylist | null>;
  addToPlaylist(userId:string,playlistId:string,trackId:string): Promise<IPlaylist | null>;
  findByCreator(userId:string): Promise<IPlaylist[] | null>;
  getPlaylist(id: string): Promise<ITrack[] | null>;
  deletePlaylist(id: string): Promise<IPlaylist | null>;
  updateNamePlaylist(id: string,playlistName:string): Promise<IPlaylist | null>;
  updateImagePlaylist(id: string,file:string): Promise<IPlaylist | null>;
}
