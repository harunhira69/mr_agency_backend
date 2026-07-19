
import express, { Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import config from "./config";

const app = express();

app.use(cors({
    origin:config.app_url,
    credentials:true
}))





app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookieParser())



app.get("/", async (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "GearUp API is running successfully",
  });
});





export default app