import express, { NextFunction, Request, Response } from "express";
import GenreController from "../../../adapter/controller/genre.controller";
import genreDependencies from "../../dependencies/genre.dependencies";
import AdminController from "../../../adapter/controller/admin.controller";
import adminDependencies from "../../dependencies/admin.dependencies";
import { authenticateAdmin} from "../../middlewares/authMiddleware";
import ArtistController from "../../../adapter/controller/artist.controller";
import artistDependencies from "../../dependencies/artist.dependencies";
import upload from "../../middlewares/uploadMiddleware";

const router = express.Router();

const genreController=new GenreController(genreDependencies)
const adminController = new AdminController(adminDependencies)
const artistController = new ArtistController(artistDependencies)


router.get("/genreList",authenticateAdmin,(req:Request,res:Response,next:NextFunction)=>genreController.listGenre(req,res,next))
router.post("/genreCreate",authenticateAdmin,(req:Request,res:Response,next:NextFunction)=>genreController.createGenre(req,res,next))
router.put("/genreToggleBlockUnblock/:id", authenticateAdmin,(req: Request, res: Response, next: NextFunction) =>genreController.toggleBlockUnblockGenre(req, res, next));
router.put("/genreUpdate/:id",authenticateAdmin,(req:Request,res:Response,next:NextFunction)=>genreController.editGenre(req,res,next))
router.get("/listUsers",authenticateAdmin,(req:Request,res:Response,next:NextFunction)=>artistController.listArtists(req,res,next))

router.post("/login",(req:Request,res:Response,next:NextFunction)=>adminController.login(req,res,next))
router.post("/banners", authenticateAdmin,upload.single("image"),(req:Request,res:Response,next:NextFunction)=>adminController.banners(req,res,next))
router.get("/banners/all", authenticateAdmin,(req:Request,res:Response,next:NextFunction)=>adminController.allBanners(req,res,next))
router.delete("/banners/:id",(req:Request,res:Response,next:NextFunction)=>adminController.deleteBanner(req,res,next))
router.put("/banners/:id",upload.single("image"),(req:Request,res:Response,next:NextFunction)=>adminController.updateBanner(req,res,next))

router.patch("/toggleBlock/:id",(req:Request,res:Response,next:NextFunction)=>adminController.toggleblockArtist(req,res,next))

router.post("/stripe/createProduct",(req:Request,res:Response,next:NextFunction)=>adminController.createProduct(req,res,next))
router.get("/stripe/plans",(req:Request,res:Response,next:NextFunction)=>adminController.getPlans(req,res,next))
router.post("/stripe/products/delete",(req:Request,res:Response,next:NextFunction)=>adminController.archiveSubscriptionPlan(req,res,next))
router.put("/stripe/products/",(req:Request,res:Response,next:NextFunction)=>adminController.updateSubscriptionPlan(req,res,next))
export default router;

