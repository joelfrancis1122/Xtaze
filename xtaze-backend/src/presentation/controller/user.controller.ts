import { NextFunction, Request, Response } from "express";
import { HttpStatus } from "../../domain/constants/httpStatus";
import IuserUseCase from "../../domain/usecase/IUserUseCase"
import AppError from "../../utils/AppError"
import { MESSAGES } from "../../domain/constants/messages";

import { inject, injectable } from "inversify";
import TYPES from "../../domain/constants/types";
// interface Dependencies {
//   userUseCase: IuserUseCase;
// }

// export default class UserController {
//   private _userUseCase: IuserUseCase;  // space for toy maker 

//   constructor(dependencies: Dependencies) { // boss gives the toy maker here 
//     this._userUseCase = dependencies.userUseCase; //gets toy maker
//   }
@injectable()
export default class UserController {
  private _userUseCase: IuserUseCase;

  constructor(@inject(TYPES.UserUseCase) userUseCase: IuserUseCase) {
    this._userUseCase = userUseCase;
  }

  async incrementListeners(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { trackId, id } = req.body;
      await this._userUseCase.increment(trackId as string, id as string);
      res.status(HttpStatus.OK).json({ success: true, message: MESSAGES.LISTENER_INCREMENT_SUCCESS });
    } catch (error) {
      next(error);
    }
  }


  async sendOTP(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body;
      if (!email) throw new AppError(MESSAGES.EMAIL_REQUIRED, HttpStatus.BAD_REQUEST);

      const result = await this._userUseCase.sendOTP(email);

      if (Number(result) === HttpStatus.FORBIDDEN) {
        throw new AppError(MESSAGES.USER_ALREADY_EXISTS, HttpStatus.FORBIDDEN);
      }
      res.status(HttpStatus.OK).json({ success: true, message: MESSAGES.OTP_DONE, result });
    } catch (error) {
      next(error);
    }
  }

  async verifyOTP(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { otp } = req.body;
      if (!otp) throw new AppError(MESSAGES.OTP_REQ, HttpStatus.BAD_REQUEST);

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
        throw new AppError(MESSAGES.ALL_REQUIRED, HttpStatus.BAD_REQUEST);
      }

      const user = await this._userUseCase.registerUser(username, country, gender, year, phone, email, password);

      res.status(HttpStatus.CREATED).json({ success: true, message: MESSAGES.USER_REG, data: user });
    } catch (error) {
      next(error);
    }
  }


  async loginUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {

      const { email, password } = req.body;
      if (!email || !password) throw new AppError(MESSAGES.EMAIL_REQUIRED, HttpStatus.BAD_REQUEST);

      const response = await this._userUseCase.login(email, password);

      if (response.success && response.token && response.refreshToken) {
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
      next(error);
    }
  }

  async refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const refreshToken = req.cookies.refreshToken;

      if (!refreshToken) {
        throw new AppError(MESSAGES.NO_REFRESH_TOKEN, HttpStatus.UNAUTHORIZED);
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
      next(error);
    }
  }

  async checkUsername(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userName } = req.body;
      if (!userName) throw new AppError(MESSAGES.USERNAME_REQUIRED, HttpStatus.BAD_REQUEST);

      const available = await this._userUseCase.checkUnique(userName);

      res.status(HttpStatus.OK).json({ success: true, message: MESSAGES.OTP_DONE, available });

    } catch (error) {
      next(error);
    }
  }

  async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body;
      if (!email) throw new AppError(MESSAGES.EMAIL_REQUIRED, HttpStatus.BAD_REQUEST);

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
      if (!token) throw new AppError(MESSAGES.INVALID_TOKEN, HttpStatus.BAD_REQUEST);
      const response = await this._userUseCase.resetPassword(token, newPassword);
      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }


  async uploadProfilepic(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId } = req.body;
      const file = req.file;


      if (!userId || !file) {
        throw new AppError(MESSAGES.USER_ID_REQUIRED, HttpStatus.BAD_REQUEST);
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
        throw new AppError(MESSAGES.USER_ID_REQUIRED, HttpStatus.BAD_REQUEST);
      }

      const isVideo = file.mimetype.startsWith("video/");
      const result = await this._userUseCase.uploadBanner(userId, file, isVideo);

      res.status(result.success ? HttpStatus.OK : HttpStatus.BAD_REQUEST).json(result);
    } catch (error) {
      next(error);
    }
  }

  async listArtists(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 100;
      const listArtists = await this._userUseCase.listArtists(page, limit);
      res.status(HttpStatus.OK).json({ success: true, message: MESSAGES.LIST_OF_ARTISTS, data: listArtists.data });
    } catch (error) {
      next(error);
    }
  }
  async updateBio(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId, bio } = req.body;


      if (!userId || !bio) {
        throw new AppError(MESSAGES.USER_ID_REQUIRED, HttpStatus.BAD_REQUEST);
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
        throw new AppError(MESSAGES.USER_ID_REQUIRED, HttpStatus.BAD_REQUEST);
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
        throw new AppError(MESSAGES.USER_ID_REQUIRED, HttpStatus.BAD_REQUEST);
      }

      const user = await this._userUseCase.addToLiked(userId as string, trackId);
      res.status(HttpStatus.OK).json({ success: true, user });
    } catch (error) {
      next(error);
    }
  }




  async getliked(req: Request, res: Response, next: NextFunction) {
    try {
      const { songIds } = req.body
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
      next(error);
    }
  }


  async createPlaylist(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId, playlist } = req.body
      const newplaylist = await this._userUseCase.createPlaylist(userId, playlist)
      res.status(HttpStatus.OK).json({ success: true, data: newplaylist });
    } catch (error) {
      next(error);
    }
  }

  async albums(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await this._userUseCase.allAlbums();
     res.status(HttpStatus.OK).json({ data: data });
    } catch (error: unknown) {
      res.status(HttpStatus.NOT_FOUND).json({ message: (error as Error).message || "Internal server error" });
      next(error);
    }
  }
  async albumView(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const {albumId} = req.query
      const data = await this._userUseCase.albumView(albumId as string);
     res.status(HttpStatus.OK).json({ data: data });
    } catch (error: unknown) {
      res.status(HttpStatus.NOT_FOUND).json({ message: (error as Error).message || "Internal server error" });
      next(error);
    }
  }

  async getPlaylist(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req.query


      const playlist = await this._userUseCase.getAllPlaylist(userId as string)
      res.status(HttpStatus.OK).json({ success: true, data: playlist });
    } catch (error) {
      next(error);
    }
  }

  async addToPlaylist(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId, playlistId, trackId } = req.body
      const playlist = await this._userUseCase.addToPlaylist(userId, playlistId, trackId)
      if (playlist == null) {
        res.status(HttpStatus.NOT_FOUND).json({ success: false, message: MESSAGES.TRACKS_EXSIST });

      }
      res.status(HttpStatus.OK).json({ success: true });
    } catch (error) {
      next(error);
    }
  }
  async deletePlaylist(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.body
      const updated = await this._userUseCase.deletePlaylist(id)

      res.status(HttpStatus.OK).json({ success: true });
    } catch (error) {
      next(error);
    }
  }
  async updateNamePlaylist(req: Request, res: Response, next: NextFunction) {
    try {
      const { id, playlistName } = req.body
      const updated = await this._userUseCase.updateNamePlaylist(id, playlistName)

      res.status(HttpStatus.OK).json({ success: true });
    } catch (error) {
      next(error);
    }
  }

  async updateImagePlaylist(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.body
      const file = req.file
      if (!file) {
        return;
      }

      const updated = await this._userUseCase.updateImagePlaylist(id, file)

      res.status(HttpStatus.OK).json({ updated, success: true });
    } catch (error) {
      next(error);
    }
  }

  async allBanners(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {


      const allBanners = await this._userUseCase.getAllBanners()
      res.status(HttpStatus.CREATED).json({ success: true, message: MESSAGES.BANNER_ADDED_SUCCESS, data: allBanners });

    } catch (error) {
      next(error);
    }
  }


  async checkCouponStatus(): Promise<void> {
    try {
      await this._userUseCase.checkAndUpdateCouponStatus();
    } catch (error: unknown) {
      throw error;
    }
  }
  async resetPaymentStatus(): Promise<void> {
    try {
      await this._userUseCase.resetPaymentStatus();
    } catch (error: unknown) {
      throw error;
    }
  }

  async getSubscriptionHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const history = await this._userUseCase.getSubscriptionHistoryFromStripe();
      res.status(HttpStatus.OK).json({ data: history });
    } catch (error: unknown) {
      next(error);
    }
  }

  async handleWebhook(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const signature = req.headers["stripe-signature"] as string;
      // Pass raw body and signature to use case
      await this._userUseCase.confirmPayment(req.body, signature);

      res.status(HttpStatus.OK).json({ received: true });
    } catch (error: unknown) {
      res.status(HttpStatus.BAD_REQUEST).send(`Webhook Error: ${(error as Error).message}`);
      next(error);
    }
  }
  async fetchAllTrack(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tracks = await this._userUseCase.getAllTracks();
      res.status(HttpStatus.OK).json({ data: tracks });
    } catch (error: unknown) {
      next(error);
    }
  }

  async fetchGenreTracks(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { GenreName } = req.query
      const tracks = await this._userUseCase.fetchGenreTracks(GenreName as string);
      res.status(HttpStatus.OK).json({ data: tracks });
    } catch (error: unknown) {
      next(error);
    }
  }

  async becomeArtist(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.body
      console.log("came")
      const updated = await this._userUseCase.becomeArtist(id as string);
      res.status(HttpStatus.OK).json({ data: updated });
    } catch (error: unknown) {
      next(error);
    }
  }

async getAllTracksArtist(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { userId, page = 1, limit = 10 } = req.query;

    if (!userId) {
      res.status(HttpStatus.BAD_REQUEST).json({ success: false, message: "User ID is required" });
      return;
    }

    const pageNum = Number(page) || 1;   
    const limitNum = Number(limit) || 10;

    const tracks = await this._userUseCase.listArtistReleases(userId as string, pageNum, limitNum);

    res.status(HttpStatus.OK).json({
      success: true,
      message: MESSAGES.ARTIST_TRACKS_LIST_SUCCESS,
      tracks: tracks?.data ?? [],
    });
  } catch (error) {
    next(error);
  }
}


  async username(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const username = req.query.userId

      const data = await this._userUseCase.getArtistByName(username as string);
      res.status(HttpStatus.OK).json({ data: data });
    } catch (error: unknown) {
      next(error);
    }
  }
  async usernameUpdate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.query.id
      const username = req.body.username

      const data = await this._userUseCase.usernameUpdate(userId as string, username);
      res.status(HttpStatus.OK).json({ data: data });
    } catch (error: unknown) {
      next(error);
    }
  }
}
