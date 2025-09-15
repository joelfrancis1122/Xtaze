import { Request, Response } from "express";
import { HttpStatus } from "../../domain/constants/httpStatus";
import { FetchDeezerSongsUseCase } from "../../Application/usecases/deezer.usecase";
import { MESSAGES } from "../../domain/constants/messages";

export class DeezerController {
  private fetchDeezerSongsUseCase: FetchDeezerSongsUseCase;

  constructor(fetchDeezerSongsUseCase: FetchDeezerSongsUseCase) {
    this.fetchDeezerSongsUseCase = fetchDeezerSongsUseCase;
  }

  async getDeezerSongs(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.query.userId as string | undefined;
      const { songs, user } = await this.fetchDeezerSongsUseCase.execute(userId);

      if (songs.length === 0) {
        res.status(HttpStatus.NOT_FOUND).json({ error: MESSAGES.NO_SONG });
      } else {
        res.json({ success: true, songs, user });
      }
    } catch (error: unknown) {
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ error: MESSAGES.DEEZER_FAILED, details: (error as Error).message });
    }
  }
}
