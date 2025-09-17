
import { TrackDTO } from "../../Application/dtos/TrackDTO";
import { UserDTO } from "../../Application/dtos/UserDTO";
import { ITrack } from "../entities/ITrack";

export default interface ITrackUseCase {
  uploadTrack(songFile: Express.Multer.File, imageFile: Express.Multer.File): Promise<ITrack>;
  getAllTracks(userId :string): Promise<{ tracks: TrackDTO[]; userData: UserDTO | null }>
}
