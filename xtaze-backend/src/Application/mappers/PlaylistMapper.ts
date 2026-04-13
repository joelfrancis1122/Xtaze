import { IPlaylist } from "../../domain/entities/IPlaylist";
import { PlaylistDTO } from "../dtos/PlaylistDTO";

export class PlaylistMapper {
  static toDTO(playlist: IPlaylist & { _id: any; createdAt?: Date; updatedAt?: Date }): PlaylistDTO {
    return {
      id: playlist._id,
      title: playlist.title,
      description: playlist.description,
      imageUrl: playlist.imageUrl,
      trackCount: playlist.trackCount ?? 0,
      createdBy: playlist.createdBy,
      tracks: playlist.tracks ?? [],
      createdAt: playlist.createdAt?.toISOString(),
      updatedAt: playlist.updatedAt?.toISOString(),
    };
  }

  static toDTOs(playlists: (IPlaylist & { _id: any; createdAt?: Date; updatedAt?: Date })[]): PlaylistDTO[] {
    return playlists.map(this.toDTO);
  }
}
