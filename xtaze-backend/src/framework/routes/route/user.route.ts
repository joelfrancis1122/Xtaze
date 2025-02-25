import express, { NextFunction, Request, Response } from "express";
import UserController from "../../../adapter/controller/user.controller";
import userDependencies from "../../dependencies/user.dependencies";
import upload from "../../middlewares/uploadMiddleware";

const router = express.Router();

const userController = new UserController(userDependencies)

router.post("/checkUsername", (req: Request, res: Response, next: NextFunction) => userController.checkUsername(req, res, next));
router.post("/register", (req: Request, res: Response, next: NextFunction) => userController.registerUser(req, res, next));
router.post("/send-otp", (req: Request, res: Response, next: NextFunction) => userController.sendOTP(req, res, next));
router.post("/verify-otp", (req:Request, res:Response, next:NextFunction) => userController.verifyOTP(req,res,next))
router.post("/login", (req: Request, res: Response, next: NextFunction) => userController.loginUser(req, res, next));
console.log("ith")
// router.post("/uploadProfilepic", upload.fields([ { name: "profileImage", maxCount: 1 }]),(req:Request,res:Response,next:NextFunction)=>userController.uploadProfilepic(req,res,next))
   router.post("/uploadProfilepic", upload.single("profileImage"),(req:Request,res:Response,next:NextFunction)=>userController.uploadProfilepic(req,res,next))
   router.post("/updateBanner", upload.single("coverImage"),(req:Request,res:Response,next:NextFunction)=>userController.uploadBanner(req,res,next))
   router.put("/updateBio",(req:Request,res:Response,next:NextFunction)=>userController.updateBio(req,res,next))

export default router;
