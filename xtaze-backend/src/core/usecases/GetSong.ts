import { SongRepository } from "../../infrastructure/repositories/SongRepository"
import { Song } from "../entities/Song"
export class GetSongUseCase {
  constructor(private songRepository: SongRepository) {}

  async execute(id: string): Promise<Song | null> {
    const songDocument = await this.songRepository.getSongById(id);
    if (!songDocument) return null;
    
    return new Song(
      songDocument._id.toString(),
      songDocument.title,
      songDocument.artist, 
      songDocument.audioUrl
    );
  }
}
