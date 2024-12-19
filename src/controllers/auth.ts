import { Request, Response, NextFunction } from "express";
import passport from "passport";
import { generateAccessToken, generateRefreshToken } from "../utils/jwt";
import User, { IUser } from "../models/User";
import { registerSchema } from "../utils/schemas";
import validateRequest from "../utils/validate";
import { ConflictError, InternalServerError } from "../utils/errors";
import bcrypt from "bcryptjs";

// Helper function to send tokens
const sendTokens = (res: Response, user: IUser, status: number = 200) => {
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  });

  res.status(status).json({ ...user.toObject(), accessToken });
};

export const generateConnectionId = async (length = 8): Promise<string> => {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let connectionId;

  do {
    // Generate a random alphanumeric ID
    connectionId = Array.from({ length }, () =>
      characters.charAt(Math.floor(Math.random() * characters.length))
    ).join("");

    // Check if this connectionId already exists
  } while (await User.exists({ connectionId }));

  return connectionId;
};

// Local login controller
export const login = (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate("local", (err: any, user: IUser | undefined) => {
    if (err) {
      console.error("Authentication error:", err);
      return res.status(500).json({ message: "Internal server error" });
    }

    if (!user) {
      return res.status(401).json({
        message: "Incorrect email or password",
      });
    }

    sendTokens(res, user, 200);
  })(req, res, next);
};

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const value = validateRequest(req.body, registerSchema);

    const { email, password, name } = value;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      throw new ConflictError("User already exists");
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const connectionId = await generateConnectionId();

    const user = await User.create({
      email,
      name,
      password: hashedPassword,
      provider: "local",
      connectionId,
    });

    if (user) {
      sendTokens(res, user, 201);
    } else {
      throw new InternalServerError("Error creating user");
    }
  } catch (err) {
    next(err);
  }
};

// Google OAuth callback controller
export const googleCallback = (req: Request, res: Response) => {
  try {
    const user = req.user as IUser | undefined;

    if (!user) {
      return res.status(401).json({ message: "Authentication failed" });
    }

    const refreshToken = generateRefreshToken(user);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    });

    res.redirect(`${process.env.CORS_ORIGIN}`);
  } catch (err) {
    console.error("Error during Google callback:", err);
    res.status(500).json({
      message: "An unexpected error occurred, please try again later.",
    });
  }
};

// Logout controller
export const logout = (req: Request, res: Response) => {
  res.clearCookie("refreshToken");
  res.json({ message: "Logged out successfully" });
};
