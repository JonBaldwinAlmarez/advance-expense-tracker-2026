import express, { Request, Response } from "express";
import cors from "cors";
import "dotenv";
import { connectDB } from "./config/db.js";
import userRouter from "./routes/userRoutes.js";

const app = express();
const port = 4000;

// middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// database
connectDB();

// routes
app.use("/api/user", userRouter);

app.get("/", (req: Request, res: Response) => {
  res.send("api is working");
});

app.listen(port, () => {
  console.log(`Server started on http://localhost:${port}`);
});
