import { IGenreRepository } from "../../domain/repositories/IGenreRepository";
import GenreModel  from "../../adapter/db/models/GenreModel";
import { IGenre } from "../../domain/entities/IGenre";
import { log } from "console";

export class GenreRepository implements IGenreRepository {
  async createGenre(name: string): Promise<IGenre> {
    return await GenreModel.create({name})
  }

  async getAllGenres(): Promise<IGenre[]> {
    return await GenreModel.find().sort({ createdAt: -1 });
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

