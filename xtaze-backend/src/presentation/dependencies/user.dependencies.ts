import UserRepository from "../../infrastructure/repositories/user.repository"
import UserUseCase from "../../Application/usecases/user.usecase"
import EmailService from "../../infrastructure/service/email.service"
import OtpService from "../../infrastructure/service/otp.service"
import PasswordService from "../../infrastructure/service/password.service"


const repository = {
    userRepository: new UserRepository()  //  gives the mongoDB box(toy storage)
}

const service = {
    PasswordService:new PasswordService(), // makes paint brush 
    OtpService:new OtpService(), // makes another tool
    EmailService:new EmailService()
}

export const userCase = {
    userUseCase: new UserUseCase({ repository, service }) // makes a toy maker and giving the tools to him
}

const userDependencies = userCase //boss packing everything into toy bag (userDependencies)

export default userDependencies