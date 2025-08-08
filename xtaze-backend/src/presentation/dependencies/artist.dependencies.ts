import ArtistRepository from "../../infrastructure/repositories/artist.repository"
import UserRepository from "../../infrastructure/repositories/user.repository"
import ArtistUseCase from "../../Application/usecases/artist.usecase"
import OtpService from "../../infrastructure/service/otp.service"
import PasswordService from "../../infrastructure/service/password.service"


const repository = {
    artistRepository: new ArtistRepository(),
    userRepository: new UserRepository()
}

const service = {
    passwordService:new PasswordService(),
    OtpService:new OtpService()
}

const useCase = {
    artistUseCase: new ArtistUseCase({ repository, service })
}

const artistDependencies = useCase

export default artistDependencies