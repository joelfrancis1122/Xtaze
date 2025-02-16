import express, { NextFunction, Request, Response } from "express";
import UserController from "../../../adapter/controller/user.controller";
import userDependencies from "../../dependencies/user.dependencies";

const router = express.Router();

const userController = new UserController(userDependencies)

router.post("/register", (req: Request, res: Response, next: NextFunction) => userController.registerUser(req, res, next));
router.post("/send-otp", (req: Request, res: Response, next: NextFunction) => userController.sendOTP(req, res, next));
router.post("/verify-otp", (req:Request, res:Response, next:NextFunction) => userController.verifyOTP(req,res,next))
router.post("/login", (req: Request, res: Response, next: NextFunction) => userController.loginUser(req, res, next));


export default router;
