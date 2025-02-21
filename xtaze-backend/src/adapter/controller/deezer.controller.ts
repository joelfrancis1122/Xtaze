import { Request, Response } from "express";
import { FetchDeezerSongsUseCase } from "../../usecases/deezer.usecase";
import UserRepository from "../repositories/user.repository";
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
      let userData = null; // Declare once
      if (userId) {
        userData = await userRepository.getUserUpdated(userId); // Assign value
      }
  
      if (songs.length === 0) {
        res.status(404).json({ error: "No songs found with previews" });
      } else {
        res.json({ songs,user:userData });
      }
    } catch (error: any) {
      console.error("Error fetching Deezer songs:", error.message);
      res.status(500).json({ error: "Failed to fetch songs from Deezer", details: error.message });
    }
  }
}
