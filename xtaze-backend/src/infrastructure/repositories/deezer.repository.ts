import axios from "axios";
import { DeezerTrack, IDeezerRepository } from "../../domain/repositories/IDeezerRepository";
import { BaseRepository } from "./BaseRepository";

const DEEZER_PLAYLIST_API = "https://api.deezer.com/playlist/1313621735/tracks";
const LIMIT = 100;

export class DeezerRepository implements IDeezerRepository {

  async fetchSongs(): Promise<DeezerTrack[]> {
    try {
      const allSongs: DeezerTrack[] = [];
      let currentUrl = `${DEEZER_PLAYLIST_API}?limit=${LIMIT}`;

      while (allSongs.length < LIMIT && currentUrl) {
        const response = await axios.get<{ data: DeezerTrack[]; next?: string }>(currentUrl);
        allSongs.push(...response.data.data);
        currentUrl = response.data.next || "";
      }

      return allSongs.slice(0, LIMIT);
    } catch (error) {
      console.error("Error fetching Deezer songs:", error);
      throw new Error("Failed to fetch Deezer songs");
    }
  }
}
