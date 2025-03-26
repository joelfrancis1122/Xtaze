export interface ITrack {
  id?: string;
  title: string;
  genre: string[];
  album: string;
  fileUrl: string;
  img: string;
  createdAt?: Date;
  listeners?: number;
  artists: string[];
  playHistory?: { month: string; plays: number }[];
}
