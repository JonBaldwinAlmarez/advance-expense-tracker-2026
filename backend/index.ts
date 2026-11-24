import express, { Request, Response } from "express";
import cors from "cors";
import "dotenv";

const app = express();
const port = 4000;

// middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// database

// routes

app.get("/", (req: Request, res: Response) => {
  res.send("api is working");
});

app.listen(port, () => {
  console.log(`Server started on http://localhost:${port}`);
});
