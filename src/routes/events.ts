import express from "express";
import asyncHandler from "express-async-handler";
import {
  createEvent,
  updateEvent,
  deleteEvent,
  getEventCategories,
  getUserEvents,
  getPastEvents,
  privatiseEvent,
  shareEvent,
  addSharedEvent,
} from "../controllers/events";
import { authenticateToken } from "../middleware/authMiddleware";

const router = express.Router();

router.get("/", authenticateToken, asyncHandler(getUserEvents));
router.get("/categories", authenticateToken, getEventCategories);
router.get("/past", authenticateToken, asyncHandler(getPastEvents));
router.post("/", authenticateToken, asyncHandler(createEvent));
router.put("/:eventId", authenticateToken, asyncHandler(updateEvent));
router.delete("/:eventId", authenticateToken, asyncHandler(deleteEvent));
router.delete(
  "/:eventId/private",
  authenticateToken,
  asyncHandler(privatiseEvent)
);
router.post("/:eventId/share", authenticateToken, asyncHandler(shareEvent));
router.post("/:eventId/add", authenticateToken, asyncHandler(addSharedEvent));

// create event category (for dev use only)
// router.post("/category", asyncHandler(createEventCategory));

export default router;
