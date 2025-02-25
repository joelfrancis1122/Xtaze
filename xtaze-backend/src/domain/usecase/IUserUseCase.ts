import IUser from "../entities/IUser";

export default interface IuserUseCase{
    registerUser(username: string, country: string, gender: string, year: number, phone: number, email: string, password: string): Promise<IUser> 
    sendOTP(email: string): Promise<string>; 
    checkUnique(username: string): Promise<boolean>; 
    verifyOTP(otp:string):Promise<{success:boolean,message:string}>
    login(email: string, password: string): Promise<{ success: boolean; message: string; token?: string; user?: IUser }>;
    uploadProfile(userID:string,file:Express.Multer.File): Promise<{ success: boolean; message: string }>
    uploadBanner(userID:string,file:Express.Multer.File,isVideo:boolean): Promise<{ success: boolean; message: string }>
    updateBio(userID:string,bio:string): Promise<{ success: boolean; message: string }>
    getUpdatedArtist(artistId:string): Promise<IUser|null>
}

