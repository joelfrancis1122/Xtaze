export interface IAlbum {
  _id?:string;
  name: string;
  description?: string;
  coverImage?: string;
  artistId: string;
  tracks: string[]; 
}