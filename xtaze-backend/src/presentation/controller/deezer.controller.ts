import { Request, Response } from "express";
import { HttpStatus } from "../../domain/constants/httpStatus";
import { MESSAGES } from "../../domain/constants/messages";
import { inject, injectable } from "inversify";
import TYPES from "../../domain/constants/types";
import { IDeezerUseCase } from "../../domain/usecase/IDeezerUsecase";

@injectable()
export class DeezerController {
  private deezerUseCase: IDeezerUseCase;

  constructor(@inject(TYPES.DeezerUseCase) deezerUseCase: IDeezerUseCase) {
    this.deezerUseCase = deezerUseCase;
  }

  async getDeezerSongs(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.query.userId as string | undefined;
      const { songs, user } = await this.deezerUseCase.execute(userId);

      if (songs.length === 0) {
        res.status(HttpStatus.NOT_FOUND).json({ error: MESSAGES.NO_SONG });
      } else {
        res.json({ success: true, songs, user });
      }
    } catch (error: unknown) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        error: MESSAGES.DEEZER_FAILED,
        details: (error as Error).message,
      });
    }
  }
}
