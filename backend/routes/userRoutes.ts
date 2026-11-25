import express from "express";
import type { Router } from "express";
import { userLogin, registerUser } from "../controllers/userController.js";

// Router for all /api/user routes
const userRouter: Router = express.Router();

// Public routes (no token needed)
userRouter.post("/register", registerUser); // POST /api/user/register
userRouter.post("/login", userLogin); // POST /api/user/login

export default userRouter;
