import User from "../models/userModel.js";
import jwt from "jsonwebtoken";
import type { Response, NextFunction } from "express";
import type { AuthRequest, TokenPayload } from "../types/auth.js";

// Must be the same secret used in createToken (userController)
const JWT_SECRET: string = process.env.JWT_SECRET || "your_jwt_secret_key";

// Shape of the JSON response this middleware sends on failure
type AuthErrorResponse = {
  success: boolean;
  message: string;
};

export default async function authMiddleware(
  req: AuthRequest<any, AuthErrorResponse>, // 1st: the request
  res: Response<AuthErrorResponse>, // 2nd: the response
  next: NextFunction, // 3rd: next
): Promise<Response<AuthErrorResponse> | void> {
  // 1. Read the token from the Authorization header ("Bearer <token>")
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Not authorized or missing token",
    });
  }

  const token: string = authHeader.split(" ")[1];

  try {
    // 2. Verify signature and expiry. verify() returns string | JwtPayload,
    //    so we cast it to the shape createToken actually signs.
    const payload = jwt.verify(token, JWT_SECRET) as TokenPayload;

    // 3. Make sure the user still exists (exclude the password field)
    const user = await User.findById(payload.id).select("-password");

    // Verification
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    // 4. Attach a small, typed object to the request (not the whole document)
    req.user = { id: user._id.toString() };

    // 5. Hand over to the next middleware or controller
    next();
  } catch (error) {
    // Bad signature, expired token, or malformed token all end up here
    console.error("JWT verification failed:", error);
    return res.status(401).json({
      success: false,
      message: "Token invalid or expired",
    });
  }
}
