import { Request, Response, NextFunction } from "express";
import passport from "passport";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../../core/utils/jwt";
import User, { IUser } from "../users/user.model";
import { registerSchema } from "./auth.validation";
import validateRequest from "../../core/utils/validate";
import { ConflictError, InternalServerError } from "../../core/utils/errors";
import bcrypt from "bcryptjs";
import {
  REFRESH_TOKEN_COOKIE_OPTIONS,
  REFRESH_TOKEN_COOKIE_NAME,
} from "../../core/utils/constants";
import { getPopulatedUserData } from "../users/user.helper";

// Helper function to send tokens
const sendTokens = async (res: Response, user: IUser, status: number = 200) => {
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);
  const populatedUser = await getPopulatedUserData(user._id);

  res.cookie(
    REFRESH_TOKEN_COOKIE_NAME,
    refreshToken,
    REFRESH_TOKEN_COOKIE_OPTIONS
  );

  res.status(status).json({ ...populatedUser, accessToken });
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

    const user = await User.create({
      email,
      name,
      password: hashedPassword,
      provider: "local",
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

    res.cookie(
      REFRESH_TOKEN_COOKIE_NAME,
      refreshToken,
      REFRESH_TOKEN_COOKIE_OPTIONS
    );

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
