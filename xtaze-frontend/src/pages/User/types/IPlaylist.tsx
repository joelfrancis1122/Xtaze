export interface Playlist {
    _id: string; 
    title: string;
    description: string;
    imageUrl: string|null;
    createdBy: string;
    tracks: string[]; 
  }