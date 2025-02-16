import { Request, Response } from "express";
import { UploadTrackUseCase } from "../../usecases/track.usecase";
import { TrackRepository } from "../repositories/track.repository";

const trackRepository = new TrackRepository();
const uploadTrackUseCase = new UploadTrackUseCase(trackRepository);

export const uploadTrack = async (req: Request, res: Response): Promise<void> => {
  if (!req.files || !("song" in req.files) || !("image" in req.files)) {
    res.status(400).json({ message: "Both song and image must be uploaded" });
    return;
  }

  const songFile = (req.files as { [fieldname: string]: Express.Multer.File[] }).song[0];
  const imageFile = (req.files as { [fieldname: string]: Express.Multer.File[] }).image[0];

  try {

    const track = await uploadTrackUseCase.execute({
      songFile,
      imageFile,
    });

    res.status(201).json({
      message: "Track uploaded successfully!",
      track,
    });
  } catch (error) {
    res.status(500).json({ message: "Error uploading track", error });
  }
};

export const getAllTracks = async (req: Request, res: Response): Promise<void> => {
  try {
    const tracks = await trackRepository.getAll();
    res.status(200).json(tracks);
  } catch (error) {
    res.status(500).json({ message: "Error fetching tracks", error });
  }
};
