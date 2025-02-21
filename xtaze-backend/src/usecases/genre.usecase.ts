import { IGenre } from "../domain/entities/IGenre";
import IGenreDependencies from "../domain/IDependencies/IGenreDependencies";
import { IGenreRepository } from "../domain/repositories/IGenreRepository";



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


  async createGenre(name: string): Promise<IGenre> {
    return await this._genreRepository.createGenre(name);
  }


  async toggleBlockUnblockGenre(id: string): Promise<IGenre | null> {
    console.log("genre comming to the toggle")
    const genre = await this._genreRepository.getGenreById(id);
    if (!genre) {
      throw new Error("Genre not found");
    }

    // const newStatus = genre.isBlocked==true ? false : true;
    const newStatus = !genre.isBlocked;
    console.log(newStatus, "povunu");
    return await this._genreRepository.updateGenreStatus(id, newStatus);
  }


  async editGenre(id: string, name: string): Promise<{ success: boolean, message: string, genre?: IGenre }> {
    console.log("Editing Genre:", id)
    const dupe = await this._genreRepository.findDupe(id, name)
    if (dupe) {
      return { success: false, message: "Genre exisists try another name!" }
    }
    const updatedGenre = await this._genreRepository.editGenre(id, name);
    return { success: true, message: "Genre updated Successfully!", genre: updatedGenre ?? undefined }

  }


}
