import { Request, Response, NextFunction } from "express";
import User, { IUser } from "./user.model";
import { generateAccessToken } from "../../core/utils/jwt";
import { NotFoundError } from "../../core/utils/errors";
import { generateConnectionId } from "./user.helper";
import dayjs from "dayjs";

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

export const createTempUserConnectionId = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await User.findById(req.user as IUser);

    if (!user) {
      throw new NotFoundError("User not found");
    }

    const connectionId = await generateConnectionId();

    user.connectionId = {
      id: connectionId,
      expiry: dayjs().add(1, "hour").toDate(),
    };

    await user.save();

    res.json({ connectionId });
  } catch (err) {
    next(err);
  }
};

export const createUserConnection = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { connectionId } = req.body;
    const currentUserId = (req.user as IUser)._id;

    const currentUser = await User.findById(currentUserId);
    if (!currentUser) {
      throw new NotFoundError("Current user not found");
    }

    const targetUser = await User.findOne({
      "connectionId.id": connectionId,
      "connectionId.expiry": { $gt: new Date() },
    });

    if (!targetUser) {
      throw new NotFoundError("Invalid or expired connection ID");
    }

    if (targetUser._id.equals(currentUser._id)) {
      throw new Error("Cannot connect with yourself");
    }

    if (currentUser.connections?.includes(targetUser._id)) {
      throw new Error("Connection already exists");
    }

    await Promise.all([
      User.findByIdAndUpdate(
        currentUser._id,
        {
          $addToSet: { connections: targetUser._id },
        },
        { new: true }
      ),
      User.findByIdAndUpdate(
        targetUser._id,
        {
          $addToSet: { connections: currentUser._id },
          $unset: { connectionId: "" },
        },
        { new: true }
      ),
    ]);

    res.json({
      message: "Connection successful",
      connectedUser: {
        id: targetUser._id,
        name: targetUser.name,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const removeUserConnection = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { connectionUserId } = req.params;
    const currentUserId = (req.user as IUser)._id;

    const connectionUser = await User.findById(connectionUserId);
    if (!connectionUser) {
      throw new NotFoundError("Connection user not found");
    }

    const currentUser = await User.findById(currentUserId);
    if (!currentUser) {
      throw new NotFoundError("Current user not found");
    }

    if (!currentUser.connections?.includes(connectionUser._id)) {
      throw new Error("Connection does not exist");
    }

    await Promise.all([
      User.findByIdAndUpdate(
        currentUserId,
        {
          $pull: { connections: connectionUser._id },
        },
        { new: true }
      ),
      User.findByIdAndUpdate(
        connectionUser._id,
        {
          $pull: { connections: currentUserId },
        },
        { new: true }
      ),
    ]);

    res.json({
      message: "Connection removed successfully",
      removedConnection: {
        id: connectionUser._id,
        name: connectionUser.name,
      },
    });
  } catch (err) {
    next(err);
  }
};
