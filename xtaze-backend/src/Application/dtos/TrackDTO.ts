export interface TrackDTO {
  id: string;
  title: string;
  genre: string[];
  albumId: string;
  fileUrl?: string;
  img?: string;
  createdAt?: Date;
  artists: string[];
  listeners: string[];  
  playHistory?: any[];
}
