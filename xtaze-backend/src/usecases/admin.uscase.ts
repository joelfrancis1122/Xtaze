import { IAdminRepository } from "../domain/repositories/IAdminRepository";
import IPasswordService from "../domain/service/IPasswordService"

import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import IUser from "../domain/entities/IUser";
dotenv.config();

interface useCaseDependencies{
    repository:{
        adminRepository:IAdminRepository
    },
    service:{
        passwordService:IPasswordService
    }
}

export default class AdminUseCase{
    private _adminRepository:IAdminRepository
    private _passwordService:IPasswordService

    constructor(dependencies:useCaseDependencies){
        this._adminRepository=dependencies.repository.adminRepository
        this._passwordService=dependencies.service.passwordService
    }
    
    async login(email: string, password: string): Promise<{ success: boolean; message: string; token?: string; admin?: IUser }> {
        const admin = await this._adminRepository.findByEmail(email);
        console.log("thisi is admin broo",admin)
        if (!admin) {
            return { success: false, message: "User not found!" };
          }
          if (admin.role !== "admin") {
            return { success: false, message: "Only admins are allowed to login!" };
          } 
      
          const isPasswordValid = await this._passwordService.comparePassword(password, admin.password);
          if (!isPasswordValid) {
            return { success: false, message: "Invalid credentials!" };
          }
        const token = jwt.sign({ userId: admin._id, email: admin.email }, process.env.JWT_SECRET!, { expiresIn: "7d" });
      
        return {
          success: true,
          message: "Login successful!",
          token,
          admin
        };
      }
}