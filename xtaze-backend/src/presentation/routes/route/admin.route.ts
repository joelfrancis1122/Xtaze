import express, { NextFunction, Request, Response } from "express";
import GenreController from "../../../presentation/controller/genre.controller";
import AdminController from "../../../presentation/controller/admin.controller";
import { authenticateAdmin} from "../../middlewares/authMiddleware";
import ArtistController from "../../../presentation/controller/artist.controller";
import upload from "../../middlewares/uploadMiddleware";
import UserController from "../../../presentation/controller/user.controller";
import container from "../../../domain/constants/inversify.config";

const router = express.Router();
const genreController = container.get<GenreController>(GenreController);
const adminController = container.get<AdminController>(AdminController)
const artistController = container.get<ArtistController>(ArtistController)
const userController = container.get<UserController>(UserController);

router.post("/login",(req:Request,res:Response,next:NextFunction)=>adminController.login(req,res,next))

router.get("/genreList",authenticateAdmin,(req:Request,res:Response,next:NextFunction)=>genreController.listGenre(req,res,next))
router.post("/genreCreate",authenticateAdmin,(req:Request,res:Response,next:NextFunction)=>genreController.createGenre(req,res,next))
router.put("/genreToggleBlockUnblock/:id", authenticateAdmin,(req: Request, res: Response, next: NextFunction) =>genreController.toggleBlockUnblockGenre(req, res, next));
router.put("/genreUpdate/:id",authenticateAdmin,(req:Request,res:Response,next:NextFunction)=>genreController.editGenre(req,res,next))
router.get("/listUsers",authenticateAdmin,(req:Request,res:Response,next:NextFunction)=>artistController.listArtists(req,res,next))
router.get("/listActiveArtists",authenticateAdmin,(req:Request,res:Response,next:NextFunction)=>artistController.listActiveArtists(req,res,next))
router.get("/fetchAllArtistsVerification",authenticateAdmin,(req:Request,res:Response,next:NextFunction)=>adminController.fetchVerification(req,res,next))
router.get("/getAllTracksArtist",authenticateAdmin,(req:Request,res:Response,next:NextFunction)=>adminController.getAllTracksArtist(req,res,next))

router.post("/banners", authenticateAdmin,upload.single("image"),(req:Request,res:Response,next:NextFunction)=>adminController.banners(req,res,next))
router.get("/banners/all", authenticateAdmin,(req:Request,res:Response,next:NextFunction)=>adminController.allBanners(req,res,next))
router.get("/fetchAllTrack",authenticateAdmin,(req:Request,res:Response,next:NextFunction)=>userController.fetchAllTrack(req,res,next))
router.delete("/banners/:id",(req:Request,res:Response,next:NextFunction)=>adminController.deleteBanner(req,res,next))
router.put("/banners/:id",upload.single("image"),(req:Request,res:Response,next:NextFunction)=>adminController.updateBanner(req,res,next))

router.patch("/toggleBlock/:id",(req:Request,res:Response,next:NextFunction)=>adminController.toggleblockArtist(req,res,next))
router.post("/stripe/createProduct",(req:Request,res:Response,next:NextFunction)=>adminController.createProduct(req,res,next))
router.get("/stripe/plans",(req:Request,res:Response,next:NextFunction)=>adminController.getPlans(req,res,next))
router.post("/stripe/products/delete",(req:Request,res:Response,next:NextFunction)=>adminController.archiveSubscriptionPlan(req,res,next))
router.put("/stripe/products/",(req:Request,res:Response,next:NextFunction)=>adminController.updateSubscriptionPlan(req,res,next))

router.get("/coupons",(req:Request,res:Response,next:NextFunction)=>adminController.getCoupons(req,res,next))
router.post("/coupons",(req:Request,res:Response,next:NextFunction)=>adminController.createCoupon(req,res,next))
router.put("/coupons",(req:Request,res:Response,next:NextFunction)=>adminController.updateCoupon(req,res,next))
router.delete("/coupons",(req:Request,res:Response,next:NextFunction)=>adminController.deleteCoupon(req,res,next))
router.post("/coupons/verify",(req:Request,res:Response,next:NextFunction)=>adminController.verifyCoupon(req,res,next))
router.get("/stripe/subscription-history", (req: Request, res: Response, next: NextFunction) => userController.getSubscriptionHistory(req, res, next));

router.get("/music/monetization", (req: Request, res: Response, next: NextFunction) => adminController.getMusicMonetization(req, res, next));
router.post("/artistPayout", (req: Request, res: Response, next: NextFunction) => adminController.artistPayout(req, res, next));
router.post("/getUsersByIds", (req: Request, res: Response, next: NextFunction) => adminController.getUsersByIds(req, res, next));
router.put("/updateVerificationStatus", (req: Request, res: Response, next: NextFunction) => adminController.updateVerificationStatus(req, res, next));

export default router;

