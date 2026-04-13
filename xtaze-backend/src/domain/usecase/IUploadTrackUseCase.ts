import { ITrack } from "../entities/ITrack";
import { Express } from "express";

export interface IUploadTrackUseCase {
  execute(data: {title: string;genre: string[];album: string;artists: string[];songFile: Express.Multer.File;imageFile: Express.Multer.File;}): Promise<ITrack>;
}
