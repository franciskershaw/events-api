import { Request, Response, NextFunction } from "express";
import User, { IUser } from "../models/User";
import { generateAccessToken } from "../utils/jwt";
import validateRequest from "../utils/validate";
import { connectUserSchema } from "../utils/schemas";
import { BadRequestError, NotFoundError } from "../utils/errors";
import mongoose from "mongoose";

export const getUserInfo = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user as IUser;

    const userInfo = await User.findById(user._id).lean();

    if (!userInfo) {
      throw new NotFoundError("User not found");
    }

    const accessToken = generateAccessToken(user);

    res.json({ ...userInfo, accessToken });
  } catch (err) {
    next(err);
  }
};

export const connectUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const userId = (req.user as IUser)._id;
    const { connectionId } = validateRequest(req.body, connectUserSchema);

    const targetUser = await User.findOne({ connectionId }).session(session);
    if (!targetUser) {
      throw new NotFoundError("User with this connection ID not found.");
    }
    if (targetUser._id.toString() === userId.toString()) {
      throw new BadRequestError("You cannot connect with yourself.");
    }

    const authenticatedUser = await User.findById(userId).session(session);
    if (!authenticatedUser) {
      throw new NotFoundError("User not found.");
    }

    if (
      authenticatedUser.connections.includes(targetUser._id) ||
      targetUser.connections.includes(authenticatedUser._id)
    ) {
      throw new BadRequestError("Users are already connected.");
    }

    authenticatedUser.connections.push(targetUser._id);
    targetUser.connections.push(authenticatedUser._id);

    await authenticatedUser.save({ session });
    await targetUser.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({ message: "Users connected successfully." });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    next(err);
  }
};
