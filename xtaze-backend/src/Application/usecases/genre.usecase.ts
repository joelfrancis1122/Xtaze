
import { MESSAGES } from "../../domain/constants/messages";
import { IGenre } from "../../domain/entities/IGenre";
import { IGenreRepository } from "../../domain/repositories/IGenreRepository";
import IGenreDependencies from "../../infrastructure/repositories/IDependencies/IGenreDependencies";



export class GenreUseCase {

  private _genreRepository: IGenreRepository
  constructor(dependencies: IGenreDependencies) {
    this._genreRepository = dependencies.repository.GenreRepository

  }

  async listGenre(): Promise<IGenre[]> {
    return await this._genreRepository.getAllGenres() as IGenre[];
  }
  async listActiveGenres(): Promise<IGenre[]> {
    return await this._genreRepository.getAllActiveGenres() as IGenre[];
  }


  async createGenre(name: string): Promise<{ success: boolean, message: string, genre?: IGenre }> {
    const dupe = await this._genreRepository.findDupe(name);

    if (dupe) {
        return { success: false, message: MESSAGES.GENRE_EXISTS };
    }

    const data = await this._genreRepository.createGenre(name);

    return { success: true, message: MESSAGES.GENRE_SUCCESS, genre: data ?? undefined };
}



  async toggleBlockUnblockGenre(id: string): Promise<IGenre | null> {
    const genre = await this._genreRepository.getGenreById(id);
    if (!genre) {
      throw new Error(MESSAGES.GENRE_NOTFOUND);
    }

    // const newStatus = genre.isBlocked==true ? false : true;
    const newStatus = !genre.isBlocked;
    return await this._genreRepository.updateGenreStatus(id, newStatus);
  }


  async editGenre(id: string, name: string): Promise<{ success: boolean, message: string, genre?: IGenre }> {
    const dupe = await this._genreRepository.findDupe(name)
    if (dupe) {
      return { success: false, message: MESSAGES.GENRE_EXISTS }
    }
    const updatedGenre = await this._genreRepository.editGenre(id, name);
    return { success: true, message: MESSAGES.GENRE_UPDATE, genre: updatedGenre ?? undefined }

  }


}
