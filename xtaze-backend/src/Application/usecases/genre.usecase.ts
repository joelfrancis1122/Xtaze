import { injectable, inject } from "inversify";
import { MESSAGES } from "../../domain/constants/messages";
import { IGenreRepository } from "../../domain/repositories/IGenreRepository";
import TYPES from "../../domain/constants/types";
import { GenreMapper } from "../mappers/GenreMapper";
import { GenreDTO } from "../dtos/GenreDTO";

@injectable()
export class GenreUseCase {
  private _genreRepository: IGenreRepository;

  constructor(
    @inject(TYPES.GenreRepository) genreRepository: IGenreRepository
  ) {
    this._genreRepository = genreRepository;
  }

  async listGenre(page: number, limit: number) {
    const { data, total } = await this._genreRepository.getAllGenres(page, limit);
    return {
      data: GenreMapper.toDTOs(data),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async listActiveGenres(): Promise<GenreDTO[]> {
    const genres = await this._genreRepository.getAllActiveGenres();
    return GenreMapper.toDTOs(genres);
  }

  async createGenre(name: string) {
    const dupe = await this._genreRepository.findDupe(name);
    if (dupe) {
      return { success: false, message: MESSAGES.GENRE_EXISTS };
    }

    const genre = await this._genreRepository.createGenre(name);
    return { success: true, message: MESSAGES.GENRE_SUCCESS, genre: GenreMapper.toDTO(genre) };
  }

  async toggleBlockUnblockGenre(id: string) {
    const genre = await this._genreRepository.getGenreById(id);
    if (!genre) {
      throw new Error(MESSAGES.GENRE_NOTFOUND);
    }

    const newStatus = !genre.isBlocked;
    const updatedGenre = await this._genreRepository.updateGenreStatus(id, newStatus);
    return updatedGenre ? GenreMapper.toDTO(updatedGenre) : null;
  }

  async editGenre(id: string, name: string) {
    const dupe = await this._genreRepository.findDupe(name);
    if (dupe) {
      return { success: false, message: MESSAGES.GENRE_EXISTS };
    }

    const updatedGenre = await this._genreRepository.editGenre(id, name);

    if (!updatedGenre) {
      return { success: false, message: MESSAGES.GENRE_NOTFOUND };
    }

    return {
      success: true,
      message: MESSAGES.GENRE_UPDATE,
      genre: GenreMapper.toDTO(updatedGenre),
    };
  }

}
