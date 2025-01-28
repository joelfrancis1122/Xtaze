import { IUserRepository } from "../../infrastructure/repositories/IUserRepository";
import { User } from "../entities/User";

export class RegisterUser {
  constructor(private userRepository: IUserRepository) {}

  async execute(name: string, email: string, password: string) {
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new Error("User already exists");
    }

    const user = new User(Date.now().toString(), name, email, password);
    await this.userRepository.add(user);
    return user;
  }
}
