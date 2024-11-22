import express from "express";
import asyncHandler from "express-async-handler";
import { authenticateToken } from "../middleware/authMiddleware";
import {
  connectUsers,
  getUserInfo,
  removeConnection,
} from "../controllers/users";

const router = express.Router();

router.get("/", authenticateToken, asyncHandler(getUserInfo));
router.post("/connections", authenticateToken, asyncHandler(connectUsers));
router.delete(
  "/connections",
  authenticateToken,
  asyncHandler(removeConnection)
);

export default router;
