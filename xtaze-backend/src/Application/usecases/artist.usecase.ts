import IPasswordService from "../../domain/service/IPasswordService"

import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { IArtistRepository } from "../../domain/repositories/IArtistRepository";
import { ITrack } from "../../domain/entities/ITrack";
import { uploadIdproofCloud, uploadImageToCloud, uploadSongToCloud } from "../../infrastructure/service/cloudinary.service";
import { IUserRepository } from "../../domain/repositories/IUserRepository";
import { MESSAGES } from "../../domain/constants/messages";
import { IAlbum } from "../../domain/entities/IAlbum";
import { injectable } from "inversify";
import { inject } from "inversify";
import TYPES from "../../domain/constants/types";
import { ArtistMapper } from "../mappers/ArtistMapper";
import { IArtist } from "../../domain/entities/IArtist";
import { TrackMapper } from "../mappers/TrackMapper";
import { AlbumMapper } from "../mappers/AlbumMapper";
import { ArtistMonetizationMapper } from "../mappers/ArtistMonetizationMapper";

dotenv.config();
@injectable()
export default class ArtistUseCase {
  private _artistRepository: IArtistRepository;
  private _passwordService: IPasswordService;
  private _userRepository: IUserRepository;

  constructor(
    @inject(TYPES.ArtistRepository) artistRepository: IArtistRepository,
    @inject(TYPES.PasswordService) passwordService: IPasswordService,
    @inject(TYPES.UserRepository) userRepository: IUserRepository,
  ) {
    this._artistRepository = artistRepository;
    this._passwordService = passwordService;
    this._userRepository = userRepository;
  }



  async login(email: string, password: string) {
    const artist = await this._artistRepository.findByEmail(email);
    if (!artist) {
      return { success: false, message: MESSAGES.USER_NOT_FOUND };
    }
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
      { userId: artist._id, email: artist.email, role: MESSAGES.ARTIST },
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
      message: MESSAGES.LOGIN_SUCCESS,
      token,
      ArefreshToken,
      artist: ArtistMapper.toDTO(artist as IArtist)
    };
  }
  async refresh(refreshToken: string) {
    try {
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as { userId: string };
      const user = await this._userRepository.findById(decoded.userId);
      if (!user) return { success: false, message: MESSAGES.USER_NOT_FOUND };
      if (user.isActive === false) return { success: false, message: MESSAGES.ACCOUNT_SUSPENDED };

      const newToken = jwt.sign(
        { userId: user._id, email: user.email, role: MESSAGES.ARTIST },
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
      return { success: false, message: MESSAGES.INVALID_REFRESH_TOKEN };
    }
  }

  async trackUpload(songName: string, artist: string[], genre: string[], albumId: string, songFile: Express.Multer.File, imageFile: Express.Multer.File) {
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
  ) {
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


  async listArtists(page: number, limit: number) {
    const { data, total } = await this._artistRepository.getAllArtistsP(page, limit);
   
    return {
      data: ArtistMapper.toDTOs(data as IArtist[]),
      pagination: {
        total,
        page,
        limit,
        totalpages: Math.ceil(total / limit)
      }
    }
  }

  async listActiveArtists(page: number, limit: number) {
    const { data, total } = await this._artistRepository.listActiveArtists(page, limit);
    return {
      data,
      pagination: {
        total,
        page,
        limit,
        totalpages: Math.ceil(total / limit)
      }
    }
  }

  async albumsongs(id: string) {
    const album = await this._artistRepository.albumsongs(id) as IAlbum;
    const tracks = await this._artistRepository.findTracksByIds(album.tracks);
    return {
      ...AlbumMapper.toDTO(album),
      tracks: tracks
    };

  }

  async listArtistReleases(userId: string, page: number, limit: number) {
    const { data, total } = await this._artistRepository.getAllTracksByArtist(userId, page, limit);
    return {
      data: TrackMapper.toDTOs(data),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    }


  }
  async increment(trackId: string, id: string) {

    return await this._artistRepository.increment(trackId, id);

  }
async allAlbums(userid: string) {
  const albums = await this._artistRepository.allAlbums(userid);
  return AlbumMapper.toDTOs(albums as IAlbum[]); // cast to array
}


  async uploadAlbums(artistId: string, name: string, description: string, image?: Express.Multer.File) {
    const imageUpload = image ? await uploadImageToCloud(image) : null;

    const newAlbum: IAlbum = {
      name,
      description,
      coverImage: imageUpload?.secure_url,
      artistId,
      tracks: []
    };

    const album = await this._artistRepository.uploadAlbum(newAlbum);
    if (!album) return null
    return AlbumMapper.toDTO(album);
  }

  async statsOfArtist(userId: string, page: number, limit: number) {

    const { data, total } = await this._artistRepository.statsOfArtist(userId, page, limit);
    return {
      data: ArtistMonetizationMapper.toDTOs(data),  
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
  async saveCard(artistId: string, paymentMethodId: string) {

    return await this._artistRepository.saveCard(artistId, paymentMethodId);


  }
  async checkcard(artistId: string) {

    return await this._artistRepository.checkcard(artistId);
  }


  async usernameUpdate(userId: string, username: string) {
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



  async getVerificationStatus(artistId: string) {

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

  async requestVerification(artistId: string, imageFile: Express.Multer.File) {
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