export interface IPlaylist {
  _id:string
    title: string;
    description: string;
    imageUrl?: string;
    trackCount?: number;
    createdBy: string; 
    tracks?: string[];  
  }
  