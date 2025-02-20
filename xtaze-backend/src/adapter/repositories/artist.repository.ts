import { ITrack } from "../../domain/entities/ITrack";
import IUser from "../../domain/entities/IUser";
import { IArtistRepository } from "../../domain/repositories/IArtistRepository";
import {  Track } from "../db/models/TrackModel";
import UserModel from "../db/models/UserModel";

export default class ArtistRepository implements IArtistRepository {

async findByEmail(email: string): Promise<IUser> {
    try {
        console.log(email,"ith enth oi")
      const artist = await UserModel.findOne({ email });
      console.log(artist,"ith entha ")
      return artist as unknown as IUser
    } catch (error) {
      throw error
    }
  }
  async upload(track:ITrack):Promise<ITrack|null>{
    console.log(track,"ithan last ")
    const newTrack = new Track(track)
    console.log(newTrack,"ithan last final destination ")
    return await newTrack.save()
  }
  async getAllArtists(): Promise<IUser[]> {
    console.log("ithset")
    return await UserModel.find();
  }

  // async getArtistById(id: string): Promise<IUser|null> {
  //   return await UserModel.findById(id);
  // }
  
  // async updateArtistStatus(id: string, status: boolean): Promise<IUser|null> {
  //     console.log(status,"ss");
      

  //   return  await UserModel.findByIdAndUpdate(id, { isActive:status}, { new: true });
  
  // }
}