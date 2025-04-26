import { ArtistMonetization, MusicMonetization } from "../entities/IMonetization";
import IUser from "../entities/IUser";
import { ITrack } from "../entities/ITrack";
import { IVerificationRequest } from "../entities/IVeridicationRequest";
import { IVerificationStatusResponse } from "../entities/IVerificationStatusResponse ";

export default interface IArtistUseCase {
    login(email: string, password: string): Promise<{ success: boolean; message: string; token?: string; ArefreshToken?: string; user?: IUser }>;
    refresh(refreshToken: string): Promise<{ success: boolean; message: string; token?: string; ArefreshToken?: string; user?: IUser | null }>;

    trackUpload(songName: string, artist: string[], genre: string[], album: string, songFile: Express.Multer.File, imageFile: Express.Multer.File): Promise<ITrack | null>;
    updateTrackByArtist(TrackId:string,songName: string, artist: string[], genre: string[], album: string, songFile?: Express.Multer.File, imageFile?: Express.Multer.File): Promise<ITrack | null>;

    listArtists(): Promise<IUser[]>
    listArtistReleases(userId: string): Promise<ITrack[]>
    increment(trackId: string,id:string): Promise<ITrack | null>
    statsOfArtist(userId: string): Promise<ArtistMonetization[]>
    saveCard(artistId: string, paymentMethodId: string): Promise<IUser | null>;
    checkcard(artistId: string): Promise<IUser | null>;
    requestVerification(artistId:string,imageFile: Express.Multer.File): Promise<IVerificationStatusResponse|null>
    getVerificationStatus(artistId:string): Promise<IVerificationStatusResponse|null>
    usernameUpdate(userId:string,username:string): Promise<IUser|null>


}

