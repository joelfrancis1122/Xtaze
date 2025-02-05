// src/infrastructure/routes/userRoutes.ts
import express from "express";
import { registerUserController } from "../../presentation/controllers/UserController";

const router = express.Router();

// Route for registering a user
router.post("/register", registerUserController);

export default router;
