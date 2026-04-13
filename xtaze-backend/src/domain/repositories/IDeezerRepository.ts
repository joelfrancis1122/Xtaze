import IUser from "../entities/IUser";

export interface DeezerTrack{
    id:number;
    title:string;
    artist:{name:string};
    album:{cover_medium:string}
    preview:string|null
}

export interface IDeezerRepository {
    fetchSongs(): Promise<DeezerTrack[]>;
    getUserUpdated(userId: string): Promise<IUser | null>; 
  }