import { IAlbum } from "../../domain/entities/IAlbum";
import { AlbumDTO } from "../dtos/AlbumDTO";

export class AlbumMapper {
  static toDTO(album: IAlbum): AlbumDTO {
    return {
      id: album._id!,
      name: album.name,
      description: album.description,
      coverImage: album.coverImage,
      artistId: album.artistId,
      tracks: album.tracks,
    };
  }

  static toDTOs(albums: IAlbum[]): AlbumDTO[] {
    return albums.map(this.toDTO);
  }
}
