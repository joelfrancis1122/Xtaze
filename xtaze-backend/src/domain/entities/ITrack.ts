export interface ITrack {
  _id?: string;   
  title: string;
  genre: string[];
  albumId: string;
  fileUrl?: string;
  img?: string;
  createdAt?: Date;
  listeners?: string[];
  artists: string[];
  playHistory?: { month: string; plays: number; paymentStatus?: boolean }[];
}
