import { injectable, inject } from "inversify";
import IUser from "../../domain/entities/IUser";
import { IDeezerRepository } from "../../domain/repositories/IDeezerRepository";
import { UserMapper } from "../mappers/UserMapper";
import TYPES from "../../domain/constants/types";
import { IDeezerUseCase } from "../../domain/usecase/IDeezerUsecase";

@injectable()
export class FetchDeezerSongsUseCase implements IDeezerUseCase {
  private deezerRepository: IDeezerRepository;

  constructor(
    @inject(TYPES.DeezerRepository) deezerRepository: IDeezerRepository
  ) {
    this.deezerRepository = deezerRepository;
  }

  async execute(userId?: string): Promise<{
    songs: { title: string; artist: string; fileUrl: string | null; img: string }[];
    user: any | null;
  }> {
    const tracks = await this.deezerRepository.fetchSongs();

    const songs = tracks.map((track) => ({
      title: track.title,
      artist: track.artist.name,
      fileUrl: track.preview,
      img: track.album.cover_medium,
    }));

    let user: IUser | null = null;
    if (userId) {
      user = await this.deezerRepository.getUserUpdated(userId);
    }

    return {
      songs,
      user: user ? UserMapper.toDTO(user) : null,
    };
  }
}
