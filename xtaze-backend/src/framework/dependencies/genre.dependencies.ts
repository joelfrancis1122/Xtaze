// import { GenreRepository } from "../../adapter/repositories/genre.repository";
// import UserRepository from "../../adapter/repositories/user.repository";
// import { GenreUseCase } from "../../usecases/genre.usecase";
// import UserUseCase from "../../usecases/user.usecase";
// import { userCase } from "./user.dependencies";


// const repository={
//     GenreRepository:new GenreRepository()


// }

// const repo = {
//     UserRepository:new UserRepository()
// }

// const usecase={
//     GenreUseCase:new GenreUseCase({repository}),
//     UserUseCase:userCase.userUseCase
// }

// const genreDependencies=usecase
// export default genreDependencies;
import { GenreRepository } from "../../adapter/repositories/genre.repository";
import UserRepository from "../../adapter/repositories/user.repository";
import { GenreUseCase } from "../../usecases/genre.usecase";
import UserUseCase from "../../usecases/user.usecase";
import OtpService from "../service/otp.service";
import PasswordService from "../service/password.service";

const repository = {
    GenreRepository: new GenreRepository(),
    userRepository: new UserRepository()
};

const service = {
    PasswordService: new PasswordService(),
    OtpService: new OtpService()
};

const useCase = {
    GenreUseCase: new GenreUseCase({ repository }),
    UserUseCase: new UserUseCase({ repository, service })
};

const genreDependencies = useCase;
export default genreDependencies;