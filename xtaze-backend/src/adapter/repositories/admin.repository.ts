import IUser from "../../domain/entities/IUser";
import { IAdminRepository } from "../../domain/repositories/IAdminRepository";
import UserModel from "../db/models/UserModel";

export default class AdminRepository implements IAdminRepository {

async findByEmail(email: string): Promise<IUser | null> {
    try {
        console.log(email,"ith enth oi")
      const admin = await UserModel.findOne({ email });
      console.log(admin,"ith entha ")
      return admin as unknown as IUser
    } catch (error) {
      throw error
    }
  }
  
  async getArtistById(id: string): Promise<IUser|null> {
    return await UserModel.findById(id);
  }
  
  async updateArtistStatus(id: string, status: boolean): Promise<IUser|null> {
      console.log(status,"ss");
      

    return  await UserModel.findByIdAndUpdate(id, { isActive:status}, { new: true });
  
  }
}


