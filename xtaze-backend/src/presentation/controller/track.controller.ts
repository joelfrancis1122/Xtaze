// presentation/controllers/TrackController.ts
import { Request, Response, NextFunction } from "express";
import { injectable, inject } from "inversify";
import TYPES from "../../domain/constants/types";
import { HttpStatus } from "../../domain/constants/httpStatus";
import AppError from "../../utils/AppError";
import { MESSAGES } from "../../domain/constants/messages";
import ITrackUseCase from "../../domain/usecase/ITrackUsecase";

@injectable()
export default class TrackController {
  private _trackUseCase: ITrackUseCase;

  constructor(@inject(TYPES.TrackUseCase) trackUseCase: ITrackUseCase) {
    this._trackUseCase = trackUseCase;
  }

  async upload(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.files || !("song" in req.files) || !("image" in req.files)) {
        throw new AppError(MESSAGES.TRACK_UPLOAD_FILES_REQUIRED, HttpStatus.BAD_REQUEST);
      }

      const songFile = (req.files as { [fieldname: string]: Express.Multer.File[] }).song[0];
      const imageFile = (req.files as { [fieldname: string]: Express.Multer.File[] }).image[0];

      const track = await this._trackUseCase.uploadTrack(songFile, imageFile);

      res.status(HttpStatus.CREATED).json({
        message: MESSAGES.TRACK_UPLOAD_SUCCESS,
        track,
      });
    } catch (error) {
      next(error);
    }
  }

  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tracks = await this._trackUseCase.getAllTracks();
      if (!tracks || tracks.length === 0) {
        throw new AppError(MESSAGES.NO_TRACKS_FOUND, HttpStatus.NOT_FOUND);
      }

      res.status(HttpStatus.OK).json({
        success: true,
        message: MESSAGES.TRACKS_AND_USER_FETCH_SUCCESS,
        tracks,
      });
    } catch (error) {
      next(error);
    }
  }
}
