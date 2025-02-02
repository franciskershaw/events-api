import User from "./user.model";
import mongoose from "mongoose";
import { IUser } from "./user.model";
import { NotFoundError } from "../../core/utils/errors";

export interface PopulatedConnection {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  hideEvents: boolean;
}

export interface PopulatedUser extends Omit<IUser, "connections"> {
  connections: PopulatedConnection[];
}

export const generateConnectionId = async (length = 8): Promise<string> => {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let connectionId: string;
  let existingUser: { _id: mongoose.Types.ObjectId } | null;

  do {
    connectionId = Array.from({ length }, () =>
      characters.charAt(Math.floor(Math.random() * characters.length))
    ).join("");

    existingUser = await User.exists({
      "connectionId.id": connectionId,
      "connectionId.expiry": { $gt: new Date() },
    });
  } while (existingUser !== null);

  return connectionId;
};

export const getPopulatedUserData = async (userId: mongoose.Types.ObjectId) => {
  const user = await User.findById(userId)
    .populate("connections", "name email")
    .lean();

  if (!user) {
    throw new NotFoundError("User not found");
  }

  // Add hideEvents to each connection from preferences
  const populatedConnections = user.connections.map((connection) => ({
    ...connection,
    hideEvents:
      user.preferences?.connectionPreferences?.[connection._id.toString()]
        ?.hideEvents || false,
  }));

  return {
    ...user,
    connections: populatedConnections,
  };
};
