import { IUserRepository } from "../../core/repositories/IUserRepository";
import UserModel from "../db/models/UserModel"; // Assuming your User model is in this location
import { User } from "../../core/entities/User";

export class MongoUserRepository implements IUserRepository {
  async add(user: User): Promise<void> {

    const userDoc = new UserModel({
      ...user
    });

    try {
      await userDoc.save(); // Save the user to MongoDB
      console.log("User saved successfully");
    } catch (error) {
      console.error("Error saving user:", error);
    }
  }

  // Implement the 'findByEmail' method
  async findByEmail(email: string): Promise<User | null> {
    try {
      const userDoc = await UserModel.findOne({ email });
      if (userDoc) {
        return new User(
          userDoc.id.toString(),
          userDoc.username,
          userDoc.country,
          userDoc.gender,
          userDoc.year,
          userDoc.phone,
          userDoc.email,
          userDoc.password,
          userDoc.premium
        );
      } else {
        return null;
      }
    } catch (error) {
      
      console.error("Error finding user by email:", error);
      return null;
    }
  }
  async findByPhone(phone: number): Promise<User | null> {
    try {
      const userDoc = await UserModel.findOne({ phone });
      if (userDoc) {
        return new User(
          userDoc.id.toString(),
          userDoc.username,
          userDoc.country,
          userDoc.gender,
          userDoc.year,
          userDoc.phone,
          userDoc.email,
          userDoc.password,
          userDoc.premium
        );
      } else {
        return null;
      }
    } catch (error) {
      console.error("Error finding user by email:", error);
      return null;
    }
  }
}
