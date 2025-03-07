import express from "express";
import { DeezerController } from "../../../adapter/controller/deezer.controller";
import { FetchDeezerSongsUseCase } from "../../../usecases/deezer.usecase";
import { DeezerRepository } from "../../../adapter/repositories/deezer.repository";
import { authenticateUser } from "../../middlewares/authMiddleware";

const router = express.Router();

// Dependency Injection
const deezerRepository = new DeezerRepository();
const fetchDeezerSongsUseCase = new FetchDeezerSongsUseCase(deezerRepository);
const deezerController = new DeezerController(fetchDeezerSongsUseCase);

// Route
router.get("/deezer", (req, res) => deezerController.getDeezerSongs(req, res));

export default router;
