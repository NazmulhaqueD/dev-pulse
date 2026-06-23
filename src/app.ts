import express, { type Request, type Response } from "express";
import { authRoute } from "./modules/auth/auth.route";

const app = express();
const port = 5000;

// middleware
app.use(express.json());
app.use(express.text());
app.use(express.urlencoded({ extended: true }));

// api endpoint
app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "Welcome to the Dev-Pulse!!!",
  });
});
app.use('/api/auth',authRoute)

export default app;
