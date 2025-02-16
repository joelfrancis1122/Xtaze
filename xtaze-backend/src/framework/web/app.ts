import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import route from "../routes/index"

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/', route)

export default app
