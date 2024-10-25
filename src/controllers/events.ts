import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import User, { IUser } from "../models/User";
import validateRequest from "../utils/validate";
import { newEventSchema } from "../utils/schemas";
import Event, { IEvent } from "../models/Event";

// Create an event and add it to the user's array of events
export const createEvent = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const userId = (req.user as IUser)._id;
    const user = await User.findById(userId).session(session);

    if (!user) {
      throw new Error("User not found");
    }

    const event = new Event(validateRequest(req.body, newEventSchema));

    await event.save({ session });

    user.events.push(event._id);
    await user.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.status(200).json(event);
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    next(err);
  }
};
