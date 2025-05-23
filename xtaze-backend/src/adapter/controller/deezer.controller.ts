import { Request, Response } from "express";
import { FetchDeezerSongsUseCase } from "../../usecases/deezer.usecase";
import UserRepository from "../repositories/user.repository";
import { HttpStatus } from "../../domain/constants/httpStatus";
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
      console.log(userId,"odi")
      let userData = null; 
      if (userId) {
        userData = await userRepository.getUserUpdated(userId); 
      }
  
      if (songs.length === 0) {
        res.status(HttpStatus.NOT_FOUND).json({ error: "No songs found with previews" });
      } else {
        res.json({ songs,user:userData });
      }
    } catch (error: unknown) {
      console.error("Error fetching Deezer songs:", (error as Error).message);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: "Failed to fetch songs from Deezer", details: (error as Error).message });
    }
  }
}
