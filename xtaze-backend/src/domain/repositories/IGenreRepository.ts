import { IGenre } from "../entities/IGenre";

export interface IGenreRepository {
  createGenre(name: string): Promise<IGenre>;
  getAllGenres(): Promise<IGenre[]>;
  getAllActiveGenres(): Promise<IGenre[]>;
  getGenreById(id: string): Promise<IGenre | null>;
  updateGenreStatus(id: string, status: boolean): Promise<IGenre|null>;
  editGenre(id: string,genre:string): Promise<IGenre|null>;
  findDupe(id: string,name:string): Promise<boolean>;

}
