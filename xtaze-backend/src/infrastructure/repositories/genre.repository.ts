import { IGenreRepository } from "../../domain/repositories/IGenreRepository";
import { IGenre } from "../../domain/entities/IGenre";
import { BaseRepository } from "./BaseRepository";
import GenreModel from "../db/models/GenreModel";

// export class GenreRepository implements IGenreRepository {
export class GenreRepository extends BaseRepository<IGenre> implements IGenreRepository {
  constructor() {
    super(GenreModel); // attach GenreModel to base
  }
  
  async createGenre(name: string): Promise<IGenre> {
    return await GenreModel.create({name})
  }
async getAllGenres(page: number, limit: number): Promise<{ data: IGenre[]; total: number }> {
  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    GenreModel.find().sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    GenreModel.countDocuments(),
  ]);

  return { data, total };
}

  async getAllActiveGenres(): Promise<IGenre[]> {
    return await GenreModel.find({isBlocked:false}).sort({ createdAt: -1 });
  }

  async findGenreByName(name: string): Promise<IGenre | null> {
    return await GenreModel.findOne({ name });
  }


  async getGenreById(id: string): Promise<IGenre | null> {
    return await GenreModel.findById(id);
  }
  
  async updateGenreStatus(id: string, status: boolean): Promise<IGenre|null> {
    const cn =  await GenreModel.findByIdAndUpdate(id, { isBlocked:status}, { new: true });
    return cn
  }

  async editGenre(id: string, name: string): Promise<IGenre|null> {  
    const editedGenre = await GenreModel.findByIdAndUpdate(id,{name:name},{new:true})
    return editedGenre
  }
  
  async findDupe(name: string): Promise<boolean> {
    const existingGenre = await GenreModel.findOne({ name: name });
    if(existingGenre){
    return true
  }
  return false 
}

}

