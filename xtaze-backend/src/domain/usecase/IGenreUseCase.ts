import { IGenre } from "../entities/IGenre";


export default interface IGenreUseCase {
     listGenre(): Promise<IGenre[]> 
     createGenre(name:string):Promise<IGenre>
     toggleBlockUnblockGenre(id: string): Promise<IGenre|null>;
     editGenre(id:string,name:string):Promise<{ success: boolean, message: string, genre?: IGenre }>

}

