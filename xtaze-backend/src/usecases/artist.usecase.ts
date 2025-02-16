import IPasswordService from "../domain/service/IPasswordService"

import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import IUser from "../domain/entities/IUser";
import { IArtistRepository } from "../domain/repositories/IArtistRepository";
dotenv.config();

interface useCaseDependencies{
    repository:{
        artistRepository:IArtistRepository
    },
    service:{
        passwordService:IPasswordService
    }
}

export default class ArtistUseCase{
    private _artistRepository:IArtistRepository
    private _passwordService:IPasswordService

    constructor(dependencies:useCaseDependencies){
        this._artistRepository=dependencies.repository.artistRepository
        this._passwordService=dependencies.service.passwordService
    }
    
    async login(email: string, password: string): Promise<{ success: boolean; message: string; token?: string; artist?: IUser }> {
        const artist = await this._artistRepository.findByEmail(email);
        console.log("thisi is admin broo",artist)
        if (!artist) {
            return { success: false, message: "User not found!" };
          }
          // Check if the role is 'artist'
          if (artist.role !== "artist") {
            return { success: false, message: "Only artists are allowed to login!" };
          } 
      
          const isPasswordValid = await this._passwordService.comparePassword(password, artist.password);
          if (!isPasswordValid) {
            return { success: false, message: "Invalid credentials!" };
          }
        const token = jwt.sign({ userId: artist._id, email: artist.email }, process.env.JWT_SECRET!, { expiresIn: "7d" });
      
        return {
          success: true,
          message: "Login successful!",
          token,
          artist
        };
      }
}