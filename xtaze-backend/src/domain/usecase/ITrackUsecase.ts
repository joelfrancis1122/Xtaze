
import { ITrack } from "../entities/ITrack";

export default interface ITrackUseCase {
  uploadTrack(songFile: Express.Multer.File, imageFile: Express.Multer.File): Promise<ITrack>;
  getAllTracks(): Promise<ITrack[] | null>;
}
