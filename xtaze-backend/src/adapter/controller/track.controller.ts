import { Request, Response, NextFunction } from "express";
import { UploadTrackUseCase } from "../../usecases/track.usecase";
import { TrackRepository } from "../repositories/track.repository";
import UserRepository from "../repositories/user.repository";
import AppError from "../../utils/AppError";




const trackRepository = new TrackRepository();
const userRepository = new UserRepository();
const uploadTrackUseCase = new UploadTrackUseCase(trackRepository);

export const uploadTrack = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.files || !("song" in req.files) || !("image" in req.files)) {
      throw new AppError("Both song and image files must be uploaded", 400);
    }

    const songFile = (req.files as { [fieldname: string]: Express.Multer.File[] }).song[0];
    const imageFile = (req.files as { [fieldname: string]: Express.Multer.File[] }).image[0];

    if (!songFile || !imageFile) {
      throw new AppError("Song and image files are required", 400);
    }

    const track = await uploadTrackUseCase.execute({
      songFile,
      imageFile,
    });

    res.status(201).json({
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
      throw new AppError("User ID is required", 400); 
    }

    console.log(userId, "crocodile");

    let userData = null;
    if (userId) {
      userData = await userRepository.getUserUpdated(userId);
      if (!userData) {
        throw new AppError("User not found", 404);
      }
    }

    const tracks = await trackRepository.getAll();
    if (!tracks || tracks.length === 0) {
      throw new AppError("No tracks found", 404); 
    }

    res.status(200).json({
      success: true,
      message: "Tracks and user data fetched successfully",
      tracks,
      user: userData,
    });
  } catch (error) {
    next(error); 
  }
};