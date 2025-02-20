import { NextFunction, Request, Response } from "express";
import IAdminUseCase from "../../domain/usecase/IAdminUseCase";

interface Dependencies{
    adminUseCase:IAdminUseCase
}


export default class AdminController{
    private _adminUseCase:IAdminUseCase
    constructor(dependencies:Dependencies){
        this._adminUseCase = dependencies.adminUseCase
    }
async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;
      console.log("email",req.body)
      const response = await this._adminUseCase.login(email, password);
      if (!response.success) {
          res.status(400).json(response);  // Send error response with message
          return 
      }
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
      async toggleblockArtist(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { id } = req.params;
    console.log("id kitty ",id)
    const updatedStatus = await this._adminUseCase.toggleBlockUnblockArtist(id);
    res.status(200).json({ success: true, message: "Genre status updated", data: updatedStatus });
  }
}
