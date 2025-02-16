import IUser from "../entities/IUser";

export interface IAdminRepository {
  findByEmail: (email: string) => Promise<IUser | null>;
}
