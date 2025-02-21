import IUser from "../entities/IUser";

export default interface IuserUseCase{
    registerUser(username: string, country: string, gender: string, year: number, phone: number, email: string, password: string): Promise<IUser> 
    sendOTP(email: string): Promise<string>; 
    verifyOTP(otp:string):Promise<{success:boolean,message:string}>
    login(email: string, password: string): Promise<{ success: boolean; message: string; token?: string; user?: IUser }>;
    uploadProfile(userID:string,file:Express.Multer.File): Promise<{ success: boolean; message: string }>
    getUpdatedArtist(artistId:string): Promise<IUser|null>
}

