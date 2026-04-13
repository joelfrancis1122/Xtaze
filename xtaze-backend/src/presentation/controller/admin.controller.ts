import { NextFunction, Request, Response } from "express";
import IAdminUseCase from "../../domain/usecase/IAdminUseCase";
import { HttpStatus } from "../../domain/constants/httpStatus";
import AppError from "../../utils/AppError";
import { MESSAGES } from "../../domain/constants/messages";
import { injectable } from "inversify";
import { inject } from "inversify";
import TYPES from "../../domain/constants/types";

@injectable()
export default class AdminController {
  private _adminUseCase: IAdminUseCase;

  constructor(@inject(TYPES.AdminUseCase) adminUseCase: IAdminUseCase) {
    this._adminUseCase = adminUseCase;
  }


  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;
      const response = await this._adminUseCase.login(email, password);

      if (!response.success) {
        throw new AppError(MESSAGES.LOGIN_FAILED, HttpStatus.BAD_REQUEST);
      }

      if(response.success&&response.token&&response.AdminrefreshToken){
        res.cookie("AdminrefreshToken",response.AdminrefreshToken,{
          httpOnly:true,
          secure:true,
          sameSite:"none",
           maxAge: 7 * 24 * 60 * 60 * 1000,
          path: "/",
        })
      }
      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

 async refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const refreshToken = req.cookies.AdminrefreshToken;

      if (!refreshToken) {
        throw new AppError(MESSAGES.NO_REFRESH_TOKEN, HttpStatus.FORBIDDEN);
      }

      const response = await this._adminUseCase.refresh(refreshToken);

