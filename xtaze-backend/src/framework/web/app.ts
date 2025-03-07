import express from "express";
import cors, { CorsOptions } from "cors";
import dotenv from "dotenv";
import route from "../routes/index"
import errorMiddleware from "../middlewares/errorMiddleware";
import notFoundHandler from "../middlewares/notFoundMiiddleware";
import cookieParser from 'cookie-parser'
dotenv.config();

const app = express();
const corsOptions:CorsOptions = {origin:[process.env.URL!],credentials:true}
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser())
app.use('/', route)
app.use(notFoundHandler);
app.use(errorMiddleware);

export default app
