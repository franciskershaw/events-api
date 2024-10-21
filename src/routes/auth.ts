import express from "express";
import passport from "passport";
import { login, googleCallback, logout } from "../controllers/auth";
import { refreshTokens } from "../middleware/authMiddleware";
import { GOOGLE_PROVIDER } from "../utils/constants";

const router = express.Router();

// Local login route
router.post("/login", login);

// Google OAuth route
router.get(
  "/google",
  passport.authenticate(GOOGLE_PROVIDER, { scope: ["profile", "email"] })
);

// Google OAuth callback route
router.get(
  "/google/callback",
  passport.authenticate(GOOGLE_PROVIDER, {
    session: false,
    failureRedirect: process.env.FRONTEND_URL,
  }),
  googleCallback
);

// Logout route
router.post("/logout", logout);

// Refresh token route
router.get("/refresh-token", refreshTokens);

export default router;
