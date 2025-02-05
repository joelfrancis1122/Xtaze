// src/core/usecases/RegisterUser.ts
import { IUserRepository } from "../repositories/IUserRepository";
import { User } from "../entities/User";
import bcrypt from 'bcryptjs';

export class RegisterUser {
  constructor(private userRepository: IUserRepository) { }

  async execute(username: string, country: string, gender: string, year: number, phone: number, email: string, password: string): Promise<User> {
    const [existingUserByEmail, existingUserByPhone] = await Promise.all([
      this.userRepository.findByEmail(email),
      this.userRepository.findByPhone(phone)
    ]);

    if (existingUserByEmail) {
      throw new Error("User already exists with this email");
    }

    if (existingUserByPhone) {
      throw new Error("User already exists with this phone number");
    }


    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User("", username, country, gender, year, phone, email, hashedPassword, false); //premium is false by default

    await this.userRepository.add(user);
    return user;
  }
}
