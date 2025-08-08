import { NextFunction, Request, Response } from "express";
import IAdminUseCase from "../../domain/usecase/IAdminUseCase";
import { HttpStatus } from "../../domain/constants/httpStatus";
import AppError from "../../utils/AppError";

interface Dependencies {
  adminUseCase: IAdminUseCase;
}

export default class AdminController {
  private _adminUseCase: IAdminUseCase;

  constructor(dependencies: Dependencies) {
    this._adminUseCase = dependencies.adminUseCase;
  }



  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;

      const response = await this._adminUseCase.login(email, password);
      if (!response.success) {
        throw new AppError(response.message || "Login failed", HttpStatus.BAD_REQUEST);
      }

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }
  async banners(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { title, description, action, isActive, createdBy } = req.body;
      const file = req.file;


      if (!file) {
        throw new AppError("Banner image is required", HttpStatus.BAD_REQUEST);
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
        throw new AppError("Failed to add banner", HttpStatus.BAD_REQUEST);
      }

      res.status(HttpStatus.CREATED).json({ message: "Banner added successfully", data: response });

    } catch (error) {
      next(error);
    }
  }

  async allBanners(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {


      const allBanners = await this._adminUseCase.getAllBanners()
      res.status(HttpStatus.CREATED).json({ message: "Banner added successfully", data: allBanners });

    } catch (error) {
      next(error);
    }
  }

  async deleteBanner(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params
      const deletedBanner = await this._adminUseCase.deleteBanner(id)
      res.status(HttpStatus.CREATED).json({ message: "Banner added successfully", data: deletedBanner });

    } catch (error) {
      next(error);
    }
  }

  async updateBanner(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { title, description, action, isActive } = req.body;

      const file = req.file;
      if (!file) {
        return
      }
      // Call the use case with the file, now guaranteed to be present
      const updated = await this._adminUseCase.updateBanner(id, title, description, action, isActive, file);

      res.status(HttpStatus.CREATED).json({ message: "Banner updated successfully", data: updated });

    } catch (error) {
      next(error);
    }
  }




  async toggleblockArtist(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      if (!id) {
        throw new AppError("Artist ID is required", HttpStatus.BAD_REQUEST);
      }

      const updatedStatus = await this._adminUseCase.toggleBlockUnblockArtist(id);
      if (!updatedStatus) {
        throw new AppError("Artist not found or status update failed", HttpStatus.NOT_FOUND); // Adjust based on use case response
      }

      res.status(HttpStatus.OK).json({ success: true, message: "Genre status updated", data: updatedStatus });
    } catch (error) {
      next(error);
    }
  }
  async createProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name, description, price, interval } = req.body;

      if (!name || !price || !interval) {
        throw new AppError("Name, price, and interval are required", HttpStatus.BAD_REQUEST);
      }

      const plan = await this._adminUseCase.createPlan(name, description, price, interval);
      res.status(HttpStatus.CREATED).json({ success: true, data: plan });
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
        throw new AppError("Product ID is required", HttpStatus.BAD_REQUEST);
      }

      const archivedProduct = await this._adminUseCase.archivePlan(productId as string);
      res.status(HttpStatus.OK).json({ success: true, data: archivedProduct });
    } catch (error) {
      next(error);
    }
  }
  async updateSubscriptionPlan(req: Request, res: Response, next: NextFunction) {
    try {
      const productId = req.query.productId;
      const { name, description, price, interval } = req.body;
      if (!productId || !name || !price || !interval) {
        throw new AppError("Product ID, name, price, and interval are required", HttpStatus.BAD_REQUEST);
      }

      const updatedPlan = await this._adminUseCase.updatePlan(productId as string, name, description, price, interval);
      res.status(HttpStatus.OK).json({ success: true, data: updatedPlan });
    } catch (error) {
      next(error);
    }
  }



  async getCoupons(req: Request, res: Response, next: NextFunction) {
    try {

      const result = await this._adminUseCase.getCoupons()
      res.status(HttpStatus.CREATED).json({ success: true, data: result });
    } catch (error) {
      next(error)
    }

  }

  async createCoupon(req: Request, res: Response, next: NextFunction) {
    try {
      const { code, discountAmount, expires, maxUses, uses } = req.body;

      // Convert expires string to Date
      const expiresDate = new Date(expires);

      const result = await this._adminUseCase.createCoupon(
        code,
        discountAmount,
        expiresDate, // Pass as Date
        maxUses,
        uses ?? 0 // Default to 0 if undefined
      );

      if (!result) {
        res.status(HttpStatus.BAD_REQUEST).json({ success: false, message: "Failed to create coupon" });
      }

      res.status(HttpStatus.CREATED).json({
        success: true,
        result,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteCoupon(req: Request, res: Response, next: NextFunction) {
    try {
      const couponId = req.query.id;

      const deletedCoupon = await this._adminUseCase.deleteCoupon(couponId as string)
      if (!deletedCoupon) {
        res.status(HttpStatus.BAD_REQUEST).json({ success: false, message: "Failed to delete coupon" });
      }

      res.status(HttpStatus.OK).json({
        success: true,
      });
    } catch (error) {
      next(error);
    }
  }
  async updateCoupon(req: Request, res: Response, next: NextFunction) {
    try {
      const couponId = req.query.id;
      const { code, discountAmount, expires, maxUses } = req.body;


      const updateData = {
        code,
        discountAmount,
        expires,
        maxUses,
      };

      const updatedCoupon = await this._adminUseCase.updateCoupon(couponId as string, updateData);

      res.status(HttpStatus.OK).json({
        success: true,
        data: updatedCoupon,
      });
    } catch (error: unknown) {
      next(error);
    }
  }

  async verifyCoupon(req: Request, res: Response, next: NextFunction) {
    try {
      const { code } = req.body;
      const coupon = await this._adminUseCase.verifyCoupon(code);
      res.status(HttpStatus.OK).json({ success: true, data: coupon });
    } catch (error: unknown) {
      next(error);
    }
  }

  async getMusicMonetization(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const monetizationData = await this._adminUseCase.getMusicMonetization();
      res.status(HttpStatus.OK).json({ data: monetizationData });
    } catch (error: unknown) {
      console.error("Error in getMusicMonetization controller:", error);
      next(error);
    }
  }

  async artistPayout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { artistName } = req.body
      const data = await this._adminUseCase.artistPayout(artistName);
      res.status(HttpStatus.OK).json({ data: data });
    } catch (error: unknown) {
      console.error("Error in payout controller:", error);
      next(error);
    }
  }

  async getUsersByIds(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userIds } = req.body

      const data = await this._adminUseCase.getUsersByIds(userIds);
      res.status(HttpStatus.OK).json({ data: data });
    } catch (error: unknown) {
      console.error("Error in getUsers controller:", error);
      next(error);
    }
  }


  async fetchVerification(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const verification = await this._adminUseCase.fetchVerification();
      res.status(HttpStatus.OK).json({ success: true, message: "List Of verification", data: verification });
    } catch (error) {
      next(error);
    }
  }

  async updateVerificationStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const {status,feedback} = req.body
      const id = req.query.id

      const update = await this._adminUseCase.updateVerificationStatus(status as string,feedback as string,id as string);
      res.status(HttpStatus.OK).json({ success: true, message: "List Of verification", data: update });
    } catch (error) {
      next(error);
    }
  }


}

