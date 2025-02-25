import { NextFunction, Request, Response } from "express";
import IGenreUseCase from "../../domain/usecase/IGenreUseCase";
import IuserUseCase from "../../domain/usecase/IUserUseCase";

interface Dependencies{
  GenreUseCase:IGenreUseCase,
  UserUseCase:IuserUseCase
}


export default class GenreController{
  private _genreUseCase:IGenreUseCase
  private _userUseCase:IuserUseCase
  constructor(dependencies:Dependencies){
    this._genreUseCase = dependencies.GenreUseCase
    this._userUseCase = dependencies.UserUseCase
  }

  async listGenre(req:Request,res:Response,next:NextFunction):Promise<void>{
    try{
      const listGenre = await this._genreUseCase.listGenre()
      res.status(200).json({success:true,message:"List Of Genre",data:listGenre})
    }catch(error){
      next(error)
    }
  }

  async listActiveGenres(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const listActiveGenres = await this._genreUseCase.listActiveGenres();
        const artistId = req.query.artistId as string;

        console.log(artistId, req.query,"Artist ID received");

        let artist = null;

        if (artistId) {
            artist = await this._userUseCase.getUpdatedArtist(artistId);
        }

        res.status(200).json({
            success: true,
            message: "List of Active Genres",
            data: listActiveGenres,
            artist: artist,
        });

    } catch (error) {
        next(error);
    }
}



async createGenre(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
      const { name } = req.body;

      console.log("📌 Incoming request to create genre:", name);

      const genre = await this._genreUseCase.createGenre(name);

      if (!genre.success) {
          console.log("⚠️ Genre already exists, returning 400.");
          res.status(400).json({ success: false, message: genre.message });
          return 
      }

      console.log("✅ Genre successfully created:", genre.genre);
      res.status(201).json({ success: true, message: genre.message, data: genre.genre  });
  } catch (error) {
      console.error("❌ Error in createGenre:", error);
      next(error); // Pass error to global error handler
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
      if (typeof editedGenre === "string") {
        res.status(400).json({ message: editedGenre });
        return 
      }
  
      res.status(200).json({ success: true, message: "Genre status updated", data: editedGenre });

    }catch(error){
      console.log(error)
    }
  }
  
}

