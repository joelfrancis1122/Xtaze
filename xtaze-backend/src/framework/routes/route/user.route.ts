import express, { NextFunction, Request, Response } from "express";
import UserController from "../../../adapter/controller/user.controller";
import userDependencies from "../../dependencies/user.dependencies";
import upload from "../../middlewares/uploadMiddleware";
import { authenticateUser } from "../../middlewares/authMiddleware";

const router = express.Router();

const userController = new UserController(userDependencies)

router.post("/checkUsername", (req: Request, res: Response, next: NextFunction) => userController.checkUsername(req, res, next));
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
router.post("/updateBanner",authenticateUser, upload.single("coverImage"),(req:Request,res:Response,next:NextFunction)=>userController.uploadBanner(req,res,next))
export default router;
