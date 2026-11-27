import express from "express";
import type { Router } from "express";
import {
  userLogin,
  registerUser,
  getCurrentUser,
  updateUserProfile,
  updateUserPassword,
} from "../controllers/userController.js";
import authMiddleware from "../middleware/auth.js";

// Router for all /api/user routes
const userRouter: Router = express.Router();

// Public routes (no token needed)
userRouter.post("/register", registerUser); // POST /api/user/register
userRouter.post("/login", userLogin); // POST /api/user/login

// Protected Routes
userRouter.get("/me", authMiddleware, getCurrentUser);
userRouter.put("/profile", authMiddleware, updateUserProfile);
userRouter.get("/password", authMiddleware, updateUserPassword);

export default userRouter;
