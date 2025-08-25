import express, { NextFunction, Request, Response } from "express";
import UserController from "../../presentation/controller/user.controller";
import container from "../../domain/constants/inversify.config";

const router = express.Router();

// const userController = new UserController(userDependencies)
const userController= container.get<UserController>(UserController)
router.post("/stripe", express.raw({ type: "application/json" }), (req:Request,res:Response,next:NextFunction)=>userController.handleWebhook(req,res,next));
router.get("/stripe/subscription-history", (req: Request, res: Response, next: NextFunction) => userController.getSubscriptionHistory(req, res, next));
export default router;
