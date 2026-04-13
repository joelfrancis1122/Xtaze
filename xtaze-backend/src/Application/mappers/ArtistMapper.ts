import { IArtist } from "../../domain/entities/IArtist";
import { ArtistDTO } from "../dtos/ArtistDTO";

export class ArtistMapper {
  static toDTO(artist: IArtist): ArtistDTO {
    return {
      id: artist._id!,
      username: artist.username,
      email: artist.email,
      role: artist.role,
      isActive: artist.isActive ?? true,
      profilePic: artist.profilePic,
      bio: artist.bio,
      banner: artist.banner,
      premium: artist.premium,
      paymentStatus: artist.paymentStatus,
      createdAt: artist.createdAt?.toISOString(),
      updatedAt: artist.updatedAt?.toISOString(),
    };
  }

  static toDTOs(artists: IArtist[]): ArtistDTO[] {
    return artists.map(this.toDTO);
  }
}
