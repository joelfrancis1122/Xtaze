import IPasswordService from "../domain/service/IPasswordService"

import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import IUser from "../domain/entities/IUser";
import { IArtistRepository } from "../domain/repositories/IArtistRepository";
import { ITrack } from "../domain/entities/ITrack";
import { uploadImageToCloud, uploadSongToCloud } from "../framework/service/cloudinary.service";
dotenv.config();

interface useCaseDependencies {
  repository: {
    artistRepository: IArtistRepository
  },
  service: {
    passwordService: IPasswordService
  }
}

export default class ArtistUseCase {
  private _artistRepository: IArtistRepository
  private _passwordService: IPasswordService

  constructor(dependencies: useCaseDependencies) {
    this._artistRepository = dependencies.repository.artistRepository
    this._passwordService = dependencies.service.passwordService
  }

  async login(email: string, password: string): Promise<{ success: boolean; message: string; token?: string; artist?: IUser }> {
    const artist = await this._artistRepository.findByEmail(email);
    console.log("thisi is admin broo", artist)
    if (!artist) {
      return { success: false, message: "User not found!" };
    }
    // Check if the role is 'artist'
    if (artist.role !== "artist") {
      return { success: false, message: "Only artists are allowed to login!" };
    }
    if (artist.isActive == false) {
      return { success: false, message: "You're account is suspended !" };
    }
    const isPasswordValid = await this._passwordService.comparePassword(password, artist.password);
    if (!isPasswordValid) {
      return { success: false, message: "Invalid credentials!" };
    }
    const token = jwt.sign({ userId: artist._id, email: artist.email }, process.env.JWT_SECRET!, { expiresIn: "7d" });

    return {
      success: true,
      message: "Login successful!",
      token,
      artist
    };
  }


  async trackUpload(songName: string, artist: string[], genre: string[], album: string, songFile: Express.Multer.File, imageFile: Express.Multer.File): Promise<ITrack | null> {
    const data = { title: songName, artists: artist, genre: genre, album, fileUrl: songFile, img: imageFile }
    console.log(data, "ith oru cheriya ");
    const songUpload = await uploadSongToCloud(songFile);
    const imageUpload = await uploadImageToCloud(imageFile);
    const newTrack: ITrack = {
      title: songName,
      genre: genre,
      album: album,
      fileUrl: songUpload.secure_url,
      img: imageUpload.secure_url,
      listeners: 0,
      artists: artist,
    };

    return await this._artistRepository.upload(newTrack);
  }

  async listArtists(): Promise<IUser[]> {
    return await this._artistRepository.getAllArtists() as IUser[];

  } 

  // async toggleBlockUnblockArtist(id: string): Promise<IUser | null> {
  //   console.log("Artist coming to the toggle");
  //   const artist = await this._artistRepository.getArtistById(id);
  //   console.log("kittiyo",artist)
  //   if (!artist) {
  //     throw new Error("Artist not found");
  //   }
  
  //   const newStatus = !artist.isActive;
  //   console.log(newStatus, "new status");
  
  //   return await this._artistRepository.updateArtistStatus(id, newStatus);
  // }
  

}