import IUser from "../entities/IUser";

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
  addToLiked(userId: string,trackId: string): Promise<IUser | null>;
}
