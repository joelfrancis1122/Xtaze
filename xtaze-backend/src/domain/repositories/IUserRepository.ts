import IUser from "../entities/IUser";
import { IPlaylist } from "../entities/IPlaylist";
import { ITrack } from "../entities/ITrack";
import { IBanner } from "../entities/IBanner";
import { ICoupon } from "../entities/ICoupon";

export interface IUserRepository {
  add: (user: IUser) => Promise<IUser>;
  findByEmail: (email: string) => Promise<IUser | null>;
  findByUsername: (username: string) => Promise<IUser | null>;
  findByPhone: (phone: number) => Promise<IUser | null>;
  updateProfile: (userId: string, pic: string) => Promise<IUser | null>;
  uploadBanner: (userId: string, file: string) => Promise<IUser | null>;
  updateBio: (userId: string, bio: string) => Promise<IUser | null>;
  getupdatedArtist: (userId: string) => Promise<IUser | null>;
  updateUserSubscription: (userId: string, planName: string) => Promise<IUser | null>;
  findById(userId: string): Promise<IUser | null>;
  updatePassword(user: IUser): Promise<IUser | null>;
  addToLiked(userId: string, trackId: string): Promise<IUser | null>;
  createPlaylist(_id: string, newplaylist: IPlaylist): Promise<IPlaylist | null>;
  addToPlaylist(userId: string, playlistId: string, trackId: string): Promise<IPlaylist | null>;
  findByCreator(userId: string): Promise<IPlaylist[] | null>;
  getPlaylist(id: string, pageNum: number, limitNum: number, skip: number): Promise<{ tracks: ITrack[]; total: number } | null>;
  deletePlaylist(id: string): Promise<IPlaylist | null>;
  updateNamePlaylist(id: string, playlistName: string): Promise<IPlaylist | null>;
  updateImagePlaylist(id: string, file: string): Promise<IPlaylist | null>;
  findAll(): Promise<IBanner[] | null>
  findCouponByCode(code: string): Promise<ICoupon | null>
  updateCouponByCode(code: string, updateData: Partial<ICoupon>): Promise<ICoupon | null>;
  checkCouponisUsed(code: string, userId: string): Promise<boolean>;
  getCoupons(): Promise<ICoupon[] | null>
  getAllTracks(): Promise<ITrack[] | null>
  fetchGenreTracks(GenreName:string): Promise<ITrack[] | null>
  becomeArtist(id:string):  Promise<IUser|null> 
  resetPaymentStatus(): Promise<void>

}
