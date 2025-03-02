import UserRepository from "../../adapter/repositories/user.repository"
import UserUseCase from "../../usecases/user.usecase"
import OtpService from "../service/otp.service"
import PasswordService from "../service/password.service"


const repository = {
    userRepository: new UserRepository()  //  gives the mongoDB box(toy storage)
}

const service = {
    PasswordService:new PasswordService(), // makes paint brush 
    OtpService:new OtpService() // makes another tool
}

export const userCase = {
    userUseCase: new UserUseCase({ repository, service }) // makes a toy maker and giving the tools to him
}

const userDependencies = userCase //boss packing everything into toy bag (userDependencies)

export default userDependencies