import IUser from "../../domain/entities/IUser";
import { IArtistRepository } from "../../domain/repositories/IArtistRepository";
import UserModel from "../db/models/UserModel";

export default class ArtistRepository implements IArtistRepository {

async findByEmail(email: string): Promise<IUser | null> {
    try {
        console.log(email,"ith enth oi")
      const artist = await UserModel.findOne({ email });
      console.log(artist,"ith entha ")
      return artist as unknown as IUser
    } catch (error) {
      throw error
    }
  }
}