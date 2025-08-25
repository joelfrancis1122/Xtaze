import express from "express";
import upload from "../../middlewares/uploadMiddleware";
import { uploadTrack, getAllTracks } from "../../../presentation/controller/track.controller";
import { authenticateUser } from "../../middlewares/authMiddleware";

const router = express.Router();
//special 
router.get("/getAllTracks",authenticateUser, getAllTracks);
router.post("/upload", upload.fields([{ name: "song", maxCount: 1 }, { name: "image", maxCount: 1 }]), uploadTrack);
export default router;
