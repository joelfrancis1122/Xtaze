import express from "express";
import { DeezerController } from "../../../presentation/controller/deezer.controller";
import { DeezerRepository } from "../../../infrastructure/repositories/deezer.repository";
import { FetchDeezerSongsUseCase } from "../../../Application/usecases/deezer.usecase";

const router = express.Router();

// Dependency Injection
const deezerRepository = new DeezerRepository();
const fetchDeezerSongsUseCase = new FetchDeezerSongsUseCase(deezerRepository);
const deezerController = new DeezerController(fetchDeezerSongsUseCase);
// Route

router.get("/deezer", (req, res) => deezerController.getDeezerSongs(req, res));

export default router;
