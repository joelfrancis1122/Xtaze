import { NextFunction, Request, Response } from "express";
import IGenreUseCase from "../../domain/usecase/IGenreUseCase";

interface Dependencies{
  GenreUseCase:IGenreUseCase
}


export default class GenreController{
  private _genreUseCase:IGenreUseCase
  constructor(dependencies:Dependencies){
    this._genreUseCase = dependencies.GenreUseCase
  }

  async listGenre(req:Request,res:Response,next:NextFunction):Promise<void>{
    try{
      const listGenre = await this._genreUseCase.listGenre()
      res.status(200).json({success:true,message:"List Of Genre",data:listGenre})
    }catch(error){
      next(error)
    }
  }


  async createGenre(req:Request,res:Response,next:NextFunction):Promise<void>{
    try{
      const {name} = req.body
      console.log("inside varuninnd",req.body)
      const genre = await this._genreUseCase.createGenre(name)
      res.status(201).json({success:true,message:"Genre Created Successfully",data:genre})
    }catch(error){
    console.log(error)
    }
  }

  async toggleBlockUnblockGenre(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      console.log("id kitty ",id)
      const updatedGenre = await this._genreUseCase.toggleBlockUnblockGenre(id);
      res.status(200).json({ success: true, message: "Genre status updated", data: updatedGenre });
    } catch (error) {
      next(error);
    }
  }

  async editGenre(req:Request,res:Response,next:NextFunction):Promise<void>{
    try{
      const {id} = req.params;
      const {name} = req.body;
      const editedGenre = await this._genreUseCase.editGenre(id,name);
      console.log(id,"this is the edit id")
      res.status(200).json({ success: true, message: "Genre status updated", data: editedGenre });

    }catch(error){
      console.log(error)
    }
  }
  
}

