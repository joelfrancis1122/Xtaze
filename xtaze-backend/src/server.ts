import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import userRoutes from "./presentation/routes/userRoutes";
import musicRoutes from "./presentation/routes/MusicRoutes";
import trackRoutes from './presentation/routes/trackRoutes'
import connectDB from "./infrastructure/db/conectDB";

dotenv.config();

const app = express();

// CORS configuration
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/songs", musicRoutes);
app.use("/user", userRoutes);
app.use('/provider', trackRoutes);

// Database connection
connectDB();

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
