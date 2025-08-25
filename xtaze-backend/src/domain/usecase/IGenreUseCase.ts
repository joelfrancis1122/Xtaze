import { IGenre } from "../entities/IGenre";


export default interface IGenreUseCase {
listGenre(page: number,limit: number):Promise<{data: IGenre[];pagination: {total: number,page: number,limit: number,totalPages: number}}>;
listActiveGenres(): Promise<IGenre[]>
createGenre(name: string): Promise<{ success: boolean, message: string, genre?: IGenre }>
toggleBlockUnblockGenre(id: string): Promise<IGenre | null>;
editGenre(id: string, name: string): Promise<{ success: boolean, message: string, genre?: IGenre }>

}

