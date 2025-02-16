import IUser from "../../domain/entities/IUser";
import { IUserRepository } from "../../domain/repositories/IUserRepository";
import UserModel from "../db/models/UserModel"; // Assuming your User model is in this location

export default class UserRepository implements IUserRepository {

  async add(userData: IUser): Promise<IUser> {
    try{
      const user=await UserModel.create(userData)
      console.log("workk avanee repo",user);
      
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
  // async findByEmail(email: string): Promise<IUser | null> {
  //   return await UserModel.findOne({ email });
  // }
  
}