      if (response.success && response.token && response.refreshToken) {
        res.cookie("AdminrefreshToken", response.refreshToken, {
          httpOnly: true,
          secure: true,
          sameSite: "none",
          maxAge: 7 * 24 * 60 * 60 * 1000,
          path: "/",     
        });

        // Return new access token in response
        res.status(HttpStatus.OK).json({
          success: true,
          message: response.message,
          token: response.token, // New access kitty
        });
      } else {
        res.status(HttpStatus.UNAUTHORIZED).json(response);
      }
    } catch (error) {
      next(error);
    }
  }


  async banners(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { title, description, action, isActive, createdBy } = req.body;
      const file = req.file;

      if (!file) {
        throw new AppError(MESSAGES.BANNER_IMAGE_REQUIRED, HttpStatus.BAD_REQUEST);
      }

      const response = await this._adminUseCase.addBanner(
        title,
        description,
        action,
        isActive === "true",
        createdBy,
        file
      );

      if (!response) {
        throw new AppError(MESSAGES.BANNER_ADD_FAILED, HttpStatus.BAD_REQUEST);
      }

      res.status(HttpStatus.CREATED).json({ message: MESSAGES.BANNER_ADDED_SUCCESS, data: response });
    } catch (error) {
      next(error);
    }
  }

  async allBanners(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const allBanners = await this._adminUseCase.getAllBanners();
      res.status(HttpStatus.OK).json({ message: MESSAGES.BANNER_ADDED_SUCCESS, data: allBanners });
    } catch (error) {
      next(error);
    }
  }

  async deleteBanner(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const deletedBanner = await this._adminUseCase.deleteBanner(id);
      res.status(HttpStatus.OK).json({ message: MESSAGES.BANNER_ADDED_SUCCESS, data: deletedBanner });
    } catch (error) {
      next(error);
    }
  }

  async updateBanner(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { title, description, action, isActive } = req.body;
      const file = req.file;

      if (!file) return;

      const updated = await this._adminUseCase.updateBanner(id, title, description, action, isActive, file);
      res.status(HttpStatus.OK).json({ message: MESSAGES.BANNER_UPDATED_SUCCESS, data: updated });
    } catch (error) {
      next(error);
    }
  }

  async toggleblockArtist(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      if (!id) {
        throw new AppError(MESSAGES.ARTIST_ID_REQUIRED, HttpStatus.BAD_REQUEST);
      }

      const updatedStatus = await this._adminUseCase.toggleBlockUnblockArtist(id);
      if (!updatedStatus) {
        throw new AppError(MESSAGES.ARTIST_STATUS_UPDATE_FAILED, HttpStatus.NOT_FOUND);
      }

      res.status(HttpStatus.OK).json({ success: true, message: MESSAGES.ARTIST_STATUS_UPDATED, data: updatedStatus });
    } catch (error) {
      next(error);
    }
  }

  async createProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name, description, price, interval } = req.body;
      if (!name || !price || !interval) {
        throw new AppError(MESSAGES.PLAN_CREATE_REQUIRED, HttpStatus.BAD_REQUEST);
      }
      const plan = await this._adminUseCase.createPlan(name, description, price, interval);
      res.status(HttpStatus.CREATED).json({ success: true, message: MESSAGES.PLAN_CREATED_SUCCESS, data: plan });
    } catch (error) {
      next(error);
    }
  }

  async getPlans(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const plans = await this._adminUseCase.getPlans();
      res.status(HttpStatus.OK).json({ success: true, data: plans });
    } catch (error) {
      next(error);
    }
  }

  async archiveSubscriptionPlan(req: Request, res: Response, next: NextFunction) {
    try {
      const productId = req.query.productId;
      if (!productId) {
        throw new AppError(MESSAGES.PROD_ID_REQ, HttpStatus.BAD_REQUEST);
      }
      const archivedProduct = await this._adminUseCase.archivePlan(productId as string);
      res.status(HttpStatus.OK).json({ success: true, message: MESSAGES.PLAN_ARCHIVED_SUCCESS, data: archivedProduct });
    } catch (error) {
      next(error);
    }
  }

  async updateSubscriptionPlan(req: Request, res: Response, next: NextFunction) {
    try {
      const productId = req.query.productId;
      const { name, description, price, interval } = req.body;
      if (!productId || !name || !price || !interval) {
        throw new AppError(MESSAGES.PLAN_UPDATE_REQUIRED, HttpStatus.BAD_REQUEST);
      }
      const updatedPlan = await this._adminUseCase.updatePlan(productId as string, name, description, price, interval);
      res.status(HttpStatus.OK).json({ success: true, data: updatedPlan });
    } catch (error) {
      next(error);
    }
  }

  async getCoupons(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this._adminUseCase.getCoupons();
      res.status(HttpStatus.OK).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async createCoupon(req: Request, res: Response, next: NextFunction) {
    try {
      const { code, discountAmount, expires, maxUses, uses } = req.body;
      const expiresDate = new Date(expires);

      const result = await this._adminUseCase.createCoupon(
        code,
        discountAmount,
        expiresDate,
        maxUses,
        uses ?? 0
      );

      if (!result) {
        res.status(HttpStatus.BAD_REQUEST).json({ success: false, message: MESSAGES.COUPON_CREATE_FAILED });
      }

      res.status(HttpStatus.CREATED).json({ success: true, message: MESSAGES.COUPON_CREATED_SUCCESS, result });
    } catch (error) {
      next(error);
    }
  }

  async deleteCoupon(req: Request, res: Response, next: NextFunction) {
    try {
      const couponId = req.query.id;
      const deletedCoupon = await this._adminUseCase.deleteCoupon(couponId as string);

      if (!deletedCoupon) {
        res.status(HttpStatus.BAD_REQUEST).json({ success: false, message: MESSAGES.COUPON_DELETE_FAILED });
      }

      res.status(HttpStatus.OK).json({ success: true, message: MESSAGES.COUPON_DELETED_SUCCESS });
    } catch (error) {
      next(error);
    }
  }

  async updateCoupon(req: Request, res: Response, next: NextFunction) {
    try {
      const couponId = req.query.id;
      const { code, discountAmount, expires, maxUses } = req.body;

      const updateData = { code, discountAmount, expires, maxUses };
      const updatedCoupon = await this._adminUseCase.updateCoupon(couponId as string, updateData);

      res.status(HttpStatus.OK).json({ success: true, message: MESSAGES.COUPON_UPDATED_SUCCESS, data: updatedCoupon });
    } catch (error: unknown) {
      next(error);
    }
  }

  async verifyCoupon(req: Request, res: Response, next: NextFunction) {
    try {
      const { code } = req.body;
      const coupon = await this._adminUseCase.verifyCoupon(code);
      res.status(HttpStatus.OK).json({ success: true, message: MESSAGES.COUPON_VERIFIED_SUCCESS, data: coupon });
    } catch (error: unknown) {
      next(error);
    }
  }

  async getMusicMonetization(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const monetizationData = await this._adminUseCase.getMusicMonetization(page, limit);
      res.status(HttpStatus.OK).json({
        success: true,
        data: monetizationData.data,
        pagination: monetizationData.pagination,
      });
    } catch (error: unknown) {
      next(error);
    }
  }

  async artistPayout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { artistName } = req.body;
      const data = await this._adminUseCase.artistPayout(artistName);
      res.status(HttpStatus.OK).json({ data });
    } catch (error: unknown) {
      next(error);
    }
  }

  async getUsersByIds(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userIds } = req.body;
      const data = await this._adminUseCase.getUsersByIds(userIds);
      res.status(HttpStatus.OK).json({ data });
    } catch (error: unknown) {
      next(error);
    }
  }

  async fetchVerification(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;
      const verification = await this._adminUseCase.fetchVerification(page, limit);
      res.status(HttpStatus.OK).json({ success: true, message: MESSAGES.VERIFICATION_LIST, data: verification });
    } catch (error) {
      next(error);
    }
  }

  async getAllTracksArtist(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId } = req.query;
      let tracks = null;
      if (userId) {
        tracks = await this._adminUseCase.listArtistReleases(userId as string);
      }
      res.status(HttpStatus.OK).json({ success: true, message: MESSAGES.ARTIST_TRACKS_LIST_SUCCESS, tracks });
    } catch (error) {
      next(error);
    }
  }

  async fetchAllTrack(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tracks = await this._adminUseCase.getAllTracks();
      res.status(HttpStatus.OK).json({ data: tracks });
    } catch (error: unknown) {
      next(error);
    }
  }
  async updateVerificationStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { status, feedback } = req.body;
      const id = req.query.id;
      const update = await this._adminUseCase.updateVerificationStatus(status as string, feedback as string, id as string);
      res.status(HttpStatus.OK).json({ success: true, message: MESSAGES.VERIFICATION_STATUS_UPDATED, data: update });
    } catch (error) {
      next(error);
    }
  }
}
