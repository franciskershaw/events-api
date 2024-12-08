import { Request, Response, NextFunction } from "express";
import {
  verifyAccessToken,
  verifyRefreshToken,
  generateAccessToken,
  generateRefreshToken,
} from "../utils/jwt";
import { UnauthorizedError, ForbiddenError } from "../utils/errors";
import { IUser } from "../models/User";

export const authenticateToken = (
  req: Request,
  _: Response,
  next: NextFunction
) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return next(new UnauthorizedError("No token provided", "TOKEN_MISSING"));
  }

  const decoded = verifyAccessToken(token);

  if (!decoded) {
    return next(
      new UnauthorizedError("Please log in to proceed", "INVALID_TOKEN")
    );
  }

  req.user = decoded;

  next();
};

export const refreshTokens = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return next(
      new UnauthorizedError(
        "No refresh token provided",
        "REFRESH_TOKEN_MISSING"
      )
    );
  }

  const decoded = verifyRefreshToken(refreshToken) as IUser | undefined;

  if (!decoded) {
    res.clearCookie("refreshToken");
    return next(new ForbiddenError("Invalid or expired refresh token"));
  }

  const newAccessToken = generateAccessToken(decoded);
  const newRefreshToken = generateRefreshToken(decoded);

  res.cookie("refreshToken", newRefreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  });

  res.json({ accessToken: newAccessToken });
};
