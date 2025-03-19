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
      console.log(req.body,req.params,"goit ogit ogit")
      const {id} = req.params
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
      if(!file){
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

}