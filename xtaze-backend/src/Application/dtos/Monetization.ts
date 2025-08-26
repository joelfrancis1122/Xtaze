// export interface MonetizationDTO {
//   trackId: string;
//   trackName: string;
//   artistName: string;
//   totalListeners: number;
//   uniqueListeners: number;
//   totalPlays: number;
//   revenueGenerated: number;
// }
export interface MonetizationDTO {
  trackId: string;
  trackName: string;
  artistName: string;
  totalPlays: number;
  monthlyPlays: number;
  totalRevenue: number;
  monthlyRevenue: number;
  lastUpdated: string;
  paymentStatus: boolean;
}
