import IUser from "../entities/IUser";

export default interface IuserUseCase{
    registerUser(username: string, country: string, gender: string, year: number, phone: number, email: string, password: string): Promise<IUser> 
    sendOTP(email: string): Promise<string>; 
    verifyOTP(otp:string):Promise<boolean>
    login(email: string, password: string): Promise<{ success: boolean; message: string; token?: string; user?: IUser }>;

}

