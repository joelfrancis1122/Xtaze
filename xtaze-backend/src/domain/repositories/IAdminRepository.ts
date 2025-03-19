import { IBanner } from "../entities/IBanner";
import IUser from "../entities/IUser";

export interface IAdminRepository {
  findByEmail: (email: string) => Promise<IUser | null>;
  getArtistById(id: string): Promise<IUser | null>;
  updateArtistStatus(id: string,status:boolean): Promise<IUser | null>;
  createBanner(title:string,description:string,action:string,isActive:boolean,createdBy:string,file:Express.Multer.File):Promise<IBanner|null>
  findAll():Promise<IBanner[]|null>
  findBanner(id:string):Promise<IBanner|null>
  findBannerforUpdate(id:string,title:string,description:string,action:string,isActive:boolean,file:Express.Multer.File):Promise<IBanner|null>
}
