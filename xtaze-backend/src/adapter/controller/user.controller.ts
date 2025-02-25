
import { NextFunction, Request, Response } from "express";
import IuserUseCase from "../../domain/usecase/IUserUseCase";
import { Track } from "../db/models/TrackModel";
import UserModel from "../db/models/UserModel";
// import { sendOTPService } from "../../framework/service/otp.service";
interface Dependencies {
  userUseCase: IuserUseCase
}

export default class UserController {
  private _userUseCase: IuserUseCase;

  constructor(dependencies: Dependencies) {
    this._userUseCase = dependencies.userUseCase
  }


  async sendOTP(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body;
      console.log(req.body, "itnaee body")
      const result = await this._userUseCase.sendOTP(email);
      console.log(result, "sss")
      if (Number(result) == 403) {
        res.status(403).json({ success: false, message: "email address exsists" })
        return
      }
      res.status(200).json({ success: true, message: "OTP sent successfully!", result });
    } catch (error) {
      next(error);
    }
  }

  async verifyOTP(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { otp } = req.body;
      console.log("body controller il vann 1", req.body)
      const response = await this._userUseCase.verifyOTP(otp);
      if (!response.success) {
        res.status(400).json(response);
        return;
      }
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  async registerUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { username, country, gender, year, phone, email, password } = req.body;
      console.log(req.body, "sss")
      const user = await this._userUseCase.registerUser(username, country, gender, year, phone, email, password)
      console.log("yeaeh  getin", user);

      res.status(201).json({ success: true, message: "User Register Successfully", data: user })
    } catch (error) {
      next(error)
    }
  }

  async loginUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;
      console.log("email", req.body)
      const response = await this._userUseCase.login(email, password);
      if (!response.success) {
        res.status(400).json(response);
        return
      }
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
  async googleLogin(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { token } = req.body;
    const Token = token
    try {
      const response = await this._userUseCase.googleLogin(Token);
      res.status(200).json(response);
    } catch (error) {
      console.error("Error with Google signup:", error);
      res.status(400).json({ success: false, message: "Google signup failed" });
    }
  }
  async checkUsername(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userName } = req.body;
      let username = userName
      const available = await this._userUseCase.checkUnique(username);
      console.log("Checking username:", username, "Available:", available);
      res.status(200).json({ available });
    } catch (error) {
      next(error);
    }
  }

  async uploadProfilepic(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      console.log("hey this is ")
      console.log(req.file)
      console.log(req.body.userId)

      const { userId } = req.body
      const file = req.file

      if (!userId || !file) {
        res.status(400).json({ success: false, message: "User ID and image are required" });
        return;
      }
      const result = await this._userUseCase.uploadProfile(userId, file);
      if (result?.success == true) {
        res.status(200).json(result)
      } else {
        res.status(400).json(result)
      }
    }
    catch (error) {
      next(error);
    }
  }
  async uploadBanner(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      console.log(" Received banner upload request");
      console.log("File:", req.file);
      console.log("User ID:", req.body.userId);

      const { userId } = req.body;
      const file = req.file;

      if (!userId || !file) {
        res.status(400).json({ success: false, message: "User ID and file are required" });
        return;
      }
      const isVideo = file.mimetype.startsWith("video/");
      console.log("Is this a video?", isVideo);
      const result = await this._userUseCase.uploadBanner(userId, file, isVideo);

      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error("error in uploadBanner:", error);
      next(error);
    }
  }

  async updateBio(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      console.log(req.body, "whats comming")

      const { userId, bio } = req.body

      if (!bio) {
        res.status(400).json({ success: false, message: "Bio required" });
        return;
      }


      const result = await this._userUseCase.updateBio(userId, bio);
      if (result?.success == true) {
        res.status(200).json(result)
      } else {
        res.status(400).json(result)

      }
    }
    catch (error) {
      next(error);
    }
  }

  async checkOut(req: Request, res: Response, next: NextFunction) {
    const { userId, priceId } = req.body;

    try {
      if (!userId || !priceId) {
        return res.status(400).json({ success: false, message: "User ID and Price ID are required" });
      }

      const session = await this._userUseCase.execute(userId, priceId);

      res.status(200).json({ success: true, sessionId: session?.id });
    } catch (error: any) {
      console.error("Error in checkOut:", error);
      res.status(500).json({ success: false, message: error.message || "Failed to create checkout session" });
    }
  }
  async toggleLike(req: Request, res: Response, next: NextFunction) {
    const { trackId} = req.body;
    const {userId} = req.query
    console.log(req.query)
    console.log(req.body,"asdas")
    try {   
      const user = await this._userUseCase.addToLiked(userId as string,trackId);
      res.status(200).json({ success: true, user:user });

    } catch (error: any) {
      console.error("Error in likedsongs:", error);
      res.status(500).json({ success: false, message: error.message || "sa" });
    }
  }
  async getliked(req: Request, res: Response, next: NextFunction) {
    try {
      const { songIds } = req.body;
      const userId = req.query.userId;
      
      console.log("0",songIds)
      if (!userId || !songIds || !Array.isArray(songIds)) {
       res.status(400).json({ success: false, message: 'Invalid request' });
      }
  
      // Fetch the user to verify (optional step)
      const user = await UserModel.findById(userId);
      if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      }
  
      // Fetch full track details based on songIds
      const tracks = await Track.find({ _id: { $in: songIds } });
  
      res.json({
        success: true,
        tracks,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  };

}
