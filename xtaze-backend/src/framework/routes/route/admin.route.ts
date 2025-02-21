import express, { NextFunction, Request, Response } from "express";
import GenreController from "../../../adapter/controller/genre.controller";
import genreDependencies from "../../dependencies/genre.dependencies";
import AdminController from "../../../adapter/controller/admin.controller";
import adminDependencies from "../../dependencies/admin.dependencies";
import { authenticateUser } from "../../middlewares/authMiddleware";
import ArtistController from "../../../adapter/controller/artist.controller";
import artistDependencies from "../../dependencies/artist.dependencies";

const router = express.Router();

const genreController=new GenreController(genreDependencies)
const adminController = new AdminController(adminDependencies)
const artistController = new ArtistController(artistDependencies)
// router.post("/login", (req: Request, res: Response, next: NextFunction) => adminController.loginUser(req, res, next));


router.get("/genreList",(req:Request,res:Response,next:NextFunction)=>genreController.listGenre(req,res,next))
router.post("/genreCreate",(req:Request,res:Response,next:NextFunction)=>genreController.createGenre(req,res,next))
router.put("/genreToggleBlockUnblock/:id", (req: Request, res: Response, next: NextFunction) =>genreController.toggleBlockUnblockGenre(req, res, next));
router.put("/genreUpdate/:id",(req:Request,res:Response,next:NextFunction)=>genreController.editGenre(req,res,next))

router.post("/login",(req:Request,res:Response,next:NextFunction)=>adminController.login(req,res,next))

router.patch("/toggleBlock/:id",(req:Request,res:Response,next:NextFunction)=>adminController.toggleblockArtist(req,res,next))
router.get("/listUsers",authenticateUser,(req:Request,res:Response,next:NextFunction)=>artistController.listArtists(req,res,next))

export default router;

