import express, { NextFunction, Request, Response } from "express";
import UserController from "../../../adapter/controller/user.controller";
import userDependencies from "../../dependencies/user.dependencies";
import upload from "../../middlewares/uploadMiddleware";
import { authenticateUser } from "../../middlewares/authMiddleware";

const router = express.Router();

const userController = new UserController(userDependencies)

router.post("/checkUsername", (req: Request, res: Response, next: NextFunction) => userController.checkUsername(req, res, next));
router.post("/forgotPassword", (req: Request, res: Response, next: NextFunction) => userController.forgotPassword(req, res, next));
router.post("/resetPassword", (req: Request, res: Response, next: NextFunction) => userController.resetPassword(req, res, next));
router.post("/register", (req: Request, res: Response, next: NextFunction) => userController.registerUser(req, res, next));
router.post("/send-otp", (req: Request, res: Response, next: NextFunction) => userController.sendOTP(req, res, next));
router.post("/verify-otp", (req:Request, res:Response, next:NextFunction) => userController.verifyOTP(req,res,next))
router.post("/login", (req: Request, res: Response, next: NextFunction) => userController.loginUser(req, res, next));
router.post("/google-login", (req: Request, res: Response, next: NextFunction) => userController.googleLogin(req, res, next));
router.post("/uploadProfilepic", authenticateUser,upload.single("profileImage"),(req:Request,res:Response,next:NextFunction)=>userController.uploadProfilepic(req,res,next))
router.put("/updateBio",authenticateUser,(req:Request,res:Response,next:NextFunction)=>userController.updateBio(req,res,next))
router.post("/checkOut",authenticateUser, async (req: Request, res: Response, next: NextFunction) => {await userController.checkOut(req, res, next)});
router.post("/toggle-like",authenticateUser,(req:Request,res:Response,next:NextFunction)=>userController.toggleLike(req,res,next))
router.post("/getliked",authenticateUser,(req:Request,res:Response,next:NextFunction)=>userController.getliked(req,res,next))
router.post("/refresh",(req:Request,res:Response,next:NextFunction)=>userController.refreshToken(req,res,next))
router.post("/createPlaylist",(req:Request,res:Response,next:NextFunction)=>userController.createPlaylist(req,res,next))
router.get("/getPlaylist",(req:Request,res:Response,next:NextFunction)=>userController.getPlaylist(req,res,next))
router.post("/addToPlaylist",(req:Request,res:Response,next:NextFunction)=>userController.addToPlaylist(req,res,next))
router.post("/deletePlaylist",(req:Request,res:Response,next:NextFunction)=>userController.deletePlaylist(req,res,next))
router.put("/updateNamePlaylist",(req:Request,res:Response,next:NextFunction)=>userController.updateNamePlaylist(req,res,next))
router.put("/updateImagePlaylist", authenticateUser,upload.single("imageUpload"),(req:Request,res:Response,next:NextFunction)=>userController.updateImagePlaylist(req,res,next))
router.get("/banners",(req:Request,res:Response,next:NextFunction)=>userController.allBanners(req,res,next))

router.get("/getTracksInPlaylist",authenticateUser,(req:Request,res:Response,next:NextFunction)=>userController.getTracksInPlaylist(req,res,next))
router.post("/updateBanner",authenticateUser, upload.single("coverImage"),(req:Request,res:Response,next:NextFunction)=>userController.uploadBanner(req,res,next))
router.get("/fetchAllTrack",(req:Request,res:Response,next:NextFunction)=>userController.fetchAllTrack(req,res,next))
router.get("/fetchGenreTracks",(req:Request,res:Response,next:NextFunction)=>userController.fetchGenreTracks(req,res,next))

router.put("/becomeArtist",(req:Request,res:Response,next:NextFunction)=>userController.becomeArtist(req,res,next))

export default router;
