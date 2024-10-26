import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import User, { IUser } from "../models/User";
import validateRequest from "../utils/validate";
import { newEventSchema, updateEventSchema } from "../utils/schemas";
import Event, { IEvent } from "../models/Event";
import EventCategory from "../models/EventCategory";

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

    const eventData = validateRequest(req.body, newEventSchema);
    eventData.createdBy = userId;

    const event = new Event(eventData);

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

// Update an event
export const updateEvent = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const userId = (req.user as IUser)._id;
    const eventId = req.params.eventId;

    const user = await User.findOne({
      _id: userId,
      events: { $in: [eventId] },
    }).session(session);

    if (!user) {
      throw new Error("Event not found for the user");
    }

    const value = validateRequest(req.body, updateEventSchema);

    const event = await Event.findByIdAndUpdate(eventId, value, {
      new: true,
      session,
      omitUndefined: true,
    });

    if (!event) {
      throw new Error("Event not found");
    }

    await session.commitTransaction();
    session.endSession();

    res.status(200).json(event);
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    next(err);
  }
};

// Delete an event
export const deleteEvent = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const userId = (req.user as IUser)._id;
    const eventId = req.params.eventId;

    const user = await User.findByIdAndUpdate(
      { _id: userId, events: { $in: [eventId] } },
      { $pull: { events: eventId } },
      { new: true, session }
    );

    if (!user) {
      throw new Error("Event not found for the user");
    }

    // Delete the event
    const event = await Event.findByIdAndDelete(eventId, { session });
    if (!event) {
      throw new Error("Event not found");
    }

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({ message: "Event deleted successfully" });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    next(err);
  }
};

// Get event categories
export const getEventCategories = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const categories = await EventCategory.find();
    res.status(200).json(categories);
  } catch (err) {
    next(err);
  }
};

// Create event category (For dev use only)
// export const createEventCategory = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     const category = new EventCategory(req.body);
//     await category.save();
//     res.status(200).json(category);
//   } catch (err) {
//     next(err);
//   }
// };
