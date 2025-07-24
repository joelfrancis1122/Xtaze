import express, { NextFunction, Request, Response } from "express";
import UserController from "../../../adapter/controller/user.controller";
import userDependencies from "../../dependencies/user.dependencies";
import upload from "../../middlewares/uploadMiddleware";
import { authenticateUser } from "../../middlewares/authMiddleware";
import artistDependencies from "../../dependencies/artist.dependencies";
import ArtistController from "../../../adapter/controller/artist.controller";
import adminDependencies from "../../dependencies/admin.dependencies";
import AdminController from "../../../adapter/controller/admin.controller";

const router = express.Router();
    
const userController = new UserController(userDependencies)
const artistController = new ArtistController(artistDependencies)
const adminController = new AdminController(adminDependencies)

router.post("/checkUsername", (req: Request, res: Response, next: NextFunction) => userController.checkUsername(req, res, next));
router.post("/forgotPassword", (req: Request, res: Response, next: NextFunction) => userController.forgotPassword(req, res, next));
router.post("/resetPassword", (req: Request, res: Response, next: NextFunction) => userController.resetPassword(req, res, next));
router.post("/register", (req: Request, res: Response, next: NextFunction) => userController.registerUser(req, res, next));
router.post("/send-otp", (req: Request, res: Response, next: NextFunction) => userController.sendOTP(req, res, next));
router.post("/verify-otp", (req:Request, res:Response, next:NextFunction) => userController.verifyOTP(req,res,next))
router.post("/login", (req: Request, res: Response, next: NextFunction) => userController.loginUser(req, res, next));
router.post("/google-login", (req: Request, res: Response, next: NextFunction) => userController.googleLogin(req, res, next));
router.post("/refresh",(req:Request,res:Response,next:NextFunction)=>userController.refreshToken(req,res,next))

router.post("/uploadProfilepic", authenticateUser,upload.single("profileImage"),(req:Request,res:Response,next:NextFunction)=>userController.uploadProfilepic(req,res,next))
router.put("/updateBio",authenticateUser,(req:Request,res:Response,next:NextFunction)=>userController.updateBio(req,res,next))

router.post("/checkOut",authenticateUser, async (req: Request, res: Response, next: NextFunction) => {await userController.checkOut(req, res, next)});
router.post("/toggle-like",authenticateUser,(req:Request,res:Response,next:NextFunction)=>userController.toggleLike(req,res,next))
router.post("/getliked",authenticateUser,(req:Request,res:Response,next:NextFunction)=>userController.getliked(req,res,next))
router.put("/updateImagePlaylist", authenticateUser,upload.single("imageUpload"),(req:Request,res:Response,next:NextFunction)=>userController.updateImagePlaylist(req,res,next))
router.get("/getTracksInPlaylist",authenticateUser,(req:Request,res:Response,next:NextFunction)=>userController.getTracksInPlaylist(req,res,next))
router.post("/updateBanner",authenticateUser, upload.single("coverImage"),(req:Request,res:Response,next:NextFunction)=>userController.uploadBanner(req,res,next))
router.get("/listArtists",authenticateUser,(req:Request,res:Response,next:NextFunction)=>artistController.listArtists(req,res,next))
router.get("/getAllTracksArtist",authenticateUser,(req:Request,res:Response,next:NextFunction)=>artistController.getAllTracksArtist(req,res,next))
router.get("/username",authenticateUser,(req:Request,res:Response,next:NextFunction)=>userController.username(req,res,next))
router.get("/fetchAllArtistsVerification",authenticateUser,(req:Request,res:Response,next:NextFunction)=>adminController.fetchVerification(req,res,next))
router.put("/usersName",authenticateUser,(req:Request,res:Response,next:NextFunction)=>userController.usernameUpdate(req,res,next))


router.post("/createPlaylist",authenticateUser,(req:Request,res:Response,next:NextFunction)=>userController.createPlaylist(req,res,next))
router.get("/getPlaylist",authenticateUser,(req:Request,res:Response,next:NextFunction)=>userController.getPlaylist(req,res,next))
router.post("/addToPlaylist",authenticateUser,(req:Request,res:Response,next:NextFunction)=>userController.addToPlaylist(req,res,next))
router.post("/deletePlaylist",authenticateUser,(req:Request,res:Response,next:NextFunction)=>userController.deletePlaylist(req,res,next))
router.put("/updateNamePlaylist",authenticateUser,(req:Request,res:Response,next:NextFunction)=>userController.updateNamePlaylist(req,res,next))
router.get("/banners",authenticateUser,(req:Request,res:Response,next:NextFunction)=>userController.allBanners(req,res,next))

router.get("/fetchAllTrack",authenticateUser,(req:Request,res:Response,next:NextFunction)=>userController.fetchAllTrack(req,res,next))
router.get("/fetchGenreTracks",authenticateUser,(req:Request,res:Response,next:NextFunction)=>userController.fetchGenreTracks(req,res,next))

router.put("/becomeArtist",authenticateUser,(req:Request,res:Response,next:NextFunction)=>userController.becomeArtist(req,res,next))

export default router;
