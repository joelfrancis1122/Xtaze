
import { NextFunction, Request, Response } from "express";
import IuserUseCase from "../../domain/usecase/IUserUseCase";
// import { sendOTPService } from "../../framework/service/otp.service";

interface Dependencies {
  userUseCase: IuserUseCase
}

export default class UserController {
  private _userUseCase: IuserUseCase
  constructor(dependencies: Dependencies) {
    this._userUseCase = dependencies.userUseCase
  }


  async sendOTP(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body;
      console.log(req.body,"itnaee body")
      const result = await this._userUseCase.sendOTP(email);
      console.log(result,"sss")
      if(Number(result)==403){
       res.status(403).json({success:false,message:"email exsists"})
       return
      }
      res.status(200).json({ success: true, message: "OTP sent successfully!", result });
    } catch (error) {
      next(error);
    }
  }

  async verifyOTP(req: Request, res: Response, next: NextFunction): Promise<void> {
    try { 
      const {otp } = req.body;
      console.log("body controller il vann 1",req.body)
      const isValid = await this._userUseCase.verifyOTP( otp);
      if (!isValid) {
        res.status(400).json({ success: false, message: "Invalid OTP" });
        return;
      }

      res.status(200).json({ success: true, message: "OTP verified successfully" });
    } catch (error) {
      next(error);
    }
  }

  async registerUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { username, country, gender, year, phone, email, password } = req.body;
      console.log(req.body,"sss")
      const user = await this._userUseCase.registerUser(username, country, gender, year, phone, email, password)
      console.log("yeaeh  getin",user);
      
      res.status(201).json({ success: true, message: "User Register Successfully", data: user })
    } catch (error) {
      next(error)
    }
  }

  async loginUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;
      console.log("email",req.body)
      const response = await this._userUseCase.login(email, password);
      if (!response.success) {
        res.status(400).json(response);  // Send error response with message
        return 
    }
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
  
}

