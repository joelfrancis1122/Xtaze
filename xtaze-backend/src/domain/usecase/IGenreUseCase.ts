import { IGenre } from "../entities/IGenre";


export default interface IGenreUseCase {
     listGenre(): Promise<IGenre[]> 
     listActiveGenres(): Promise<IGenre[]> 
     createGenre(name:string):Promise<{ success: boolean, message: string, genre?: IGenre }>
     toggleBlockUnblockGenre(id: string): Promise<IGenre|null>;
     editGenre(id:string,name:string):Promise<{ success: boolean, message: string, genre?: IGenre }>

}

