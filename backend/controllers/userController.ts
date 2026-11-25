import User from "../models/userModel.js";
import validator from "validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import type { Request, Response } from "express";

// Shape of the JSON body for user registration
type RegisterBody = {
  name: string;
  email: string;
  password: string;
};

// Shape of the user object sent back to the client (no password)
type PublicUser = {
  id: string;
  name: string;
  email: string;
};

// Shape of every JSON response this controller sends back
type RegisterResponse = {
  success: boolean;
  message: string;
  user?: PublicUser;
  token?: string;
};

// JWT secret key for signing tokens (should be stored in environment variables)
const JWT_SECRET: string = process.env.JWT_SECRET || "your_jwt_secret_key";

// This is for how long the token stay valid
const TOKEN_EXPIRATION = "24h" as const;

// Creates a signed JWT containing the user's id.
// Callers must convert the Mongoose ObjectId to a string first.

const createToken = (userId: string): string => {
  return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: TOKEN_EXPIRATION });
};

// Below are the controllers
/* ---------- Controllers ---------- */

// POST /api/user/register
// Request<Params, ResBody, ReqBody>: we type the response and the body

export async function registerUser(
  req: Request<{}, RegisterResponse, RegisterBody>,
  res: Response<RegisterResponse>,
): Promise<Response<RegisterResponse>> {
  // This get the email name and password
  const { name, email, password } = req.body;

  // 1. Make sure all required fields were sent
  if (!name || !email || !password) {
    return res.status(400).json({
      success: false,
      message: "Please provide name, email, and password",
    });
  }

  // 2. Validate the email format
  if (!validator.isEmail(email)) {
    return res.status(400).json({
      success: false,
      message: "Invalid email format",
    });
  }
  // 3. Enforce a minimum password length
  if (password.length < 8) {
    return res.status(400).json({
      success: false,
      message: "Password must be at least 8 characters long",
    });
  }

  try {
    // 4. Reject duplicate emails
    if (await User.findOne({ email })) {
      return res.status(400).json({
        success: false,
        message: "Email already exists",
      });
    }
    // 5. Hash the password (10 salt rounds) so it's never stored as plain text
    const hashedPassword: string = await bcrypt.hash(password, 10);

    // 6. Create the user in MongoDB
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    // 7. Convert the ObjectId to a string before creating the token
    const token: string = createToken(user._id.toString());

    // 8. Send back the new user (without the password) and the token
    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
      },
      token,
    });
  } catch (error) {
    // Log the real error on the server, but send a generic message to the client
    console.error("registerUser error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

// Get user detail
export async function getCurrentUser(req: Request, res: Response) {
  try {
    const user = await User.findById(req.user?.id).select("-password");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    res.json({ success: true, user });
  } catch (error) {
    console.error("getCurrentUser error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}
