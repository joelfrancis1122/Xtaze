import { NextFunction, Request, Response } from "express";
import IGenreUseCase from "../../domain/usecase/IGenreUseCase";
import IuserUseCase from "../../domain/usecase/IUserUseCase";
import AppError from "../../utils/AppError";
import { HttpStatus } from "../../domain/constants/httpStatus";


interface Dependencies {
  GenreUseCase: IGenreUseCase;
  UserUseCase: IuserUseCase;
}

export default class GenreController {
  private _genreUseCase: IGenreUseCase;
  private _userUseCase: IuserUseCase;

  constructor(dependencies: Dependencies) {
    this._genreUseCase = dependencies.GenreUseCase;
    this._userUseCase = dependencies.UserUseCase;
  }

  
  async listGenre(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const listGenre = await this._genreUseCase.listGenre();
      res.status(HttpStatus.OK).json({ success: true, message: "List Of Genre", data: listGenre });
    } catch (error) {
      next(error);
    }
  }

  async listActiveGenres(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const listActiveGenres = await this._genreUseCase.listActiveGenres();
      const artistId = req.query.artistId as string;


      let artist = null;
      if (artistId) {
        artist = await this._userUseCase.getUpdatedArtist(artistId);
      }

      res.status(HttpStatus.OK).json({
        success: true,
        message: "List of Active Genres",
        data: listActiveGenres,
        artist,
      });
    } catch (error) {
      next(error);
    }
  }

  async createGenre(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name } = req.body;


      const genre = await this._genreUseCase.createGenre(name);
      if (!genre.success) {
        console.log("⚠️ Genre already exists, throwing error.");
        throw new AppError(genre.message || "Failed to create genre", HttpStatus.BAD_REQUEST); // Use message from use case
      }

      res.status(HttpStatus.CREATED).json({ success: true, message: genre.message, data: genre.genre });
    } catch (error) {
      console.error("❌ Error in createGenre:", error);
      next(error);
    }
  }

  async toggleBlockUnblockGenre(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      const updatedGenre = await this._genreUseCase.toggleBlockUnblockGenre(id);
      res.status(HttpStatus.OK).json({ success: true, message: "Genre status updated", data: updatedGenre });
    } catch (error) {
      next(error);
    }
  }

  async editGenre(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { name } = req.body;

      const editedGenre = await this._genreUseCase.editGenre(id, name);

      if (typeof editedGenre === "string") {
        throw new AppError(editedGenre, HttpStatus.BAD_REQUEST); // Use message from use case
      }

      res.status(HttpStatus.OK).json({ success: true, message: "Genre status updated", data: editedGenre });
    } catch (error) {
      console.log(error);
      next(error); 
    }
  }
}