import { ITrackRepository } from "../../domain/repositories/ITrackRepository";
import { injectable, inject } from "inversify";
import TYPES from "../../domain/constants/types";
import ITrackUseCase from "../../domain/usecase/ITrackUsecase";
import { TrackDTO } from "../dtos/TrackDTO";
import { TrackMapper } from "../mappers/TrackMapper";
import { IUserRepository } from "../../domain/repositories/IUserRepository";
import { UserMapper } from "../mappers/UserMapper";
import { UserDTO } from "../dtos/UserDTO";

@injectable()
export class TrackUseCase implements ITrackUseCase {
  private _trackRepository: ITrackRepository;
  private _userRepository: IUserRepository

  constructor(
    @inject(TYPES.TrackRepository) trackRepository: ITrackRepository,
    @inject(TYPES.UserRepository) userRepository: IUserRepository
  ) {

    this._trackRepository = trackRepository;
    this._userRepository = userRepository
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

async getAllTracks(
  userId: string
): Promise<{ tracks: TrackDTO[]; userData: UserDTO | null }> {
  const tracks = await this._trackRepository.getAll()
  const user = userId ? await this._userRepository.findById(userId) : null;

  return {
    tracks: tracks ? TrackMapper.toDTOs(tracks) : [],
    userData: user ? UserMapper.toDTO(user) : null,
  };
}

}
