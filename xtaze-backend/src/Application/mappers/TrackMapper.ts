import { ITrack } from "../../domain/entities/ITrack";
import { TrackDTO } from "../dtos/TrackDTO";
export class TrackMapper {

static toDTO(track: ITrack): TrackDTO {
  return {
    id: track._id ? String(track._id) : "",
    title: track.title,
    genre: track.genre,
    albumId: track.albumId,
    fileUrl: track.fileUrl ?? "",
    img: track.img ?? "",
    createdAt: track.createdAt,
    artists: track.artists,
    listeners: track.listeners ?? [],
    playHistory: track.playHistory ?? [],
  };
}

  static toDTOs(tracks: ITrack[]): TrackDTO[] {
    return tracks.map(this.toDTO);
  }
}
