import express from "express";
import asyncHandler from "express-async-handler";
import { authenticateToken } from "../auth/auth.middleware";
import {
  createEvent,
  deleteEvent,
  getEventCategories,
  getPastEvents,
  getPastMonthEvents,
  getUserEvents,
  toggleEventPrivacy,
  updateEvent,
} from "./event.controller";

const router = express.Router();

router.get("/", authenticateToken, asyncHandler(getUserEvents));
router.get("/categories", authenticateToken, getEventCategories);
router.get("/past", authenticateToken, asyncHandler(getPastEvents));
router.get("/pastMonth", authenticateToken, asyncHandler(getPastMonthEvents));
router.post("/", authenticateToken, asyncHandler(createEvent));
router.put("/:eventId", authenticateToken, asyncHandler(updateEvent));
router.delete("/:eventId", authenticateToken, asyncHandler(deleteEvent));
router.patch(
  "/:eventId/privacy",
  authenticateToken,
  asyncHandler(toggleEventPrivacy)
);
export default router;
