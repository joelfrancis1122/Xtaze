import { IGenreRepository } from "../../../domain/repositories/IGenreRepository";


export default interface IGenreDependencies{
    repository:{GenreRepository:IGenreRepository}
}