import express from "express";
import type { Router, RequestHandler } from "express";
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

// Protected routes (token required; authMiddleware sets req.user)
userRouter.get(
  "/me",
  authMiddleware as RequestHandler,
  getCurrentUser as RequestHandler,
); // GET /api/user/me

userRouter.put(
  "/profile",
  authMiddleware as RequestHandler,
  updateUserProfile as RequestHandler,
); // PUT /api/user/profile

userRouter.put(
  "/password",
  authMiddleware as RequestHandler,
  updateUserPassword as RequestHandler,
); // PUT /api/user/password

export default userRouter;
