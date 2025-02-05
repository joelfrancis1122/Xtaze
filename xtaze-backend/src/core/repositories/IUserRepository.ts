import { User } from "../../core/entities/User";

export interface IUserRepository {
  add: (user: User) => Promise<void>;
  findByEmail: (email: string) => Promise<User | null>;
  findByPhone: (phone: number) => Promise<User | null>;
}
