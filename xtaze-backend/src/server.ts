import express from "express";
import cors from "cors";
import dotenv from "dotenv";
const app = express();
import userRoutes from "./presentation/routes/userRoutes";
import connectDB from "./infrastructure/db/conectDB";
dotenv.config();
app.get("/",(req,res)=>{
    res.send("poda ")
})
app.use(cors({ origin: 'http://localhost:5000',methods:["GET","POST","OPTIONS"] }));
app.use(express.json());
connectDB();

app.use("/api", userRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
