import express, { NextFunction, Request, Response } from "express";
import ArtistController from "../../../adapter/controller/artist.controller";
import artistDependencies from "../../dependencies/artist.dependencies";
import upload from "../../middlewares/uploadMiddleware";
import GenreController from "../../../adapter/controller/genre.controller";
import genreDependencies from "../../dependencies/genre.dependencies";
import { authenticateArtist } from "../../middlewares/authMiddleware";


const artistController = new ArtistController(artistDependencies)
const genreController = new GenreController(genreDependencies)
const router = express.Router();



router.post("/login",(req:Request,res:Response,next:NextFunction)=>artistController.login(req,res,next))
router.post("/upload",authenticateArtist,upload.fields([{ name: "file", maxCount: 1 }, { name: "image", maxCount: 1 }]),(req:Request,res:Response,next:NextFunction)=>artistController.uploadTracks(req,res,next))
router.get("/listActiveGenres",authenticateArtist,(req:Request,res:Response,next:NextFunction)=>genreController.listActiveGenres(req,res,next))
router.get("/getAllTracksArtist",authenticateArtist,(req:Request,res:Response,next:NextFunction)=>artistController.getAllTracksArtist(req,res,next))
router.post("/incrementListeners",authenticateArtist,(req:Request,res:Response,next:NextFunction)=>artistController.incrementListeners(req,res,next))





// router.get("/listUsers",authenticateArtist,(req:Request,res:Response,next:NextFunction)=>artistController.listArtists(req,res,next))
// router.get("/toggleBlock/:id:",(req:Request,res:Response,next:NextFunction)=>artistController.toggleblockArtist(req,res,next))
// router.post("/upload",upload.any(),(req:Request,res:Response,next:NextFunction)=>artistController.uploadTracks(req,res,next))
export default router;
