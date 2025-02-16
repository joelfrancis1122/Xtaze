import AdminRepository from "../../adapter/repositories/admin.repository"
import AdminUseCase from "../../usecases/admin.uscase"
import OtpService from "../service/otp.service"
import PasswordService from "../service/password.service"


const repository = {
    adminRepository: new AdminRepository()
}

const service = {
    passwordService:new PasswordService(),
    OtpService:new OtpService()
}

const useCase = {
    adminUseCase: new AdminUseCase({ repository, service })
}

const adminDependencies = useCase

export default adminDependencies