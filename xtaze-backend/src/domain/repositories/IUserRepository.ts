import IUser from "../entities/IUser";

export interface IUserRepository {
  add: (user: IUser) => Promise<IUser>;
  findByEmail: (email: string) => Promise<IUser|null>;
  findByPhone: (phone: number) => Promise<IUser | null>;
  updateProfile: (userId: string,pic:string) => Promise<IUser | null>;
  getupdatedArtist: (userId: string) => Promise<IUser | null>;
}
