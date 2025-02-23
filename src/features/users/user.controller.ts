import { Request, Response, NextFunction } from "express";
import User, { IUser } from "./user.model";
import { generateAccessToken } from "../../core/utils/jwt";
import { NotFoundError, BadRequestError } from "../../core/utils/errors";
import { generateConnectionId, getPopulatedUserData } from "./user.helper";
import dayjs from "dayjs";
import { updateConnectionPreferencesSchema } from "./user.validation";
import validateRequest from "../../core/utils/validate";

export const getUserInfo = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user as IUser;
    const userInfo = await getPopulatedUserData(user._id);

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

    res.json(user.connectionId);
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
      throw new BadRequestError("Cannot connect with yourself");
    }

    // Check if connection already exists
    const connectionExists = currentUser.connections.some((conn) =>
      conn._id.equals(targetUser._id)
    );
    if (connectionExists) {
      throw new BadRequestError("Connection already exists");
    }

    // Create connection objects for both users
    const currentUserConnection = { _id: targetUser._id, hideEvents: false };
    const targetUserConnection = { _id: currentUser._id, hideEvents: false };

    await Promise.all([
      User.findByIdAndUpdate(
        currentUser._id,
        {
          $push: { connections: currentUserConnection },
        },
        { new: true }
      ),
      User.findByIdAndUpdate(
        targetUser._id,
        {
          $push: { connections: targetUserConnection },
          $unset: { connectionId: "" },
        },
        { new: true }
      ),
    ]);

    res.json({
      _id: targetUser._id,
      name: targetUser.name,
      email: targetUser.email,
      hideEvents: false,
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

    const connectionExists = currentUser.connections.some((conn) =>
      conn._id.equals(connectionUser._id)
    );
    if (!connectionExists) {
      throw new NotFoundError("Connection does not exist");
    }

    await Promise.all([
      User.findByIdAndUpdate(
        currentUserId,
        {
          $pull: { connections: { _id: connectionUser._id } },
        },
        { new: true }
      ),
      User.findByIdAndUpdate(
        connectionUser._id,
        {
          $pull: { connections: { _id: currentUserId } },
        },
        { new: true }
      ),
    ]);

    res.json({
      _id: connectionUser._id,
      message: "Connection removed successfully",
    });
  } catch (err) {
    next(err);
  }
};

export const updateConnectionPreferences = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { hideEvents } = validateRequest(
      req.body,
      updateConnectionPreferencesSchema
    );
    const { connectionId } = req.params;
    const currentUserId = (req.user as IUser)._id;

    const currentUser = await User.findById(currentUserId);
    if (!currentUser) {
      throw new NotFoundError("User not found");
    }

    // Check if the connection exists
    const connectionExists = currentUser.connections.some(
      (conn) => conn._id.toString() === connectionId
    );
    if (!connectionExists) {
      throw new BadRequestError("Connection not found");
    }

    // Update the connection preferences using array filters
    const updatedUser = await User.findOneAndUpdate(
      { _id: currentUserId, "connections._id": connectionId },
      {
        $set: { "connections.$.hideEvents": hideEvents },
      },
      { new: true }
    );

    if (!updatedUser) {
      throw new Error("Failed to update connection preferences");
    }

    res.json({
      _id: connectionId,
      hideEvents,
    });
  } catch (err) {
    next(err);
  }
};
