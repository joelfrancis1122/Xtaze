import ArtistRepository from "../../adapter/repositories/artist.repository"
import ArtistUseCase from "../../usecases/artist.usecase"
import OtpService from "../service/otp.service"
import PasswordService from "../service/password.service"


const repository = {
    artistRepository: new ArtistRepository()
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