import { Request, Response ,NextFunction} from "express";
import IArtistUseCase from "../../domain/usecase/IArtistUseCase";


interface Dependencies{
    artistUseCase:IArtistUseCase
}


export default class ArtistController{
    private _artistnUseCase:IArtistUseCase
    constructor(dependencies:Dependencies){
        this._artistnUseCase =dependencies.artistUseCase
    }
async login(req: Request, res: Response, next:NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;
      console.log("email",req.body)
      const response = await this._artistnUseCase.login(email, password);
      if (!response.success) {
          res.status(400).json(response);  // Send error response with message
          return 
      }
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
    
}