import IUser from "../entities/IUser";

export interface IArtistRepository {
  findByEmail: (email: string) => Promise<IUser | null>;
}
