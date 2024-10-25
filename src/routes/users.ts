import express from "express";
import asyncHandler from "express-async-handler";
import { authenticateToken } from "../middleware/authMiddleware";
import { getUserInfo } from "../controllers/users";

const router = express.Router();

router.get("/", authenticateToken, asyncHandler(getUserInfo));

export default router;
