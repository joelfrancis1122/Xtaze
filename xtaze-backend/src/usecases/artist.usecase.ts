import IPasswordService from "../domain/service/IPasswordService"

import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import IUser from "../domain/entities/IUser";
import { IArtistRepository } from "../domain/repositories/IArtistRepository";
import { ITrack } from "../domain/entities/ITrack";
import { uploadIdproofCloud, uploadImageToCloud, uploadSongToCloud } from "../framework/service/cloudinary.service";
import { IUserRepository } from "../domain/repositories/IUserRepository";
import { ArtistMonetization, MusicMonetization } from "../domain/entities/IMonetization";
import { IVerificationRequest } from "../domain/entities/IVeridicationRequest";
import { IVerificationStatusResponse } from "../domain/entities/IVerificationStatusResponse ";
import { MESSAGES } from "../domain/constants/messages";
import { IAlbum } from "../domain/entities/IAlbum";
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
    if (!artist) {
      return { success: false, message: MESSAGES.USER_NOT_FOUND };
    }
    // Check if the role is 'artist'
    if (artist.role !== "artist") {
      return { success: false, message: MESSAGES.ARTIST_LOGIN_ONLY };
    }
    if (artist.isActive == false) {
      return { success: false, message: MESSAGES.ACCOUNT_SUSPENDED };
    }
    const isPasswordValid = await this._passwordService.comparePassword(password, artist.password);
    if (!isPasswordValid) {
      return { success: false, message: MESSAGES.LOGIN_FAILED };
    }
    const token = jwt.sign(
      { userId: artist._id, email: artist.email, role: "artist" },
      process.env.JWT_SECRET!,
      { expiresIn: "30M" } // Short-lived access token
    );
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
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as { userId: string };
      const user = await this._userRepository.findById(decoded.userId);
      if (!user) return { success: false, message: "User not found" };
      if (user.isActive === false) return { success: false, message: "Your account is suspended!" };

      const newToken = jwt.sign(
        { userId: user._id, email: user.email, role: "artist" },
        process.env.JWT_SECRET!,
        { expiresIn: "30m" }
      );
      const newRefreshToken = jwt.sign(
        { userId: user._id },
        process.env.JWT_REFRESH_SECRET!,
        { expiresIn: "7d" }
      );

      return {
        success: true,
        message: MESSAGES.TOKEN_REFRESHED,
        token: newToken,
        ArefreshToken: newRefreshToken,
      };
    } catch (error) {
      console.error("Refresh Token Error:", error);
      return { success: false, message: MESSAGES.INVALID_REFRESH_TOKEN };
    }
  }

  async trackUpload(songName: string, artist: string[], genre: string[], albumId: string, songFile: Express.Multer.File, imageFile: Express.Multer.File): Promise<ITrack | null> {
    const data = { title: songName, artists: artist, genre: genre, albumId, fileUrl: songFile, img: imageFile }
    const songUpload = await uploadSongToCloud(songFile);
    const imageUpload = await uploadImageToCloud(imageFile);
    const newTrack: ITrack = {
      title: songName,
      genre: genre,
      albumId: albumId,
      fileUrl: songUpload.secure_url,
      img: imageUpload.secure_url,
      listeners: [],
      artists: artist,
    };
    return await this._artistRepository.upload(newTrack);
  }

  async updateTrackByArtist(TrackId: string, songName: string, artist: string[], genre: string[], albumId: string, songFile?: Express.Multer.File, imageFile?: Express.Multer.File
  ): Promise<ITrack | null> {
    const songUpload = songFile ? await uploadSongToCloud(songFile) : null;
    const imageUpload = imageFile ? await uploadImageToCloud(imageFile) : null;

    const updatedTrack: Omit<ITrack, 'fileUrl' | 'img'> & { fileUrl?: string; img?: string } = {
      title: songName || "",
      genre,
      albumId,
      artists: artist,
      ...(imageUpload && { img: imageUpload.secure_url }),
      ...(songUpload && { fileUrl: songUpload.secure_url }),
    };

    return await this._artistRepository.updateTrackByArtist(updatedTrack, TrackId);
  }


  async listArtists(): Promise<IUser[]> {
    return await this._artistRepository.getAllArtists() as IUser[];

  }
  async albumsongs(id: string): Promise<IAlbum | null> {
    const album = await this._artistRepository.albumsongs(id) as IAlbum;
    const tracks = await this._artistRepository.findTracksByIds(album.tracks);
    return {
      ...album,
      tracks,
    } as unknown as IAlbum;
  }

  async listArtistReleases(userId: string): Promise<ITrack[]> {

    return await this._artistRepository.getAllTracksByArtist(userId) as ITrack[];

  }
  async increment(trackId: string, id: string): Promise<ITrack | null> {

    return await this._artistRepository.increment(trackId, id);

  }
  async allAlbums(userid: string,): Promise<IAlbum[] | null> {

    return await this._artistRepository.allAlbums(userid as string);

  }
  async uploadAlbums(artistId: string, name: string, description: string, image?: Express.Multer.File): Promise<IAlbum | null> {
    const imageUpload = image ? await uploadImageToCloud(image) : null;

    const newAlbum: IAlbum = {
      name,
      description,
      coverImage: imageUpload?.secure_url,
      artistId,
      tracks: []
    };

    return await this._artistRepository.uploadAlbum(newAlbum);
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


  async usernameUpdate(userId: string, username: string): Promise<IUser | null> {
    try {
      const updated = await this._userRepository.usernameUpdate(userId, username);

      if (!updated) {
        return null;
      }

      return updated;

    } catch (error) {
      console.error(MESSAGES.ERROR_UPDATING_PROFILE, error);
      return null;
    }
  }



  async getVerificationStatus(artistId: string): Promise<IVerificationStatusResponse | null> {

    const verification = await this._artistRepository.getVerificationStatus(artistId);
    if (!verification) {
      return { status: "unsubmitted" };
    }

    return {
      status: verification.status,
      idProof: verification.idProof,
      feedback: verification.feedback,

    };
  }

  async requestVerification(artistId: string, imageFile: Express.Multer.File): Promise<IVerificationStatusResponse | null> {
    const imageUpload = imageFile ? await uploadIdproofCloud(imageFile) : null;
    if (!imageUpload) return null
    let image = imageUpload.secure_url
    const verification = await this._artistRepository.requestVerification(artistId, image as string);
    if (!verification) {
      return { status: "unsubmitted" };
    }

    return {
      status: verification.status,
      idProof: verification.idProof,
      feedback: verification.feedback,

    };
  }

}