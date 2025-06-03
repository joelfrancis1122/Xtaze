import { Request, Response, NextFunction } from "express";
import { UploadTrackUseCase } from "../../usecases/track.usecase";
import { TrackRepository } from "../repositories/track.repository";
import AppError from "../../utils/AppError";
import UserRepository from "../repositories/user.repository";
import { HttpStatus } from "../../domain/constants/httpStatus";




const trackRepository = new TrackRepository();
const userRepository = new UserRepository();
const uploadTrackUseCase = new UploadTrackUseCase(trackRepository);

export const uploadTrack = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.files || !("song" in req.files) || !("image" in req.files)) {
      throw new AppError("Both song and image files must be uploaded", HttpStatus.BAD_REQUEST);
    }

    const songFile = (req.files as { [fieldname: string]: Express.Multer.File[] }).song[0];
    const imageFile = (req.files as { [fieldname: string]: Express.Multer.File[] }).image[0];

    if (!songFile || !imageFile) {
      throw new AppError("Song and image files are required", HttpStatus.BAD_REQUEST);
    }

    const track = await uploadTrackUseCase.execute({
      songFile,
      imageFile,
    });

    res.status(HttpStatus.CREATED).json({
      message: "Track uploaded successfully!",
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
      throw new AppError("User ID is required", HttpStatus.BAD_REQUEST); 
    }

    let userData = null;
    if (userId) {
      userData = await userRepository.getUserUpdated(userId);
      if (!userData) {
        throw new AppError("User not found", HttpStatus.NOT_FOUND);
      }
    }

    const tracks = await trackRepository.getAll();
    if (!tracks || tracks.length === 0) {
      throw new AppError("No tracks found", HttpStatus.NOT_FOUND); 
    }
    res.status(HttpStatus.OK).json({
      success: true,
      message: "Tracks and user data fetched successfully",
      tracks,
      user: userData,
    });
  } catch (error) {
    next(error); 
  }
};