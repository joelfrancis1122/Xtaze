export interface MusicMonetization {
  trackName: string;
  artistName: string;
  totalPlays: number;
  monthlyPlays: number; // Added for current month
  totalRevenue: number; // Lifetime revenue
  monthlyRevenue: number; // Current month revenue
  lastUpdated: string;
    
  }
export interface ArtistMonetization {
    trackName: string;
    totalPlays: number;
    monthlyPlays: number;
    lastUpdated: string;
  }