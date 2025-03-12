export interface IPlaylist {
    title: string;
    description: string;
    imageUrl?: string;
    trackCount?: number;
    createdBy: string; //User ID as string
    tracks?: string[];  //Array of Track IDs
  }
  