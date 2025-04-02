import IPasswordService from "../domain/service/IPasswordService"

import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import IUser from "../domain/entities/IUser";
import { IArtistRepository } from "../domain/repositories/IArtistRepository";
import { ITrack } from "../domain/entities/ITrack";
import { uploadImageToCloud, uploadSongToCloud } from "../framework/service/cloudinary.service";
import { IUserRepository } from "../domain/repositories/IUserRepository";
import { ArtistMonetization, MusicMonetization } from "../domain/entities/IMonetization";
dotenv.config();

interface useCaseDependencies {
  repository: {
    artistRepository: IArtistRepository
    userRepository: IUserRepository
  },
  service: {
    passwordService: IPasswordService
  }
}

export default class ArtistUseCase {
  private _userRepository: IUserRepository
  private _artistRepository: IArtistRepository
  private _passwordService: IPasswordService

  constructor(dependencies: useCaseDependencies) {
    this._artistRepository = dependencies.repository.artistRepository
    this._passwordService = dependencies.service.passwordService
    this._userRepository = dependencies.repository.userRepository

  }

  async login(email: string, password: string): Promise<{ success: boolean; message: string; token?: string; ArefreshToken?: string; artist?: IUser }> {
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
    const token = jwt.sign(
      { userId: artist._id, email: artist.email, role: "artist" },
      process.env.JWT_SECRET!,
      { expiresIn: "10M" } // Short-lived access token
    );
    console.log("ith unda refresh all jwts");
    const ArefreshToken = jwt.sign(
      { userId: artist._id },
      process.env.JWT_REFRESH_SECRET!,
      { expiresIn: "7d" } // Long-lived refresh token
    );
    return {
      success: true,
      message: "Login successful!",
      token,
      ArefreshToken,
      artist
    };
  }
  async refresh(refreshToken: string): Promise<{ success: boolean; message: string; token?: string; ArefreshToken?: string }> {
    try {
      console.log("yeaah ithil varunind");
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as { userId: string };
      const user = await this._userRepository.findById(decoded.userId);
      if (!user) return { success: false, message: "User not found" };
      if (user.isActive === false) return { success: false, message: "Your account is suspended!" };

      const newToken = jwt.sign(
        { userId: user._id, email: user.email, role: "artist" },
        process.env.JWT_SECRET!,
        { expiresIn: "10m" }
      );
      const newRefreshToken = jwt.sign(
        { userId: user._id },
        process.env.JWT_REFRESH_SECRET!,
        { expiresIn: "7d" }
      );

      return {
        success: true,
        message: "Token refreshed successfully",
        token: newToken,
        ArefreshToken: newRefreshToken,
      };
    } catch (error) {
      console.error("Refresh Token Error:", error);
      return { success: false, message: "Invalid or expired refresh token" };
    }
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

  async updateTrackByArtist(TrackId: string,songName: string,artist: string[],genre: string[],album: string,songFile?: Express.Multer.File,imageFile?: Express.Multer.File
  ): Promise<ITrack | null> {
    const songUpload = songFile ? await uploadSongToCloud(songFile) : null;
    const imageUpload = imageFile ? await uploadImageToCloud(imageFile) : null;
  
    const updatedTrack: Omit<ITrack, 'fileUrl' | 'img'> & { fileUrl?: string; img?: string } = {
      title: songName || "", 
      genre,
      album,
      artists: artist,
      ...(imageUpload && { img: imageUpload.secure_url }),
      ...(songUpload && { fileUrl: songUpload.secure_url }),
    };
  
    // Update only the provided fields
    console.log(updatedTrack,"joellll")
    return await this._artistRepository.updateTrackByArtist(updatedTrack, TrackId);
  }
  

  async listArtists(): Promise<IUser[]> {
    return await this._artistRepository.getAllArtists() as IUser[];

  }

  async listArtistReleases(userId: string): Promise<ITrack[]> {

    return await this._artistRepository.getAllTracksByArtist(userId) as ITrack[];

  }
  async increment(trackId: string): Promise<ITrack | null> {

    return await this._artistRepository.increment(trackId);


  }
  async statsOfArtist(userId: string): Promise<ArtistMonetization[]> {

    return await this._artistRepository.statsOfArtist(userId);


  }
  async saveCard(artistId: string, paymentMethodId: string): Promise<IUser | null> {

    return await this._artistRepository.saveCard(artistId, paymentMethodId);


  }
  async checkcard(artistId: string): Promise<IUser | null> {

    return await this._artistRepository.checkcard(artistId);


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