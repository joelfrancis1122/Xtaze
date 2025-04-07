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
      console.log(response.token, "emt vannile");

      if (response.success && response.token && response.refreshToken) {
        console.log(response.token, "emt vannilessssssss");
        // Only set refreshToken in cookie
        res.cookie("refreshToken", response.refreshToken, {
          httpOnly: false, // for frontend access
          secure: true,
          sameSite: "none",
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });
        res.status(200).json({
          success: true,
          message: response.message,
          token: response.token, // Return access token in response
          user: response.user,
        });
      } else {
        res.status(400).json(response);
      }
    } catch (error) {
      next(error);
    }
  }

  async googleLogin(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { token } = req.body;
      if (!token) throw new AppError("Google token is required", 400);

      const response = await this._userUseCase.googleLogin(token);

      if (response.success && response.token && response.refreshToken) {
        // Only set refreshToken in cookie
        res.cookie("refreshToken", response.refreshToken, {
          httpOnly: false, // for frontend access
          secure: true,
          sameSite: "none",
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });
        res.status(200).json({
          success: true,
          message: response.message,
          token: response.token, // Return access token in response
          user: response.user,
        });
      } else {
        res.status(400).json(response);
      }
    } catch (error) {
      console.error("Error with Google signup:", error);
      next(error);
    }
  }

  async refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      console.log("Refresh token triggered");
      const refreshToken = req.cookies.refreshToken;
      console.log("Refresh token from cookie:", refreshToken);
  
      if (!refreshToken) {
        throw new AppError("No refresh token available in cookie", 401);
      }
  
      const response = await this._userUseCase.refresh(refreshToken);
  
      if (response.success && response.token && response.refreshToken) {
        // Update refresh token cookie with new value (httpOnly: true for security)
        res.cookie("refreshToken", response.refreshToken, {
          httpOnly: true, // Prevent JavaScript access
          secure: true,   // Required for HTTPS
          sameSite: "none", // For cross-origin
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
          path: "/",     // Ensure site-wide availability
        });
  
        // Return new access token in response
        res.status(200).json({
          success: true,
          message: response.message,
          token: response.token, // New access token for client
        });
      } else {
        res.status(401).json(response);
      }
    } catch (error) {
      console.error("Refresh Token Error:", error);
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

  async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body;
      console.log(email, "emil")
      if (!email) throw new AppError("Email is required", 400);

      const response = await this._userUseCase.forgotPassword(email);
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }


  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { token, formData } = req.body;
      const newPassword = formData
      console.log(token, "tok")
      console.log(newPassword, "data")
      if (!token) throw new AppError("token is required", 400);
      const response = await this._userUseCase.resetPassword(token, newPassword);
      res.status(200).json(response);
      // const response = await this._userUseCase.forgotPassword(email);
      // res.status(200).json(response);
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
      const { userId, priceId, code } = req.body;

      if (!userId || !priceId) {
        throw new AppError("User ID and Price ID are required", 400);
      }
      console.log(code,"akhildas",req.body)

      const session = await this._userUseCase.execute(userId, priceId, code);
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
  async getTracksInPlaylist(req: Request, res: Response, next: NextFunction) {
    try {
      const { id, page = "1", limit  } = req.query;
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    console.log(id, "Fetching tracks with pagination:", { pageNum, limitNum ,skip});
      console.log("Get playlist:");
      const track = await this._userUseCase.getPlaylist(id as string,pageNum,limitNum,skip)
      console.log(track,"this is track ma")
      res.json({ success: true ,data:track});
    } catch (error) {
      console.error("Error in getliked:", error);
      next(error);
    }
  }


  async createPlaylist(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId, playlist } = req.body
      console.log("12",userId,playlist,req.body)
      const newplaylist = await this._userUseCase.createPlaylist(userId, playlist)
      console.log("1234",newplaylist)
      res.status(200).json({ success: true, data: newplaylist });
    } catch (error) {
      console.error("Error in getliked:", error);
      next(error);
    }
  }
  
  async getPlaylist(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req.query

      console.log(userId, "ith thanne", req.body, req.query)

      const playlist = await this._userUseCase.getAllPlaylist(userId as string)
      res.status(200).json({ success: true, data: playlist });
    } catch (error) {
      console.error("Error in getliked:", error);
      next(error);
    }
  }

  async addToPlaylist(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId, playlistId, trackId } = req.body
      console.log("this s what it e")
      const playlist = await this._userUseCase.addToPlaylist(userId, playlistId, trackId)
      if(playlist==null){
        res.status(404).json({ success: false ,message:"Track Already Exist"});

      }
      res.status(200).json({ success: true });
    } catch (error) {
      console.error("Error in getliked:", error);
      next(error);
    }
  }
  async deletePlaylist(req: Request, res: Response, next: NextFunction) {
    try {
      console.log(req.body,"delete,id")
      const {id} = req.body
      const updated = await this._userUseCase.deletePlaylist(id)

      res.status(200).json({ success: true });
    } catch (error) {
      console.error("Error in getliked:", error);
      next(error);
    }
  }
  async updateNamePlaylist(req: Request, res: Response, next: NextFunction) {
    try {
      console.log(req.body,"udpatename")
      const {id, playlistName} = req.body
      const updated = await this._userUseCase.updateNamePlaylist(id, playlistName)

      res.status(200).json({ success: true });
    } catch (error) {
      console.error("Error in getliked:", error);
      next(error);
    }
  }

  async updateImagePlaylist(req: Request, res: Response, next: NextFunction) {
    try {
      const{id} = req.body
      const file = req.file
      if (!file) {
        console.error("No file provided for update.");
        return; // Exit early if file is undefined
      }
      
      console.log(req.body,req.file,"udpateProfilepage")
      const updated = await this._userUseCase.updateImagePlaylist(id, file)

      res.status(200).json({ updated,success: true });
    } catch (error) {
      console.error("Error in getliked:", error);
      next(error);
    }
  }

    async allBanners(req: Request, res: Response, next: NextFunction): Promise<void> {
      try {
  
  
          const allBanners = await this._userUseCase.getAllBanners()
        console.log(allBanners,"odi odi odsssi")
          res.status(201).json({ message: "Banner added successfully", data: allBanners });
    
      } catch (error) {
        next(error);
      }
    }
    async handleWebhook(req: Request, res: Response, next: NextFunction): Promise<void> {
      try {
        const signature = req.headers["stripe-signature"] as string;
        if (!signature) {
          throw new Error("Missing Stripe signature");
        }

  
          console.log("odi worked boyy",signature)
        // Pass raw body and signature to use case
        await this._userUseCase.confirmPayment(req.body, signature);
  
        res.status(200).json({ received: true });
      } catch (error: any) {
        console.error("Webhook error:", error);
        res.status(400).send(`Webhook Error: ${error.message}`);
        next(error); 
      }
    }

    async checkCouponStatus(): Promise<void> {
      try {
        console.log("UserController: Starting coupon status check...");
        await this._userUseCase.checkAndUpdateCouponStatus();
        console.log("UserController: Coupon status check completed");
      } catch (error: any) {
        console.error("UserController: Error during coupon status check:", error);
        throw error;
      }
    }
    async resetPaymentStatus(): Promise<void> {
      try {
        console.log("UserController: Starting coupon status check...");
        await this._userUseCase.resetPaymentStatus();
        console.log("UserController: Coupon status check completed");
      } catch (error: any) {
        console.error("UserController: Error during coupon status check:", error);
        throw error;
      }
    }

    async getSubscriptionHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
      try {
        const history = await this._userUseCase.getSubscriptionHistoryFromStripe();
        res.status(200).json({ data: history });
      } catch (error: any) {
        console.error("Error in getSubscriptionHistory controller:", error);
        next(error); 
      }
    }

    
    async fetchAllTrack(req: Request, res: Response, next: NextFunction): Promise<void> {
      try {
        const tracks = await this._userUseCase.getAllTracks();
        res.status(200).json({ data: tracks });
      } catch (error: any) {
        console.error("Error in getSubscriptionHistory controller:", error);
        next(error);
      }
    }

    async fetchGenreTracks(req: Request, res: Response, next: NextFunction): Promise<void> {
      try {
        const {GenreName} = req.query
        console.log(GenreName)
        const tracks = await this._userUseCase.fetchGenreTracks(GenreName as string);
        console.log(tracks,"ssssssssssssssssssssssssssss")
        res.status(200).json({ data: tracks });
      } catch (error: any) {
        console.error("Error in fetchGenreTracks controller:", error);
        next(error); 
      }
    }

    async becomeArtist(req: Request, res: Response, next: NextFunction): Promise<void> {
      try {
        const {id} =  req.body
        
        const updated = await this._userUseCase.becomeArtist(id as string);
        console.log(updated,"ssssssssssssssssssssssssssss")
        res.status(200).json({ data: updated });
      } catch (error: any) {
        console.error("Error in updated controller:", error);
        next(error); 
      }
    }



}
