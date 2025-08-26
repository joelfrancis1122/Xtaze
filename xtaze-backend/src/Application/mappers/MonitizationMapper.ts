import { MonetizationDTO } from "../dtos/Monetization";

export class MonetizationMapper {
  static toDTO(data: any): MonetizationDTO {
    return {
      trackId: data.trackId,
      trackName: data.trackName,
      artistName: data.artistName,
      totalPlays: data.totalPlays,
      monthlyPlays: data.monthlyPlays,
      totalRevenue: data.totalRevenue,
      monthlyRevenue: data.monthlyRevenue,
      lastUpdated: data.lastUpdated,
      paymentStatus: data.paymentStatus,
    };
  }

  static toDTOs(data: any[]): MonetizationDTO[] {
    return data.map((d) => this.toDTO(d));
  }
}
