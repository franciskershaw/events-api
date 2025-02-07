import User from "./user.model";
import mongoose from "mongoose";
import { IUser } from "./user.model";
import { NotFoundError } from "../../core/utils/errors";

interface PopulatedUserData {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
}

interface PopulatedConnection {
  _id: PopulatedUserData;
  hideEvents: boolean;
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
    .populate<{ connections: PopulatedConnection[] }>({
      path: "connections",
      populate: {
        path: "_id",
        model: "User",
        select: "name email",
      },
    })
    .lean();

  if (!user) {
    throw new NotFoundError("User not found");
  }

  // Transform the connections array into the desired format
  const transformedConnections = user.connections.map((connection) => {
    const populatedUser = connection._id as PopulatedUserData;
    return {
      _id: populatedUser._id,
      name: populatedUser.name,
      email: populatedUser.email,
      hideEvents: connection.hideEvents,
    };
  });

  return {
    ...user,
    connections: transformedConnections,
  };
};
