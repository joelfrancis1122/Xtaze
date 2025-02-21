import { GenreRepository } from "../../adapter/repositories/genre.repository";
import UserRepository from "../../adapter/repositories/user.repository";
import { GenreUseCase } from "../../usecases/genre.usecase";
import UserUseCase from "../../usecases/user.usecase";
import { userCase } from "./user.dependencies";


const repository={
    GenreRepository:new GenreRepository()


}

const repo = {
    UserRepository:new UserRepository()
}

const usecase={
    GenreUseCase:new GenreUseCase({repository}),
    UserUseCase:userCase.userUseCase
}

const genreDependencies=usecase
export default genreDependencies;