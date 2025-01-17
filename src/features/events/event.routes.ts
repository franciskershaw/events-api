import express from "express";
import asyncHandler from "express-async-handler";
import {
  createEvent,
  updateEvent,
  deleteEvent,
  getEventCategories,
  getUserEvents,
  getPastEvents,
  toggleEventPrivacy,
} from "./event.controller";
import { authenticateToken } from "../auth/auth.middleware";

const router = express.Router();

router.get("/", authenticateToken, asyncHandler(getUserEvents));
router.get("/categories", authenticateToken, getEventCategories);
router.get("/past", authenticateToken, asyncHandler(getPastEvents));
router.post("/", authenticateToken, asyncHandler(createEvent));
router.put("/:eventId", authenticateToken, asyncHandler(updateEvent));
router.delete("/:eventId", authenticateToken, asyncHandler(deleteEvent));
router.patch(
  "/:eventId/privacy",
  authenticateToken,
  asyncHandler(toggleEventPrivacy)
);

// create event category (for dev use only)
// router.post("/category", asyncHandler(createEventCategory));

export default router;
