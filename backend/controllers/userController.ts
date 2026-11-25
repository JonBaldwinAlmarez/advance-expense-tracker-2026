import User from "../models/userModel.js";
import validator from "validator";
import bcrypt, { compare } from "bcryptjs";
import jwt from "jsonwebtoken";
import type { Request, Response } from "express";
import type { AuthRequest } from "../types/auth.js";

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

// GET User details

// Response shape for GET /api/user/me
type GetUserResponse = {
  success: boolean;
  message?: string;
  user?: PublicUser;
};

// GET /api/user/me  (protected route: requires the auth middleware)

export async function getCurrentUser(
  req: AuthRequest<{}, GetUserResponse>,
  res: Response<GetUserResponse>,
): Promise<Response<GetUserResponse>> {
  const userId = req.user?.id; //Get user ID

  // 1. Make sure the auth middleware identified the user
  if (!userId) {
    return res.status(401).json({
      success: false,
      message: "Not authorized",
    });
  }

  try {
    // 2. Fetch the user without the password field
    const user = await User.findById(userId).select("-password"); // Get user ID

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // 3. Send back only the public fields
    return res.json({
      success: true,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    // Console error
    console.error("getCurrentUser error:", error);

    // Return error message
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

// To change user password

// Shape of the JSON body expected when changing the password
type UpdatePasswordBody = {
  currentPassword: string;
  newPassword: string;
};

// Shape of every JSON response this controller sends back
type UpdatePasswordResponse = {
  success: boolean;
  message: string;
};

export async function updateUserPassword(
  req: AuthRequest<{}, UpdatePasswordResponse, UpdatePasswordBody>,
  res: Response<UpdatePasswordResponse>,
): Promise<Response<UpdatePasswordResponse>> {
  // Get user data
  const { currentPassword, newPassword } = req.body;
  const userId = req.user?.id;

  // 1. Make sure the auth middleware identified the user
  if (!userId) {
    return res.status(401).json({
      success: false,
      message: "Not authorized",
    });
  }

  // 2. Make sure both passwords were sent
  if (!currentPassword || !newPassword) {
    return res.status(400).json({
      success: false,
      message: "Please provide current and new password",
    });
  }
  // 3. Enforce a minimum length (length is a property, not a function)
  if (newPassword.length < 8) {
    return res.status(400).json({
      success: false,
      message: "New password must be at least 8 characters long",
    });
  }

  try {
    // 4. Fetch the user, selecting only the password field
    const user = await User.findById(userId).select("password");

    //Checking
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // 5. Check that the current password matches the stored hash
    const match: boolean = await bcrypt.compare(currentPassword, user.password);

    if (!match) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    // 6. Hash the new password (10 salt rounds) and save it
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    // 7. Confirm success
    return res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    // Log the real error on the server, send a generic message to the client
    console.error("updateUserPassword error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}
