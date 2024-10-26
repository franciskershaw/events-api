import express from "express";
import asyncHandler from "express-async-handler";
import { createEvent, updateEvent, deleteEvent } from "../controllers/events";
import { authenticateToken } from "../middleware/authMiddleware";

const router = express.Router();

router.post("/", authenticateToken, asyncHandler(createEvent));
router.put("/:eventId", authenticateToken, asyncHandler(updateEvent));
router.delete("/:eventId", authenticateToken, asyncHandler(deleteEvent));

export default router;