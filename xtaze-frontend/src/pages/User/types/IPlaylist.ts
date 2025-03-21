export interface Playlist {
  _id?: string | number;
    title: string;
    description: string;
    imageUrl: string|null;
    createdBy: string;
    tracks: string[]; 
  }