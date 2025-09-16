import { NextFunction, Request, Response } from "express";
import { HttpStatus } from "../../domain/constants/httpStatus";
import IArtistUseCase from "../../domain/usecase/IArtistUseCase"
import AppError from "../../utils/AppError";
import { MESSAGES } from "../../domain/constants/messages";
import { injectable } from "inversify";
import TYPES from "../../domain/constants/types";
import { inject } from "inversify";

@injectable()
export default class ArtistController {
  private _artistnUseCase: IArtistUseCase

  constructor(@inject(TYPES.ArtistUseCase) artistUseCase: IArtistUseCase) {
    this._artistnUseCase = artistUseCase;
  }
  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;
      const response = await this._artistnUseCase.login(email, password);

      if (!response.success) {
        throw new AppError(response.message || MESSAGES.LOGIN_FAILED, HttpStatus.BAD_REQUEST);
      }
      res.cookie("ArefreshToken", response.ArefreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: "/",
      });
      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  async refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const ArefreshToken = req.cookies.ArefreshToken;

      if (!ArefreshToken) throw new AppError(MESSAGES.REFRESH_TOKEN_REQUIRED, HttpStatus.UNAUTHORIZED);
      const response = await this._artistnUseCase.refresh(ArefreshToken);

      if (response.success && response.token && response.ArefreshToken) {
        res.cookie("ArefreshToken", response.ArefreshToken, {
          httpOnly: true,
          secure: true,
          sameSite: "none",
          maxAge: 7 * 24 * 60 * 60 * 1000,
          path: "/",
        });
        res.status(HttpStatus.OK).json({
          success: true,
          message: response.message || MESSAGES.REFRESH_SUCCESS,
          token: response.token,
        });
      } else {
        res.status(HttpStatus.UNAUTHORIZED).json(response);
      }
    } catch (error) {
      next(error);
    }
  }

  async listArtists(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;

      const listArtists = await this._artistnUseCase.listArtists(page, limit);
      res.status(HttpStatus.OK).json({ success: true, message: MESSAGES.LIST_OF_ARTISTS, data: listArtists });
    } catch (error) {
      next(error);
    }
  }

  async listActiveArtists(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;

      const listArtists = await this._artistnUseCase.listActiveArtists(page, limit);

      res.status(HttpStatus.OK).json({ success: true, message: MESSAGES.LIST_OF_ARTISTS, data: listArtists });
    } catch (error) {
      next(error);
    }
  }

  async getAllTracksArtist(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId, page = 1, limit = 10 } = req.query;
      const pageNum = Number(page) || 1;
      const limitNum = Number(limit) || 10;
      let tracks = null;
      if (userId) {
        tracks = await this._artistnUseCase.listArtistReleases(userId as string, pageNum, limitNum);
      }
      res.status(HttpStatus.OK).json({ success: true, message: MESSAGES.ARTIST_TRACKS_LIST_SUCCESS, tracks });
    } catch (error) {
      next(error);
    }
  }

  async updateTrackByArtist(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { TrackId } = req.query;
      const { title, artists, genre, album } = req.body;
      if (!TrackId) {
        res.status(HttpStatus.BAD_REQUEST).json({ success: false, message: MESSAGES.TRACK_ID_REQUIRED });
        return;
      }

      const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
      const songFile = files?.["fileUrl"]?.[0];
      const imageFile = files?.["img"]?.[0];

      const genreArray = genre ? genre.split(",").map((g: string) => g.trim()) : [];
      const artistArray = artists ? artists.split(",").map((g: string) => g.trim()) : [];

      const updatedTrack = await this._artistnUseCase.updateTrackByArtist(
        TrackId as string,
        title,
        artistArray,
        genreArray,
        album,
        songFile,
        imageFile
      );

      res.status(HttpStatus.OK).json({ success: true, message: MESSAGES.TRACK_UPDATED, track: updatedTrack });
    } catch (error) {
      next(error);
    }
  }

  async incrementListeners(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { trackId, id } = req.body;
      const rese = await this._artistnUseCase.increment(trackId as string, id as string);
      res.status(HttpStatus.OK).json({ success: true, message: MESSAGES.LISTENER_INCREMENT_SUCCESS });
    } catch (error) {
      next(error);
    }
  }

  async uploadTracks(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.files || !("file" in req.files) || !("image" in req.files)) {
        throw new AppError(MESSAGES.SONG_AND_IMAGE_REQUIRED, HttpStatus.BAD_REQUEST);
      }

      const { songName, artist, genre, albumId } = req.body;
      const songFile = (req.files as { [fieldname: string]: Express.Multer.File[] }).file[0];
      const imageFile = (req.files as { [fieldname: string]: Express.Multer.File[] }).image[0];

      const genreArray = genre ? genre.split(",").map((g: string) => g.trim()) : [];
      const artistArray = artist ? artist.split(",").map((g: string) => g.trim()) : [];

      const track = await this._artistnUseCase.trackUpload(songName, artistArray, genreArray, albumId, songFile, imageFile);
      res.status(HttpStatus.CREATED).json({
        message: MESSAGES.TRACK_UPLOAD_SUCCESS,
        track,
      });
    } catch (error) {
      next(error);
    }
  }

  async allAlbums(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { artistId } = req.query;
      const data = await this._artistnUseCase.allAlbums(artistId as string);
      res.status(HttpStatus.OK).json({ message: MESSAGES.ALBUMS_FETCH_SUCCESS, data });
    } catch (error: unknown) {
      res.status(HttpStatus.NOT_FOUND).json({ message: (error as Error).message || MESSAGES.REFRESH_FAILED });
      next(error);
    }
  }

  async albumsongs(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { albumId } = req.query;
      const data = await this._artistnUseCase.albumsongs(albumId as string);
      res.status(HttpStatus.OK).json({ message: MESSAGES.ALBUM_SONGS_FETCH_SUCCESS, data });
    } catch (error: unknown) {
      res.status(HttpStatus.NOT_FOUND).json({ message: (error as Error).message || MESSAGES.REFRESH_FAILED });
      next(error);
    }
  }

  async uploadAlbums(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { artistId, name, description } = req.body;
      const songFile = (req.files as { [fieldname: string]: Express.Multer.File[] }).coverImage[0];
      const albums = await this._artistnUseCase.uploadAlbums(artistId as string, name, description, songFile);
      res.status(HttpStatus.CREATED).json({
        message: MESSAGES.ALBUMS_UPLOAD_SUCCESS,
        data: albums,
      });
    } catch (error: unknown) {
      res.status(HttpStatus.NOT_FOUND).json({ message: (error as Error).message || MESSAGES.REFRESH_FAILED });
      next(error);
    }
  }

  async statsOfArtist(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;
      const { userId } = req.query;
      const data = await this._artistnUseCase.statsOfArtist(userId as string, page, limit);
      res.status(HttpStatus.OK).json({ message: MESSAGES.ARTIST_STATS_FETCH_SUCCESS, data: data.data, pagination: data.pagination });
    } catch (error: unknown) {
      res.status(HttpStatus.NOT_FOUND).json({ message: (error as Error).message || MESSAGES.REFRESH_FAILED });
      next(error);
    }
  }

  async saveCard(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { artistId, paymentMethodId } = req.body;
      await this._artistnUseCase.saveCard(artistId, paymentMethodId);
      res.status(HttpStatus.OK).json({ success: true, message: MESSAGES.CARD_SAVE_SUCCESS });
    } catch (error: unknown) {
      res.status(HttpStatus.NOT_FOUND).json({ message: (error as Error).message || MESSAGES.REFRESH_FAILED });
      next(error);
    }
  }

  async checkcard(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId } = req.query;
      const data = await this._artistnUseCase.checkcard(userId as string);
      res.status(HttpStatus.OK).json({ message: MESSAGES.CARD_STATUS_FETCH_SUCCESS, data });
    } catch (error: unknown) {
      res.status(HttpStatus.NOT_FOUND).json({ message: (error as Error).message || MESSAGES.REFRESH_FAILED });
      next(error);
    }
  }

  async usernameUpdate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.query.id;
      const username = req.body.username;

      const data = await this._artistnUseCase.usernameUpdate(userId as string, username);
      res.status(HttpStatus.OK).json({ message: MESSAGES.USERNAME_UPDATE_SUCCESS, data });
    } catch (error: unknown) {
      next(error);
    }
  }

  async getVerificationStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { artistId } = req.query;
    try {
      const verificationStatus = await this._artistnUseCase.getVerificationStatus(artistId as string);
      res.status(HttpStatus.OK).json({ success: true, message: MESSAGES.VERIFICATION_STATUS_FETCH_SUCCESS, data: verificationStatus });
    } catch (error: unknown) {
      res.status(HttpStatus.NOT_FOUND).json({ message: (error as Error).message || MESSAGES.REFRESH_FAILED });
    }
  }

  async requestVerification(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { artistId } = req.body;

    let imageFile: Express.Multer.File | undefined;

    if (req.files && !Array.isArray(req.files)) {
      const imageFiles = req.files["idProof"];
      imageFile = imageFiles?.[0];
    }
    try {
      if (!artistId || !imageFile) {
        throw new Error(MESSAGES.ARTIST_ID_OR_IMAGE_MISSING);
      }

      await this._artistnUseCase.requestVerification(artistId, imageFile);

      res.status(HttpStatus.OK).json({ success: true, message: MESSAGES.VERIFICATION_REQUEST_PROCESSED });
    } catch (error: unknown) {
      res.status(HttpStatus.NOT_FOUND).json({ success: false, message: (error as Error).message || MESSAGES.REFRESH_FAILED });
    }
  }
}