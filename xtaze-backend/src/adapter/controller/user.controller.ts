import { NextFunction, Request, Response } from "express";
import IuserUseCase from "../../domain/usecase/IUserUseCase";
import { Track } from "../db/models/TrackModel";
import UserModel from "../db/models/UserModel";
import AppError from "../../utils/AppError";


interface Dependencies {
  userUseCase: IuserUseCase; 
}

export default class UserController { 
  private _userUseCase: IuserUseCase;  // space for toy maker 

  constructor(dependencies: Dependencies) { // boss gives the toy maker here 
    this._userUseCase = dependencies.userUseCase; //gets toy maker
  }




  async sendOTP(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body;
      if (!email) throw new AppError("Email is required", 400);

      console.log(req.body, "Request body");
      const result = await this._userUseCase.sendOTP(email);
      console.log(result, "Result");

      if (Number(result) === 403) {
        throw new AppError("Email address already exists", 403);
      }

      res.status(200).json({ success: true, message: "OTP sent successfully!", result });
    } catch (error) {
      next(error);
    }
  }

  async verifyOTP(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { otp } = req.body;
      if (!otp) throw new AppError("OTP is required", 400);

      console.log("Body received in controller:", req.body);
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
      if (!username || !email || !password) {
        throw new AppError("Username, email, and password are required", 400);
      }

      console.log(req.body, "Register body");
      const user = await this._userUseCase.registerUser(username, country, gender, year, phone, email, password);
      console.log("User registered:", user);

      res.status(201).json({ success: true, message: "User registered successfully", data: user });
    } catch (error) {
      next(error);
    }
  }

  async loginUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;
      if (!email || !password) throw new AppError("Email and password are required", 400);

      console.log("Login body:", req.body);
      const response = await this._userUseCase.login(email, password);

      if (!response.success) {
        res.status(400).json(response);
        return;
      }
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  async googleLogin(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { token } = req.body;
      if (!token) throw new AppError("Google token is required", 400);

      const response = await this._userUseCase.googleLogin(token);
      res.status(200).json(response);
    } catch (error) {
      console.error("Error with Google signup:", error);
      next(error);
    }
  }

  async checkUsername(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userName } = req.body;
      if (!userName) throw new AppError("Username is required", 400);

      const available = await this._userUseCase.checkUnique(userName);
      console.log("Checking username:", userName, "Available:", available);

      res.status(200).json({ available });
    } catch (error) {
      next(error);
    }
  }

  async uploadProfilepic(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId } = req.body;
      const file = req.file;

      console.log("Profile pic upload:", { file, userId });

      if (!userId || !file) {
        throw new AppError("User ID and image are required", 400);
      }

      const result = await this._userUseCase.uploadProfile(userId, file);
      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      next(error);
    }
  }

  async uploadBanner(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId } = req.body;
      const file = req.file;

      console.log("Banner upload request:", { file, userId });

      if (!userId || !file) {
        throw new AppError("User ID and file are required", 400);
      }

      const isVideo = file.mimetype.startsWith("video/");
      const result = await this._userUseCase.uploadBanner(userId, file, isVideo);

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      console.error("Error in uploadBanner:", error);
      next(error);
    }
  }

  async updateBio(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId, bio } = req.body;

      console.log("Update bio request:", req.body);

      if (!userId || !bio) {
        throw new AppError("User ID and bio are required", 400);
      }

      const result = await this._userUseCase.updateBio(userId, bio);
      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      next(error);
    }
  }

  async checkOut(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId, priceId } = req.body;

      if (!userId || !priceId) {
        throw new AppError("User ID and Price ID are required", 400);
      }

      const session = await this._userUseCase.execute(userId, priceId);
      res.status(200).json({ success: true, sessionId: session?.id });
    } catch (error) {
      next(error);
    }
  }

  async toggleLike(req: Request, res: Response, next: NextFunction) {
    try {
      const { trackId } = req.body;
      const { userId } = req.query;

      console.log("Toggle like request:", { query: req.query, body: req.body });

      if (!userId || !trackId) {
        throw new AppError("User ID and Track ID are required", 400);
      }

      const user = await this._userUseCase.addToLiked(userId as string, trackId);
      res.status(200).json({ success: true, user });
    } catch (error) {
      console.error("Error in toggleLike:", error);
      next(error);
    }
  }

  async getliked(req: Request, res: Response, next: NextFunction) {
    try {
      const { songIds } = req.body;
      const userId = req.query.userId as string;

      console.log("Get liked songs:", songIds);

      if (!userId || !songIds || !Array.isArray(songIds)) {
        throw new AppError("Invalid request: User ID and songIds array are required", 400);
      }

      const user = await UserModel.findById(userId);
      if (!user) {
        throw new AppError("User not found", 404);
      }

      const tracks = await Track.find({ _id: { $in: songIds } });
      res.json({ success: true, tracks });
    } catch (error) {
      console.error("Error in getliked:", error);
      next(error);
    }
  }
}