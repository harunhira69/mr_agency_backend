
import express, { Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import config from "./config";
import authRoutes from "./modules/auth/auth.routes";

const app = express();

app.use(cors({
    origin:config.app_url,
    credentials:true
}))





app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookieParser())

app.use("/api/auth", authRoutes);

app.get("/", async (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "MR Agency Backend is running",
  });
});




export default app
