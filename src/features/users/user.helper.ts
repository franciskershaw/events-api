import User from "./user.model";
import mongoose from "mongoose";

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
