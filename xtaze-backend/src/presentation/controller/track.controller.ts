import { Request, Response, NextFunction } from "express";
import { TrackRepository } from "../../infrastructure/repositories/track.repository";
import UserRepository from "../../infrastructure/repositories/user.repository";
import { UploadTrackUseCase } from "../../Application/usecases/track.usecase";
import { HttpStatus } from "../../domain/constants/httpStatus";
import AppError from "../../utils/AppError";
import { MESSAGES } from "../../domain/constants/messages";


const trackRepository = new TrackRepository();
const userRepository = new UserRepository();
const uploadTrackUseCase = new UploadTrackUseCase(trackRepository);

export const uploadTrack = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.files || !("song" in req.files) || !("image" in req.files)) {
      throw new AppError(MESSAGES.TRACK_UPLOAD_FILES_REQUIRED, HttpStatus.BAD_REQUEST);
    }

    const songFile = (req.files as { [fieldname: string]: Express.Multer.File[] }).song[0];
    const imageFile = (req.files as { [fieldname: string]: Express.Multer.File[] }).image[0];

    if (!songFile || !imageFile) {
      throw new AppError(MESSAGES.TRACK_UPLOAD_FILES_REQUIRED, HttpStatus.BAD_REQUEST);
    }

    const track = await uploadTrackUseCase.execute({
      songFile,
      imageFile,
    });

    res.status(HttpStatus.CREATED).json({
      message: MESSAGES.TRACK_UPLOAD_SUCCESS,
      track,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllTracks = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.query.userId as string;

    if (!userId) {
      throw new AppError(MESSAGES.USER_ID_REQUIRED, HttpStatus.BAD_REQUEST);
    }

    let userData = null;
    if (userId) {
      userData = await userRepository.getUserUpdated(userId);
      if (!userData) {
        throw new AppError(MESSAGES.USER_NOT_FOUND, HttpStatus.NOT_FOUND);
      }
    }

    const tracks = await trackRepository.getAll();
    if (!tracks || tracks.length === 0) {
      throw new AppError(MESSAGES.NO_TRACKS_FOUND, HttpStatus.NOT_FOUND);
    }

    res.status(HttpStatus.OK).json({
      success: true,
      message: MESSAGES.TRACKS_AND_USER_FETCH_SUCCESS,
      tracks,
      user: userData,
    });
  } catch (error) {
    next(error);
  }
};
