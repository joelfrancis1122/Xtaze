import { SetStateAction } from "react";
export interface IAlbum {
  songs: SetStateAction<[]>;
  _id: string;
  name: string;
  description?: string;
  coverImage?: string;
  artistId: string;
  tracks: ISong[];
}
export interface ISong {
  _id: string;
  title: string;
  artists: string[];
  genre: string[];
  img?: string;
  albumId?: string;
  fileUrl: string;
  listeners: string[];
}
