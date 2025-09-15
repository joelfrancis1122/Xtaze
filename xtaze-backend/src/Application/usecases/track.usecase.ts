import { ITrackRepository } from "../../domain/repositories/ITrackRepository";
import { injectable, inject } from "inversify";
import TYPES from "../../domain/constants/types";
import ITrackUseCase from "../../domain/usecase/ITrackUsecase";
import { TrackDTO } from "../dtos/TrackDTO";
import { TrackMapper } from "../mappers/TrackMapper";

@injectable()
export class TrackUseCase implements ITrackUseCase {
  private _trackRepository: ITrackRepository;

  constructor(@inject(TYPES.TrackRepository) trackRepository: ITrackRepository) {
    this._trackRepository = trackRepository;
  }

  async uploadTrack(songFile: Express.Multer.File, imageFile: Express.Multer.File): Promise<TrackDTO> {
    const track = {
      title: songFile.originalname,
      fileUrl: songFile.path,
      img: imageFile.path,
      genre: [],
      albumId: "",
      artists: [],
      listeners: [],
      playHistory: [],
      createdAt: new Date(),
    };

    const savedTrack = await this._trackRepository.save(track);
    return TrackMapper.toDTO(savedTrack);
  }

  async getAllTracks(): Promise<TrackDTO[] | null> {
    const tracks = await this._trackRepository.getAll();
    if (!tracks) return null;
    return TrackMapper.toDTOs(tracks);
  }
}
