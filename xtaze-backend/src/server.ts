import express from "express";
import cors from "cors";
import dotenv from "dotenv";
const app = express();
import userRoutes from "./presentation/routes/userRoutes";

dotenv.config();
app.get("/",(req,res)=>{
    res.send("poda ")
})
app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

app.use("/api", userRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
