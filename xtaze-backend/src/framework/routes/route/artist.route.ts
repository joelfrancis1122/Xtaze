import express, { NextFunction, Request, Response } from "express";
import ArtistController from "../../../adapter/controller/artist.controller";
import artistDependencies from "../../dependencies/artist.dependencies";
import upload from "../../middlewares/uploadMiddleware";
import GenreController from "../../../adapter/controller/genre.controller";
import genreDependencies from "../../dependencies/genre.dependencies";
import { authenticateArtist, authenticateUser } from "../../middlewares/authMiddleware";


const artistController = new ArtistController(artistDependencies)
const genreController = new GenreController(genreDependencies)
const router = express.Router();



router.post("/login",(req:Request,res:Response,next:NextFunction)=>artistController.login(req,res,next))
router.post("/refresh",(req:Request,res:Response,next:NextFunction)=>artistController.refreshToken(req,res,next))

router.post("/upload",authenticateArtist,upload.fields([{ name: "file", maxCount: 1 }, { name: "image", maxCount: 1 }]),(req:Request,res:Response,next:NextFunction)=>artistController.uploadTracks(req,res,next))
router.get("/listActiveGenres",authenticateArtist,(req:Request,res:Response,next:NextFunction)=>genreController.listActiveGenres(req,res,next))
router.get("/getAllTracksArtist",authenticateArtist,(req:Request,res:Response,next:NextFunction)=>artistController.getAllTracksArtist(req,res,next))
router.post("/incrementListeners",authenticateUser,(req:Request,res:Response,next:NextFunction)=>artistController.incrementListeners(req,res,next))
router.get("/statsOfArtist",(req:Request,res:Response,next:NextFunction)=>artistController.statsOfArtist(req,res,next))

router.get("/checkcard",(req:Request,res:Response,next:NextFunction)=>artistController.checkcard(req,res,next))
router.post("/saveCard",(req:Request,res:Response,next:NextFunction)=>artistController.saveCard(req,res,next))

router.put("/updateTrackByArtist",authenticateArtist,upload.fields([{ name: "fileUrl", maxCount: 1 }, { name: "img", maxCount: 1 }]),(req:Request,res:Response,next:NextFunction)=>artistController.updateTrackByArtist(req,res,next))
router.get("/getVerificationStatus",authenticateArtist,(req:Request,res:Response,next:NextFunction)=>artistController.getVerificationStatus(req,res,next))
router.post("/requestVerification",authenticateArtist,upload.fields([{ name: "idProof", maxCount: 1 }, { name: "img", maxCount: 1 }]),(req:Request,res:Response,next:NextFunction)=>artistController.requestVerification(req,res,next))

export default router;
