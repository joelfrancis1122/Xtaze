import IUser from "../entities/IUser";

export default interface IArtistUseCase{
    login(email: string, password: string): Promise<{ success: boolean; message: string; token?: string; user?: IUser }>;

}

