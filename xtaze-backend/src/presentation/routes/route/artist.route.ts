import express, { NextFunction, Request, Response } from "express";
import ArtistController from "../../../presentation/controller/artist.controller";
import upload from "../../middlewares/uploadMiddleware";
import GenreController from "../../../presentation/controller/genre.controller";
import { authenticateArtist, authenticateUser } from "../../middlewares/authMiddleware";
import container from "../../../domain/constants/inversify.config";


const artistController = container.get<ArtistController>(ArtistController)
const genreController = container.get<GenreController>(GenreController);

const router = express.Router();



router.post("/login",(req:Request,res:Response,next:NextFunction)=>artistController.login(req,res,next))
router.post("/refresh",(req:Request,res:Response,next:NextFunction)=>artistController.refreshToken(req,res,next))

router.post("/upload",authenticateArtist,upload.fields([{ name: "file", maxCount: 1 }, { name: "image", maxCount: 1 }]),(req:Request,res:Response,next:NextFunction)=>artistController.uploadTracks(req,res,next))
router.get("/albums",authenticateArtist,(req:Request,res:Response,next:NextFunction)=>artistController.allAlbums(req,res,next))
router.get("/albumsongs",authenticateArtist,(req:Request,res:Response,next:NextFunction)=>artistController.albumsongs(req,res,next))

router.post("/albumsa",authenticateArtist,upload.fields([{ name: "file", maxCount: 1 }, { name: "coverImage", maxCount: 1 }]),(req:Request,res:Response,next:NextFunction)=>artistController.uploadAlbums(req,res,next))
router.get("/listActiveGenres",authenticateArtist,(req:Request,res:Response,next:NextFunction)=>genreController.listActiveGenres(req,res,next))
router.get("/getAllTracksArtist",authenticateArtist,(req:Request,res:Response,next:NextFunction)=>artistController.getAllTracksArtist(req,res,next))
router.post("/incrementListeners",authenticateArtist,(req:Request,res:Response,next:NextFunction)=>artistController.incrementListeners(req,res,next))
router.get("/statsOfArtist",authenticateArtist,(req:Request,res:Response,next:NextFunction)=>artistController.statsOfArtist(req,res,next))

router.get("/checkcard",authenticateArtist,(req:Request,res:Response,next:NextFunction)=>artistController.checkcard(req,res,next))
router.post("/saveCard",authenticateArtist,(req:Request,res:Response,next:NextFunction)=>artistController.saveCard(req,res,next))

router.put("/updateTrackByArtist",authenticateArtist,upload.fields([{ name: "fileUrl", maxCount: 1 }, { name: "img", maxCount: 1 }]),(req:Request,res:Response,next:NextFunction)=>artistController.updateTrackByArtist(req,res,next))
router.get("/getVerificationStatus",authenticateArtist,(req:Request,res:Response,next:NextFunction)=>artistController.getVerificationStatus(req,res,next))
router.post("/requestVerification",authenticateArtist,upload.fields([{ name: "idProof", maxCount: 1 }, { name: "img", maxCount: 1 }]),(req:Request,res:Response,next:NextFunction)=>artistController.requestVerification(req,res,next))
router.put("/usersName",authenticateArtist,(req:Request,res:Response,next:NextFunction)=>artistController.usernameUpdate(req,res,next))

export default router;
