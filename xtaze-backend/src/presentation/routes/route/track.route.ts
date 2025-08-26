import express, { NextFunction, Request, Response } from "express";
import upload from "../../middlewares/uploadMiddleware";
import { authenticateUser } from "../../middlewares/authMiddleware";
import container from "../../../domain/constants/inversify.config";
import TrackController from "../../controller/track.controller";

const trackController = container.get<TrackController>(TrackController);
const router = express.Router();
//special 

router.get("/getAllTracks",authenticateUser, (req:Request,res:Response,next:NextFunction)=>trackController.getAll(req,res,next));
router.get("/upload",upload.fields([{ name: "song", maxCount: 1 }, { name: "image", maxCount: 1 }]), (req:Request,res:Response,next:NextFunction)=>trackController.upload(req,res,next));

export default router;
