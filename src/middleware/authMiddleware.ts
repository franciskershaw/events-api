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
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return next(new UnauthorizedError("No token provided", "TOKEN_MISSING"));
    }

    const decoded = verifyAccessToken(token);

    if (!decoded) {
      return next(new ForbiddenError("Invalid or expired token"));
    }

    req.user = decoded;

    next();
  } catch (err) {
    if (err instanceof Error) {
      if (err.name === "TokenExpiredError") {
        throw new UnauthorizedError(
          "Session expired, please log in again",
          "SESSION_EXPIRED"
        );
      } else if (err.name === "JsonWebTokenError") {
        throw new UnauthorizedError(
          "Invalid token, please log in again",
          "INVALID_TOKEN"
        );
      }
    }

    next(err);
  }
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
