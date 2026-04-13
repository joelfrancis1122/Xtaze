import { IGenre } from "../entities/IGenre";

export interface IGenreRepository {
  createGenre(name: string): Promise<IGenre>;
  getAllGenres(page: number, limit: number): Promise<{ data: IGenre[]; total: number }>;
  getAllActiveGenres(): Promise<IGenre[]>;
  getGenreById(id: string): Promise<IGenre | null>;
  updateGenreStatus(id: string, status: boolean): Promise<IGenre | null>;
  editGenre(id: string, genre: string): Promise<IGenre | null>;
  findDupe(name: string): Promise<boolean>;

}
