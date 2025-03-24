import { NextFunction, Request, Response } from "express";
import IAdminUseCase from "../../domain/usecase/IAdminUseCase";
import AppError from "../../utils/AppError";
import { IBanner } from "../../domain/entities/IBanner";

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
      console.log("email", req.body);

      const response = await this._adminUseCase.login(email, password);
      if (!response.success) {
        throw new AppError(response.message || "Login failed", 400);
      }

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
  async banners(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { title, description, action, isActive, createdBy } = req.body;
      const file = req.file;

      console.log("Request Body:", req.body, "File:", req.file);

      if (!file) {
        throw new AppError("Banner image is required", 400);
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
        throw new AppError("Failed to add banner", 400);
      }

      res.status(201).json({ message: "Banner added successfully", data: response });

    } catch (error) {
      next(error);
    }
  }

  async allBanners(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {


      const allBanners = await this._adminUseCase.getAllBanners()
      res.status(201).json({ message: "Banner added successfully", data: allBanners });

    } catch (error) {
      next(error);
    }
  }

  async deleteBanner(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      console.log(req.body, req.params, "goit ogit ogit")
      const { id } = req.params
      const deletedBanner = await this._adminUseCase.deleteBanner(id)
      res.status(201).json({ message: "Banner added successfully", data: deletedBanner });

    } catch (error) {
      next(error);
    }
  }

  async updateBanner(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      console.log(req.body, req.params, "goit ogit akhildas", req.file);
      const { id } = req.params;
      const { title, description, action, isActive } = req.body;

      const file = req.file;
      if (!file) {
        console.log(console.log("sassaa"))
        return
      }
      // Call the use case with the file, now guaranteed to be present
      const updated = await this._adminUseCase.updateBanner(id, title, description, action, isActive, file);

      res.status(201).json({ message: "Banner updated successfully", data: updated });

    } catch (error) {
      next(error);
    }
  }




  async toggleblockArtist(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      if (!id) {
        throw new AppError("Artist ID is required", 400);
      }

      console.log("id kitty ", id);
      const updatedStatus = await this._adminUseCase.toggleBlockUnblockArtist(id);
      if (!updatedStatus) {
        throw new AppError("Artist not found or status update failed", 404); // Adjust based on use case response
      }

      res.status(200).json({ success: true, message: "Genre status updated", data: updatedStatus });
    } catch (error) {
      next(error);
    }
  }
  async createProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name, description, price, interval } = req.body;

      console.log(req.body, "admin stripe ")
      if (!name || !price || !interval) {
        throw new AppError("Name, price, and interval are required", 400);
      }

      const plan = await this._adminUseCase.createPlan(name, description, price, interval);
      res.status(201).json({ success: true, data: plan });
    } catch (error) {
      next(error);
    }

  }
  async getPlans(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const plans = await this._adminUseCase.getPlans();
      res.status(200).json({ success: true, data: plans });
    } catch (error) {
      next(error);
    }

  }
  async archiveSubscriptionPlan(req: Request, res: Response, next: NextFunction) {
    try {
      const productId = req.query.productId;

      if (!productId) {
        throw new AppError("Product ID is required", 400);
      }

      const archivedProduct = await this._adminUseCase.archivePlan(productId as string);
      console.log("set ayo")
      res.status(200).json({ success: true, data: archivedProduct });
    } catch (error) {
      next(error);
    }
  }
  async updateSubscriptionPlan(req: Request, res: Response, next: NextFunction) {
    try {
      const productId = req.query.productId;
      const { name, description, price, interval } = req.body;
      console.log(req.body, req.params)
      if (!productId || !name || !price || !interval) {
        throw new AppError("Product ID, name, price, and interval are required", 400);
      }

      const updatedPlan = await this._adminUseCase.updatePlan(productId as string, name, description, price, interval);
      res.status(200).json({ success: true, data: updatedPlan });
    } catch (error) {
      next(error);
    }
  }



  async getCoupons(req: Request, res: Response, next: NextFunction) {
    try {

      const result = await this._adminUseCase.getCoupons()
      console.log(result, "ododododo")
      res.status(201).json({success: true,data: result});
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
        res.status(400).json({ success: false, message: "Failed to create coupon" });
      }

      res.status(201).json({
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
      console.log(req.query,"what al")

      const deletedCoupon = await this._adminUseCase.deleteCoupon(couponId as string)
      if (!deletedCoupon) {
        res.status(400).json({ success: false, message: "Failed to delete coupon" });
      }

      res.status(200).json({
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

      console.log("Params:", req.params); // Debug
      console.log("Body:", req.body); // Debug

      const updateData = {
        code,
        discountAmount,
        expires,
        maxUses,
      };

      const updatedCoupon = await this._adminUseCase.updateCoupon(couponId as string, updateData);

      res.status(200).json({
        success: true,
        data: updatedCoupon,
      });
    } catch (error: any) {
      next(error);
    }
  }

  async verifyCoupon(req: Request, res: Response, next: NextFunction) {
    try {
      const { code } = req.body;
      const coupon = await this._adminUseCase.verifyCoupon(code);
      res.status(200).json({ success: true, data: coupon });
    } catch (error: any) {
      next(error);
    }
  }
}

