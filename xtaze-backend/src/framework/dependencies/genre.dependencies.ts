import { GenreRepository } from "../../adapter/repositories/genre.repository";
import { GenreUseCase } from "../../usecases/genre.usecase";


const repository={
    GenreRepository:new GenreRepository()
}

const usecase={
    GenreUseCase:new GenreUseCase({repository})
}

const genreDependencies=usecase
export default genreDependencies;