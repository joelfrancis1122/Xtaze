import { User } from "../../core/entities/User";
import { IUserRepository } from "./IUserRepository";

export class MongoUserRepository implements IUserRepository {
  async add(user: User): Promise<void> {
    // Logic to save user in MongoDB (e.g., using Mongoose)
  }

  async findByEmail(email: string): Promise<User | null> {
    // Logic to find a user by email in MongoDB
    return null;
  }
}
