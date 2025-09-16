import express from "express";
import { DeezerController } from "../../../presentation/controller/deezer.controller";
import container from "../../../domain/constants/inversify.config";

const router = express.Router();

const deezerController = container.get<DeezerController>(DeezerController);
router.get("/deezer", (req, res) => deezerController.getDeezerSongs(req, res));

export default router;
