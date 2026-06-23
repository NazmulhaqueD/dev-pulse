import express, { type Request, type Response } from "express";

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

export default app;
