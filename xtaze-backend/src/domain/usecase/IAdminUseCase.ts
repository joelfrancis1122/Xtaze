import IUser from "../entities/IUser";

export default interface IAdminUseCase{
    login(email: string, password: string): Promise<{ success: boolean; message: string; token?: string; user?: IUser }>;
    toggleBlockUnblockArtist(id:string):Promise<IUser|null> 

}

