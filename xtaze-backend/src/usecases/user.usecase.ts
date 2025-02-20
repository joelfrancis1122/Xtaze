import IUser from '../domain/entities/IUser';
import { IUserRepository } from '../domain/repositories/IUserRepository';
import IOtpService from '../domain/service/IOtpService';
import IPasswordService from '../domain/service/IPasswordService';
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { uploadProfileCloud } from '../framework/service/cloudinary.service';
dotenv.config();
interface useCaseDependencies {
  repository: {
    userRepository: IUserRepository
  },
  service: {
    PasswordService: IPasswordService,
    OtpService: IOtpService;
  }
}

export default class UserUseCase {
  private _userRepository: IUserRepository
  private _passwordService: IPasswordService
  private _otpService: IOtpService;

  constructor(dependencies: useCaseDependencies) {
    this._userRepository = dependencies.repository.userRepository
    this._passwordService = dependencies.service.PasswordService
    this._otpService = dependencies.service.OtpService;

  }

  async registerUser(username: string, country: string, gender: string, year: number, phone: number, email: string, password: string): Promise<IUser> {

    console.log("najjn vanneee vannee vanne ")
    const [existingUserByEmail] = await Promise.all([
      this._userRepository.findByEmail(email),
      // this._userRepository.findByPhone(phone)
    ]);

    if (existingUserByEmail) {
      console.log("lml");

      throw new Error("User already exists with this email");
    }

    // if (existingUserByPhone) {
    //   throw new Error("User already exists with this phone number");
    // }

    const hashedPassword = await this._passwordService.hashPassword(password);
    console.log(hashedPassword, "ith hahed an ee ");

    const user = { username, country, gender, year, phone, email, password: hashedPassword }

    const userData = await this._userRepository.add(user);

    console.log(userData, "userdata anee ");
    return userData;
  }

  async sendOTP(email: string): Promise<string> {

    const findEmail = await this._userRepository.findByEmail(email)

    if (findEmail) {
      console.log("lml");
      return "403"
    }

    return this._otpService.sendOTP(email);
  }

  async verifyOTP(otp: string): Promise<{ success: boolean; message: string }> {
    console.log("email ila ennn ariya otp enda", otp)
    const isStore = await this._otpService.isEmpty()
    if (isStore) {
      return { success: false, message: "This Otp is expired click the resend button" };
    }
    const data = await this._otpService.verifyOTP(otp);
    if (data) {
      return { success: true, message: "Otp verified successfully" };
    } else {
      return { success: false, message: "Invalid Otp" };
    }

  }



  async login(email: string, password: string): Promise<{ success: boolean; message: string; token?: string; user?: IUser }> {
    const user = await this._userRepository.findByEmail(email);
    if (!user) {
      return { success: false, message: "user not found" };
    }
    if (user.role == "admin") {
      return { success: false, message: "This login form is for users" };
    }
    if (user.isActive == false) {
      return { success: false, message: "You're account is suspended !" };
    }
    // Verify password
    const isPasswordValid = await this._passwordService.comparePassword(password, user.password);
    if (!isPasswordValid) {
      throw new Error("Invalid credentials!");
    }

    // Generate JWT Token
    const token = jwt.sign({ userId: user._id, email: user.email }, process.env.JWT_SECRET!, { expiresIn: "7d" });

    return {
      success: true,
      message: "Login successful!",
      token,
      user
    };
  }


  async uploadProfile(userId: string,file: Express.Multer.File): Promise<{ success: boolean; message: string ,user?:IUser}> {
    try {
      const cloudinaryResponse = await uploadProfileCloud(file);
  
      const profilePicUrl = cloudinaryResponse.secure_url;
  
      // Update the user profile with the new image URL
      const updatedUser = await this._userRepository.updateProfile(userId, profilePicUrl);
  
      if (!updatedUser) {
        return { success: false, message: "Failed to update profile" };
      }
  
      return { success: true, message: "Profile updated successfully" ,user:updatedUser};
    } catch (error) {
      console.error("Error during profile upload:", error);
      return { success: false, message: "An error occurred while updating the profile" };
    }

}

}

