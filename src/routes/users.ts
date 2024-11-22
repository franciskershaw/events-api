import express from "express";
import asyncHandler from "express-async-handler";
import { authenticateToken } from "../middleware/authMiddleware";
import { connectUsers, getUserInfo } from "../controllers/users";

const router = express.Router();

router.get("/", authenticateToken, asyncHandler(getUserInfo));
router.post("/connect", authenticateToken, asyncHandler(connectUsers));

export default router;
