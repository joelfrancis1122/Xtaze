import { IBanner } from "../../domain/entities/IBanner";
import IUser from "../../domain/entities/IUser";
import { IAdminRepository } from "../../domain/repositories/IAdminRepository";
import { uploadImageToCloud, uploadProfileCloud } from "../../framework/service/cloudinary.service";
import BannerModel from "../db/models/BannerModel";
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
  async createBanner(title:string,description:string,action:string,isActive:boolean,createdBy:string,file: Express.Multer.File): Promise<IBanner|null> {
      console.log(title,description,action,isActive,createdBy,file,"ss");
      const getBannerURl = await uploadProfileCloud(file);
      const url = getBannerURl.secure_url.toString()
    console.log(getBannerURl,"saaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",url)
    const banner = new BannerModel({title,description,imageUrl:url,action,createdBy,isActive})

      return await banner.save()
  }
  async findAll(): Promise<IBanner[]|null> {
      console.log("odi");
     const data = await BannerModel.find()

      return data
  }
  
  async findBanner(id:string): Promise<IBanner|null> {
      console.log("odi",id);
     const data = await BannerModel.findByIdAndDelete(id)

      return data
  }
  
  
  async findBannerforUpdate(id: string,title: string,description: string,action: string,isActive: boolean,file: Express.Multer.File): Promise<IBanner | null> {
    try {
      console.log("Updating banner with ID:", id);
  
        let data = await uploadProfileCloud(file); 
      let url = data.secure_url
      const updatedBanner = await BannerModel.findByIdAndUpdate(
        id,
        {
          title,
          description,
          action,
          isActive,
          imageUrl:url,
        },
        { new: true } 
      );
      console.log(updatedBanner,"ethy ambuuu")
      if (!updatedBanner) {
        throw new Error("Banner not found or failed to update");
      }
  
      return updatedBanner;
    } catch (error) {
      console.error("Error updating banner:", error);
      throw new Error("Failed to update banner");
    }
  }
  
}


