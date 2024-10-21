import { Request, Response, NextFunction } from "express";
import passport from "passport";
import { generateAccessToken, generateRefreshToken } from "../utils/jwt";
import { IUser } from "../models/User";

// Helper function to send tokens
const sendTokens = (res: Response, user: IUser) => {
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  });

  res.json({ user, accessToken });
};

// Local login controller
export const login = (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate("local", (err: any, user: IUser | undefined) => {
    if (err || !user) {
      return res.status(401).json({ message: "Authentication failed" });
    }

    sendTokens(res, user);
  })(req, res, next);
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

    res.redirect(`${process.env.FRONTEND_URL}`);
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
