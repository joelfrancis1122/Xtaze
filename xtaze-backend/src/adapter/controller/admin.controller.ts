import { NextFunction, Request, Response } from "express";
import IAdminUseCase from "../../domain/usecase/IAdminUseCase";
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