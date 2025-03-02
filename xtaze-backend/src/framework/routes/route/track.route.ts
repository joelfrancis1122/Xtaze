import express from "express";
import upload from "../../middlewares/uploadMiddleware";
import { uploadTrack, getAllTracks } from "../../../adapter/controller/track.controller";
import { authenticateUser } from "../../middlewares/authMiddleware";

const router = express.Router();

router.get("/getAllTracks",authenticateUser, getAllTracks);








//special 
router.post("/upload", upload.fields([{ name: "song", maxCount: 1 }, { name: "image", maxCount: 1 }]), uploadTrack);
export default router;
