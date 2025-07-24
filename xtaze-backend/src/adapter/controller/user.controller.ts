import { NextFunction, Request, Response } from "express";
import IuserUseCase from "../../domain/usecase/IUserUseCase";
import AppError from "../../utils/AppError";
import { HttpStatus } from "../../domain/constants/httpStatus";


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
      if (!email) throw new AppError("Email is required", HttpStatus.BAD_REQUEST);

      const result = await this._userUseCase.sendOTP(email);

      if (Number(result) === HttpStatus.FORBIDDEN) {
        throw new AppError("Email address already exists", HttpStatus.FORBIDDEN);
      }

      res.status(HttpStatus.OK).json({ success: true, message: "OTP sent successfully!", result });
    } catch (error) {
      next(error);
    }
  }

  async verifyOTP(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { otp } = req.body;
      if (!otp) throw new AppError("OTP is required", HttpStatus.BAD_REQUEST);

      console.log("Body received in controller:", req.body);
      const response = await this._userUseCase.verifyOTP(otp);

      if (!response.success) {
        res.status(HttpStatus.BAD_REQUEST).json(response);
        return;
      }
      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  async registerUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { username, country, gender, year, phone, email, password } = req.body;
      if (!username || !email || !password) {
        throw new AppError("Username, email, and password are required", HttpStatus.BAD_REQUEST);
      }

      console.log(req.body, "Register body");
      const user = await this._userUseCase.registerUser(username, country, gender, year, phone, email, password);
      console.log("User registered:", user);

      res.status(HttpStatus.CREATED).json({ success: true, message: "User registered successfully", data: user });
    } catch (error) {
      next(error);
    }
  }


  async loginUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {

      const { email, password } = req.body;
      if (!email || !password) throw new AppError("Email and password are required", HttpStatus.BAD_REQUEST);

      console.log("Login body:", req.body);
      const response = await this._userUseCase.login(email, password);
      console.log(response.token, "emt vannile");

      if (response.success && response.token && response.refreshToken) {
        console.log(response.token, "emt vannilessssssss");
        res.cookie("refreshToken", response.refreshToken, {
          httpOnly: true,
          secure: true,
          sameSite: "none",
          maxAge: 7 * 24 * 60 * 60 * 1000,
          path: "/",
        });
        res.status(HttpStatus.OK).json({
          success: true,
          message: response.message,
          token: response.token,
          user: response.user,
        });
      } else {
        res.status(HttpStatus.BAD_REQUEST).json(response);
      }

    } catch (error) {
      next(error);
    }
  }

  async googleLogin(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { token } = req.body;
      if (!token) throw new AppError("Google token is required", HttpStatus.BAD_REQUEST);

      const response = await this._userUseCase.googleLogin(token);

      if (response.success && response.token && response.refreshToken) {

        res.cookie("refreshToken", response.refreshToken, {
          httpOnly: true, // Prevent JavaScript access
          secure: true,   // Required for HTTPS
          sameSite: "none", // For cross-origin
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
          path: "/",
        });
        res.status(HttpStatus.OK).json({
          success: true,
          message: response.message,
          token: response.token, // access token
          user: response.user,
        });
      } else {
        res.status(HttpStatus.BAD_REQUEST).json(response);
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
        throw new AppError("No refresh token available in cookie", HttpStatus.UNAUTHORIZED);
      }

      const response = await this._userUseCase.refresh(refreshToken);

      if (response.success && response.token && response.refreshToken) {
        res.cookie("refreshToken", response.refreshToken, {
          httpOnly: true,
          secure: true,
          sameSite: "none",
          maxAge: 7 * 24 * 60 * 60 * 1000,
          path: "/",     // Ensure site-wide availability
        });

        // Return new access token in response
        res.status(HttpStatus.OK).json({
          success: true,
          message: response.message,
          token: response.token, // New access token for client
        });
      } else {
        res.status(HttpStatus.UNAUTHORIZED).json(response);
      }
    } catch (error) {
      console.error("Refresh Token Error:", error);
      next(error);
    }
  }

  async checkUsername(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userName } = req.body;
      if (!userName) throw new AppError("Username is required", HttpStatus.BAD_REQUEST);

      const available = await this._userUseCase.checkUnique(userName);
      console.log("Checking username:", userName, "Available:", available);

      res.status(HttpStatus.OK).json({ success: true, message: "OTP sent successfully!", available });

    } catch (error) {
      next(error);
    }
  }

  async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body;
      if (!email) throw new AppError("Email is required", HttpStatus.BAD_REQUEST);

      const response = await this._userUseCase.forgotPassword(email);
      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }


  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { token, formData } = req.body;
      const newPassword = formData
      if (!token) throw new AppError("token is required", HttpStatus.BAD_REQUEST);
      const response = await this._userUseCase.resetPassword(token, newPassword);
      res.status(HttpStatus.OK).json(response);
      // const response = await this._userUseCase.forgotPassword(email);
      // res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }


  async uploadProfilepic(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId } = req.body;
      const file = req.file;


      if (!userId || !file) {
        throw new AppError("User ID and image are required", HttpStatus.BAD_REQUEST);
      }

      const result = await this._userUseCase.uploadProfile(userId, file);
      res.status(result.success ? HttpStatus.OK : HttpStatus.BAD_REQUEST).json(result);
    } catch (error) {
      next(error);
    }
  }

  async uploadBanner(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId } = req.body;
      const file = req.file;


      if (!userId || !file) {
        throw new AppError("User ID and file are required", HttpStatus.BAD_REQUEST);
      }

      const isVideo = file.mimetype.startsWith("video/");
      const result = await this._userUseCase.uploadBanner(userId, file, isVideo);

      res.status(result.success ? HttpStatus.OK : HttpStatus.BAD_REQUEST).json(result);
    } catch (error) {
      console.error("Error in uploadBanner:", error);
      next(error);
    }
  }

  async updateBio(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId, bio } = req.body;


      if (!userId || !bio) {
        throw new AppError("User ID and bio are required", HttpStatus.BAD_REQUEST);
      }

      const result = await this._userUseCase.updateBio(userId, bio);
      res.status(result.success ? HttpStatus.OK : HttpStatus.BAD_REQUEST).json(result);
    } catch (error) {
      next(error);
    }
  }

  async checkOut(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId, priceId, code } = req.body;

      if (!userId || !priceId) {
        throw new AppError("User ID and Price ID are required", HttpStatus.BAD_REQUEST);
      }

      const session = await this._userUseCase.execute(userId, priceId, code);
      res.status(HttpStatus.OK).json({ success: true, sessionId: session?.id });
    } catch (error) {
      next(error);
    }
  }

  async toggleLike(req: Request, res: Response, next: NextFunction) {
    try {
      const { trackId } = req.body;
      const { userId } = req.query;


      if (!userId || !trackId) {
        throw new AppError("User ID and Track ID are required", HttpStatus.BAD_REQUEST);
      }

      const user = await this._userUseCase.addToLiked(userId as string, trackId);
      res.status(HttpStatus.OK).json({ success: true, user });
    } catch (error) {
      console.error("Error in toggleLike:", error);
      next(error);
    }
  }




  async getliked(req: Request, res: Response, next: NextFunction) {
    try {
      const { songIds } = req.body
      console.log(songIds, "songssssss")
      const userId = req.query.userId as string;
      const tracks = await this._userUseCase.getliked(songIds as string, userId as string)
      res.json({ success: true, tracks });

    } catch (err) {
      next(err)
    }
  }

  async getTracksInPlaylist(req: Request, res: Response, next: NextFunction) {
    try {
      const { id, page = "1", limit } = req.query;
      const pageNum = parseInt(page as string, 10);
      const limitNum = parseInt(limit as string, 10);
      const skip = (pageNum - 1) * limitNum;

      const track = await this._userUseCase.getPlaylist(id as string, pageNum, limitNum, skip)
      res.json({ success: true, data: track });
    } catch (error) {
      console.error("Error in getliked:", error);
      next(error);
    }
  }


  async createPlaylist(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId, playlist } = req.body
      const newplaylist = await this._userUseCase.createPlaylist(userId, playlist)
      res.status(HttpStatus.OK).json({ success: true, data: newplaylist });
    } catch (error) {
      console.error("Error in getliked:", error);
      next(error);
    }
  }

  async getPlaylist(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req.query


      const playlist = await this._userUseCase.getAllPlaylist(userId as string)
      res.status(HttpStatus.OK).json({ success: true, data: playlist });
    } catch (error) {
      console.error("Error in getliked:", error);
      next(error);
    }
  }

  async addToPlaylist(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId, playlistId, trackId } = req.body
      const playlist = await this._userUseCase.addToPlaylist(userId, playlistId, trackId)
      if (playlist == null) {
        res.status(HttpStatus.NOT_FOUND).json({ success: false, message: "Track Already Exist" });

      }
      res.status(HttpStatus.OK).json({ success: true });
    } catch (error) {
      console.error("Error in getliked:", error);
      next(error);
    }
  }
  async deletePlaylist(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.body
      const updated = await this._userUseCase.deletePlaylist(id)

      res.status(HttpStatus.OK).json({ success: true });
    } catch (error) {
      console.error("Error in getliked:", error);
      next(error);
    }
  }
  async updateNamePlaylist(req: Request, res: Response, next: NextFunction) {
    try {
      const { id, playlistName } = req.body
      const updated = await this._userUseCase.updateNamePlaylist(id, playlistName)

      res.status(HttpStatus.OK).json({ success: true });
    } catch (error) {
      console.error("Error in getliked:", error);
      next(error);
    }
  }

  async updateImagePlaylist(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.body
      const file = req.file
      if (!file) {
        console.error("No file provided for update.");
        return;
      }

      const updated = await this._userUseCase.updateImagePlaylist(id, file)

      res.status(HttpStatus.OK).json({ updated, success: true });
    } catch (error) {
      console.error("Error in getliked:", error);
      next(error);
    }
  }

  async allBanners(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {


      const allBanners = await this._userUseCase.getAllBanners()
      res.status(HttpStatus.CREATED).json({ success: true, message: "Banner added successfully", data: allBanners });

    } catch (error) {
      next(error);
    }
  }


  async checkCouponStatus(): Promise<void> {
    try {
      await this._userUseCase.checkAndUpdateCouponStatus();
    } catch (error: unknown) {
      console.error("UserController: Error during coupon status check:", error);
      throw error;
    }
  }
  async resetPaymentStatus(): Promise<void> {
    try {
      await this._userUseCase.resetPaymentStatus();
    } catch (error: unknown) {
      console.error("UserController: Error during coupon status check:", error);
      throw error;
    }
  }

  async getSubscriptionHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const history = await this._userUseCase.getSubscriptionHistoryFromStripe();
      res.status(HttpStatus.OK).json({ data: history });
    } catch (error: unknown) {
      console.error("Error in getSubscriptionHistory controller:", error);
      next(error);
    }
  }

  async handleWebhook(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const signature = req.headers["stripe-signature"] as string;
      if (!signature) {
        throw new Error("Missing Stripe signature");
      }


      // Pass raw body and signature to use case
      await this._userUseCase.confirmPayment(req.body, signature);

      res.status(HttpStatus.OK).json({ received: true });
    } catch (error: unknown) {
      console.error("Webhook error:", error);
      res.status(HttpStatus.BAD_REQUEST).send(`Webhook Error: ${(error as Error).message}`);
      next(error);
    }
  }
  async fetchAllTrack(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tracks = await this._userUseCase.getAllTracks();
      res.status(HttpStatus.OK).json({ data: tracks });
    } catch (error: unknown) {
      console.error("Error in getSubscriptionHistory controller:", error);
      next(error);
    }
  }

  async fetchGenreTracks(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { GenreName } = req.query
      const tracks = await this._userUseCase.fetchGenreTracks(GenreName as string);
      res.status(HttpStatus.OK).json({ data: tracks });
    } catch (error: unknown) {
      console.error("Error in fetchGenreTracks controller:", error);
      next(error);
    }
  }

  async becomeArtist(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.body

      const updated = await this._userUseCase.becomeArtist(id as string);
      res.status(HttpStatus.OK).json({ data: updated });
    } catch (error: unknown) {
      console.error("Error in updated controller:", error);
      next(error);
    }
  }


  async username(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const username = req.query.userId

      const data = await this._userUseCase.getArtistByName(username as string);
      res.status(HttpStatus.OK).json({ data: data });
    } catch (error: unknown) {
      console.error("Error in getUsers controller:", error);
      next(error);
    }
  }
  async usernameUpdate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.query.id
      const username = req.body.username
      console.log(userId, req.body, "joes")

      const data = await this._userUseCase.usernameUpdate(userId as string, username);
      console.log("remene", data)
      res.status(HttpStatus.OK).json({ data: data });
    } catch (error: unknown) {
      console.error("Error in getUsers controller:", error);
      next(error);
    }
  }
}
