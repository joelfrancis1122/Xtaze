import { DeezerTrack, IDeezerRepository } from "../../domain/repositories/IDeezerRepository";

export class FetchDeezerSongsUseCase {
  private deezerRepository: IDeezerRepository;

  constructor(deezerRepository: IDeezerRepository) {
    this.deezerRepository = deezerRepository;
  }

  async execute(): Promise<{ title: string; artist: string; fileUrl: string | null; img: string }[]> {
    const tracks: DeezerTrack[] = await this.deezerRepository.fetchSongs();

    return tracks.map((track) => ({
      title: track.title,
      artist: track.artist.name,
      fileUrl: track.preview,
      img: track.album.cover_medium,
    }));
  }
}
