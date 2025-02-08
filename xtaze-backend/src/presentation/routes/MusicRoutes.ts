import express from "express";
import { getDeezerSongs } from "../controllers/MusicControllers";

const router = express.Router();

router.get("/deezer", getDeezerSongs);

export default router;
