import { Request, Response } from "express";
import { HttpStatus } from "../../domain/constants/httpStatus";
import { FetchDeezerSongsUseCase } from "../../Application/usecases/deezer.usecase";
import UserRepository from "../../infrastructure/repositories/user.repository";
import { MESSAGES } from "../../domain/constants/messages";
const userRepository = new UserRepository();
export class DeezerController {
  private fetchDeezerSongsUseCase: FetchDeezerSongsUseCase;

  constructor(fetchDeezerSongsUseCase: FetchDeezerSongsUseCase) {
    this.fetchDeezerSongsUseCase = fetchDeezerSongsUseCase;
  }

  async getDeezerSongs(req: Request, res: Response): Promise<void> {
    try {
      const songs = await this.fetchDeezerSongsUseCase.execute();
      const userId = req.query.userId as string;
      let userData   = null;
      if (userId) {
        userData = await userRepository.getUserUpdated(userId);
      }

      if (songs.length === 0) {
        res.status(HttpStatus.NOT_FOUND).json({ error: MESSAGES.NO_SONG });
      } else {
        res.json({ success: true, songs, user: userData });
      }
    } catch (error: unknown) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: MESSAGES.DEEZER_FAILED, details: (error as Error).message });
    }
  }
}
