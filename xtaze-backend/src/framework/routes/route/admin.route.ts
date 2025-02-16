import express, { NextFunction, Request, Response } from "express";
import GenreController from "../../../adapter/controller/genre.controller";
import genreDependencies from "../../dependencies/genre.dependencies";
import AdminController from "../../../adapter/controller/admin.controller";
import adminDependencies from "../../dependencies/admin.dependencies";
import { authenticateUser } from "../../middlewares/authMiddleware";

const router = express.Router();

const genreController=new GenreController(genreDependencies)
const adminController = new AdminController(adminDependencies)
// router.post("/login", (req: Request, res: Response, next: NextFunction) => adminController.loginUser(req, res, next));


router.get("/genreList",authenticateUser,(req:Request,res:Response,next:NextFunction)=>genreController.listGenre(req,res,next))
router.post("/genreCreate",(req:Request,res:Response,next:NextFunction)=>genreController.createGenre(req,res,next))
router.put("/genreToggleBlockUnblock/:id", (req: Request, res: Response, next: NextFunction) =>genreController.toggleBlockUnblockGenre(req, res, next));
router.put("/genreUpdate/:id",(req:Request,res:Response,next:NextFunction)=>genreController.editGenre(req,res,next))

router.post("/login",(req:Request,res:Response,next:NextFunction)=>adminController.login(req,res,next))

export default router;

