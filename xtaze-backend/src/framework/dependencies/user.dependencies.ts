import UserRepository from "../../adapter/repositories/user.repository"
import UserUseCase from "../../usecases/user.usecase"
import OtpService from "../service/otp.service"
import PasswordService from "../service/password.service"


const repository = {
    userRepository: new UserRepository()
}

const service = {
    PasswordService:new PasswordService(),
    OtpService:new OtpService()
}

const useCase = {
    userUseCase: new UserUseCase({ repository, service })
}

const userDependencies = useCase

export default userDependencies