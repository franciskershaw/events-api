import express from "express";
import asyncHandler from "express-async-handler";
import { authenticateToken } from "../auth/auth.middleware";
import {
  getUserInfo,
  createTempUserConnectionId,
  //   createUserConnection
} from "./user.controller";

const router = express.Router();

router.get("/", authenticateToken, asyncHandler(getUserInfo));
router.post(
  "/connection-id",
  authenticateToken,
  asyncHandler(createTempUserConnectionId)
);
// router.post(
//   "/connections",
//   authenticateToken,
//   asyncHandler(createUserConnection)
// );

export default router;
