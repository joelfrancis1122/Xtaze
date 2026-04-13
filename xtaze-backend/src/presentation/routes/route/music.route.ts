import express from "express";
import { DeezerController } from "../../../presentation/controller/deezer.controller";
import container from "../../../domain/constants/inversify.config";
import { authenticateUser } from "../../middlewares/authMiddleware";

const router = express.Router();

const deezerController = container.get<DeezerController>(DeezerController);
router.get("/deezer", authenticateUser,(req, res) => deezerController.getDeezerSongs(req, res));

export default router;
