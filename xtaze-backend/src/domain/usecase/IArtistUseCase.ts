import { ArtistMonetization, MusicMonetization } from "../entities/IMonetization";
import IUser from "../entities/IUser";
import { ITrack } from "../entities/ITrack";
import { IVerificationRequest } from "../entities/IVerificationRequest";
import { IVerificationStatusResponse } from "../entities/IVerificationStatusResponse ";
import { IAlbum } from "../entities/IAlbum";

export default interface IArtistUseCase {
    login(email: string, password: string): Promise<{ success: boolean; message: string; token?: string; ArefreshToken?: string; user?: IUser }>;
    refresh(refreshToken: string): Promise<{ success: boolean; message: string; token?: string; ArefreshToken?: string; user?: IUser | null }>;

    trackUpload(songName: string, artist: string[], genre: string[], album: string, songFile: Express.Multer.File, imageFile: Express.Multer.File): Promise<ITrack | null>;
    updateTrackByArtist(TrackId:string,songName: string, artist: string[], genre: string[], album: string, songFile?: Express.Multer.File, imageFile?: Express.Multer.File): Promise<ITrack | null>;

    allAlbums(userId:string): Promise<IAlbum[]|null>
    albumsongs(userId:string): Promise<IAlbum|null>
    uploadAlbums(artistId:string,name:string,description:string,image?:Express.Multer.File): Promise<IAlbum|null>

    listArtists(page: number,limit: number): Promise<{data:IUser[];pagination   :{total:number,page:number,limit:number,totalpages:number}}>
    listActiveArtists(page: number,limit: number): Promise<{data:IUser[];pagination   :{total:number,page:number,limit:number,totalpages:number}}>
    listArtistReleases(userId: string,page:number,limit:number): Promise<{data:ITrack[];pagination:{total:number,page:number,limit:number;totalPages:number}}>
    increment(trackId: string,id:string): Promise<ITrack | null>
    statsOfArtist(userId: string,page: number,limit: number): Promise<{data:ArtistMonetization[];   pagination: {total: number;page: number;limit: number;totalPages: number;};}>
    saveCard(artistId: string, paymentMethodId: string): Promise<IUser | null>;
    checkcard(artistId: string): Promise<IUser | null>;
    requestVerification(artistId:string,imageFile: Express.Multer.File): Promise<IVerificationStatusResponse|null>
    getVerificationStatus(artistId:string): Promise<IVerificationStatusResponse|null>
    usernameUpdate(userId:string,username:string): Promise<IUser|null>

}

