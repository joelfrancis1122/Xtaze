import { IAdminRepository } from "../domain/repositories/IAdminRepository";
import IPasswordService from "../domain/service/IPasswordService"

import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import IUser from "../domain/entities/IUser";
import { uploadImageToCloud, uploadProfileCloud } from "../framework/service/cloudinary.service";
import { IBanner } from "../domain/entities/IBanner";
dotenv.config();

interface useCaseDependencies {
  repository: {
    adminRepository: IAdminRepository
  },
  service: {
    passwordService: IPasswordService
  }
}

export default class AdminUseCase {
  private _adminRepository: IAdminRepository
  private _passwordService: IPasswordService

  constructor(dependencies: useCaseDependencies) {
    this._adminRepository = dependencies.repository.adminRepository
    this._passwordService = dependencies.service.passwordService
  }

  async login(email: string, password: string): Promise<{ success: boolean; message: string; token?: string; admin?: IUser }> {
    const admin = await this._adminRepository.findByEmail(email);
    console.log("thisi is admin broo", admin)
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
    const token = jwt.sign({ userId: admin._id, email: admin.email, role: "admin" }, process.env.JWT_SECRET!, { expiresIn: "7d" });

    return {
      success: true,
      message: "Login successful!",
      token,
      admin
    };
  }

  async toggleBlockUnblockArtist(id: string): Promise<IUser | null> {
    console.log("Artist coming to the toggle");
    const artist = await this._adminRepository.getArtistById(id);
    console.log("kittiyo", artist)
    if (!artist) {
      throw new Error("Artist not found");
    }
    const newStatus = !artist.isActive;
    console.log(newStatus, "new status");

    return await this._adminRepository.updateArtistStatus(id, newStatus);
  }

  async addBanner(title: string, description: string, action: string, isActive: boolean, createdBy: string, file: Express.Multer.File) {

    const addBanner = await this._adminRepository.createBanner(title, description, action, isActive, createdBy, file)
    return addBanner;

  }
  async getAllBanners(): Promise<IBanner[] | null> {
    const banners = await this._adminRepository.findAll()
    return banners;

  }
  async deleteBanner(id:string): Promise<IBanner | null> {
    const banners = await this._adminRepository.findBanner(id)
    return banners;

  }
  async updateBanner(id:string,title:string,description:string,action:string,isActive:boolean,file:Express.Multer.File): Promise<IBanner | null> {
    const banners = await this._adminRepository.findBannerforUpdate(id,title,description,action,isActive,file)
    return banners;

  }


}