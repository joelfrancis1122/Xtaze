    // src/infrastructure/routes/userRoutes.ts
    import express from "express";
    import { registerUserController } from "../../presentation/controllers/UserController";
    import {  getAllTracks} from '../controllers/TrackController';

    const router = express.Router();

    router.post("/register", registerUserController);
    router.get("/getAllTracks", getAllTracks);

    export default router;
