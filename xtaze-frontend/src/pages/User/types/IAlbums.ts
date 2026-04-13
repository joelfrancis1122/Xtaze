export interface IAlbum {
  id: string;
  name: string;
  description?: string;
  coverImage?: string;
  artistId: string;
  tracks: ISong[];
}
export interface ISong {
  playHistory: never[];
  id: string;
  title: string;
  artists: string[];
  genre: string[];
  img?: string;
  album?: IAlbum | null; 
  fileUrl: string;
  listeners: string[];
}
