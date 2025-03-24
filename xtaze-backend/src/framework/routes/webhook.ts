import express, { NextFunction, Request, Response } from "express";
import UserController from "../../adapter/controller/user.controller";
import userDependencies from "../dependencies/user.dependencies";

const router = express.Router();

const userController = new UserController(userDependencies)
router.post("/stripe", express.raw({ type: "application/json" }), (req:Request,res:Response,next:NextFunction)=>userController.handleWebhook(req,res,next));

export default router;
