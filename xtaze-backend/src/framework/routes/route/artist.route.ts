import express, { NextFunction, Request, Response } from "express";
import ArtistController from "../../../adapter/controller/artist.controller";
import artistDependencies from "../../dependencies/artist.dependencies";


const artistController = new ArtistController(artistDependencies)
const router = express.Router();



router.post("/login",(req:Request,res:Response,next:NextFunction)=>artistController.login(req,res,next))
export default router;
