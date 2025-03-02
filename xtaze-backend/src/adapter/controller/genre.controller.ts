import { NextFunction, Request, Response } from "express";
import IGenreUseCase from "../../domain/usecase/IGenreUseCase";
import IuserUseCase from "../../domain/usecase/IUserUseCase";
import AppError from "../../utils/AppError";


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
      res.status(200).json({ success: true, message: "List Of Genre", data: listGenre });
    } catch (error) {
      next(error);
    }
  }

  async listActiveGenres(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const listActiveGenres = await this._genreUseCase.listActiveGenres();
      const artistId = req.query.artistId as string;

      console.log(artistId, req.query, "Artist ID received");

      let artist = null;
      if (artistId) {
        artist = await this._userUseCase.getUpdatedArtist(artistId);
      }

      res.status(200).json({
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

      console.log("📌 Incoming request to create genre:", name);

      const genre = await this._genreUseCase.createGenre(name);
      if (!genre.success) {
        console.log("⚠️ Genre already exists, throwing error.");
        throw new AppError(genre.message || "Failed to create genre", 400); // Use message from use case
      }

      console.log("✅ Genre successfully created:", genre.genre);
      res.status(201).json({ success: true, message: genre.message, data: genre.genre });
    } catch (error) {
      console.error("❌ Error in createGenre:", error);
      next(error);
    }
  }

  async toggleBlockUnblockGenre(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      console.log("id kitty ", id);

      const updatedGenre = await this._genreUseCase.toggleBlockUnblockGenre(id);
      res.status(200).json({ success: true, message: "Genre status updated", data: updatedGenre });
    } catch (error) {
      next(error);
    }
  }

  async editGenre(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { name } = req.body;

      const editedGenre = await this._genreUseCase.editGenre(id, name);
      console.log(id, "this is the edit id");

      if (typeof editedGenre === "string") {
        throw new AppError(editedGenre, 400); // Use message from use case
      }

      res.status(200).json({ success: true, message: "Genre status updated", data: editedGenre });
    } catch (error) {
      console.log(error);
      next(error); 
    }
  }
}