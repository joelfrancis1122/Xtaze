import IUser from "../entities/IUser";

export interface IAdminRepository {
  findByEmail: (email: string) => Promise<IUser | null>;
  getArtistById(id: string): Promise<IUser | null>;
  updateArtistStatus(id: string,status:boolean): Promise<IUser | null>;
}
