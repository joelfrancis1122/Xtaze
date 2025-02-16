import { IGenreRepository } from "../repositories/IGenreRepository";


export default interface IGenreDependencies{
    repository:{GenreRepository:IGenreRepository}
}