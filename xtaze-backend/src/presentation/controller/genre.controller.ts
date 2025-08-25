import { NextFunction, Request, Response } from "express";
import { HttpStatus } from "../../domain/constants/httpStatus";
import IGenreUseCase from "../../domain/usecase/IGenreUseCase";
import IuserUseCase from "../../domain/usecase/IUserUseCase";
import AppError from "../../utils/AppError";
import { MESSAGES } from "../../domain/constants/messages";
import { injectable } from "inversify";
import { inject } from "inversify";
import TYPES from "../../domain/constants/types";


// interface Dependencies {
//   GenreUseCase: IGenreUseCase;
//   UserUseCase: IuserUseCase;
// }

// export default class GenreController {
//   private _genreUseCase: IGenreUseCase;
//   private _userUseCase: IuserUseCase;

//   constructor(dependencies: Dependencies) {
//     this._genreUseCase = dependencies.GenreUseCase;
//     this._userUseCase = dependencies.UserUseCase;
//   }

  
@injectable()
export default class GenreController {
  private _genreUseCase: IGenreUseCase;
  private _userUseCase: IuserUseCase;

  constructor(
    @inject(TYPES.GenreUseCase) genreUseCase: IGenreUseCase,
    @inject(TYPES.UserUseCase) userUseCase: IuserUseCase
  ) {
    this._genreUseCase = genreUseCase;
    this._userUseCase = userUseCase;
  }
  async listGenre(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;

      const listGenre = await this._genreUseCase.listGenre(page, limit);
      res.status(HttpStatus.OK).json({ success: true, message: MESSAGES.GENRE_LIST, data: listGenre });
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
        message: MESSAGES.GENRE_LIST,
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
        throw new AppError(genre.message, HttpStatus.BAD_REQUEST); // Use message from use case
      }

      res.status(HttpStatus.CREATED).json({ success: true, message: genre.message, data: genre.genre });
    } catch (error) {
      next(error);
    }
  }

  async toggleBlockUnblockGenre(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      const updatedGenre = await this._genreUseCase.toggleBlockUnblockGenre(id);
      res.status(HttpStatus.OK).json({ success: true, message: MESSAGES.GENRE_UPDATE, data: updatedGenre });
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
        throw new AppError(editedGenre, HttpStatus.BAD_REQUEST);
      }

      res.status(HttpStatus.OK).json({ success: true, message: MESSAGES.GENRE_UPDATE, data: editedGenre });
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
}