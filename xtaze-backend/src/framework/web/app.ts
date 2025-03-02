import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import route from "../routes/index"
import errorMiddleware from "../middlewares/errorMiddleware";
import notFoundHandler from "../middlewares/notFoundMiiddleware";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/', route)
app.use(notFoundHandler);
app.use(errorMiddleware);

export default app
