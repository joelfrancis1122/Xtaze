import { ITrack } from "../entities/ITrack";
import IUser from "../entities/IUser";

export default interface IArtistUseCase{
    login(email: string, password: string): Promise<{ success: boolean; message: string; token?: string; user?: IUser }>;
    trackUpload(songName:string,artist:string[],genre:string[],album:string,songFile:Express.Multer.File,imageFile:Express.Multer.File): Promise<ITrack|null>;
    listArtists():Promise<IUser[]> 
    listArtistReleases(userId:string):Promise<ITrack[]>
    increment(trackId:string):Promise<ITrack|null>
    // toggleBlockUnblockArtist(id:string):Promise<IUser|null> 

}

