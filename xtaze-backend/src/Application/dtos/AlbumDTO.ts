export interface AlbumDTO {
  id: string;
  name: string;
  description?: string;
  coverImage?: string;
  artistId: string;
  tracks: string[]; 
}
