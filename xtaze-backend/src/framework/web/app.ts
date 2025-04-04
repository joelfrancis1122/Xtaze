import express from "express";
import cors, { CorsOptions } from "cors";
import dotenv from "dotenv";
import route from "../routes/index"
import stripeRoute from "../routes/webhook"
import errorMiddleware from "../middlewares/errorMiddleware";
import notFoundHandler from "../middlewares/notFoundMiiddleware";
import cookieParser from 'cookie-parser'
import { setupCronJobs } from "../routes/cron/cronJobs";
dotenv.config();

const app = express();
// const corsOptions:CorsOptions = {origin:[process.env.URL!],credentials:true}
// app.use(cors(corsOptions));


app.use(cors({
    origin: 'https://xtaze.fun',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
  }));
  
  app.options('*', cors());
app.use('/webhook', stripeRoute)
app.use(express.json());
app.use(cookieParser())
app.use('/', route)
app.use(notFoundHandler);
app.use(errorMiddleware);
setupCronJobs()
export default app
