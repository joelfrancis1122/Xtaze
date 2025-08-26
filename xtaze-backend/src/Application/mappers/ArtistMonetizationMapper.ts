import { ArtistMonetization } from "../../domain/entities/IMonetization";
import { ArtistMonetizationDTO } from "../dtos/ArtistMonetizationDTO";

export class ArtistMonetizationMapper {
  static toDTO(data: ArtistMonetization): ArtistMonetizationDTO {
    return {
      trackName: data.trackName,
      totalPlays: data.totalPlays,
      monthlyPlays: data.monthlyPlays,
      lastUpdated: data.lastUpdated,
    };
  }

  static toDTOs(data: ArtistMonetization[]): ArtistMonetizationDTO[] {
    return data.map(this.toDTO);
  }
}
