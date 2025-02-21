import IUser from "../../domain/entities/IUser";
import { IUserRepository } from "../../domain/repositories/IUserRepository";
import UserModel from "../db/models/UserModel"; // Assuming your User model is in this location

export default class UserRepository implements IUserRepository {

  async add(userData: IUser): Promise<IUser> {
    try {
      const user = await UserModel.create(userData)
      console.log("workk avanee repo", user);

      return user as unknown as IUser
    } catch (error) {
      throw error
    }
  }

  async findByEmail(email: string): Promise<IUser | null> {
    try {
      const user = await UserModel.findOne({ email });
      return user as unknown as IUser
    } catch (error) {
      throw error
    }
  }

  async findByPhone(phone: number): Promise<IUser | null> {
    try {
      const user = await UserModel.findOne({ phone });
      return user as unknown as IUser
    } catch (error) {
      throw error
    }
  }

  async getUserUpdated(userId: string): Promise<IUser | null> {
    return await UserModel.findById({ _id: userId });
  }

  async updateProfile(userId: string, pic: string): Promise<IUser | null> {
    try {
      const updatedUser = await UserModel.findByIdAndUpdate(
        userId,
        { profilePic: pic },
        { new: true, runValidators: true }
      ).lean();

      return updatedUser as IUser | null; 
    } catch (error) {
      console.log(error);
      return null;
    }
  }
  async getupdatedArtist(artistId: string): Promise<IUser | null> {
    const updatedArtist = await UserModel.findOne({ _id: artistId }); 
    return updatedArtist as unknown as IUser   
}

}
