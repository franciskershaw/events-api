import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import Event from "../models/Event";
import EventCategory from "../models/EventCategory";
import SharedEvent from "../models/SharedEvent";
import User, { IUser } from "../models/User";
import { BadRequestError, NotFoundError } from "../utils/errors";
import { newEventSchema, updateEventSchema } from "../utils/schemas";
import validateRequest from "../utils/validate";
import dayjs from "dayjs";

// Create an event and add it to the user's array of events
export const createEvent = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req.user as IUser)._id;

    const eventData = validateRequest(req.body, newEventSchema);
    eventData.createdBy = userId;

    if (!eventData.date.end) {
      eventData.date.end = eventData.date.start;
    }

    const event = new Event(eventData);
    await event.save();

    if (eventData.sharedWith && eventData.sharedWith.length > 0) {
      const sharedEvents = eventData.sharedWith.map((sharedUserId: string) => ({
        event: event._id,
        user: sharedUserId,
        permissions: "view",
      }));

      await SharedEvent.insertMany(sharedEvents);
    }

    res.status(200).json(event);
  } catch (err) {
    next(err);
  }
};

// Update an event
export const updateEvent = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const eventId = req.params.eventId;

    const value = validateRequest(req.body, updateEventSchema);

    const event = await Event.findByIdAndUpdate(eventId, value, {
      new: true,
      omitUndefined: true,
    });

    if (!event) {
      throw new Error("Event not found");
    }

    res.status(200).json(event);
  } catch (err) {
    next(err);
  }
};

// Delete an event
export const deleteEvent = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const eventId = req.params.eventId;

    const event = await Event.findByIdAndDelete(eventId);

    if (!event) {
      throw new Error("Event not found");
    }

    res.status(200).json({ message: "Event deleted successfully" });
  } catch (err) {
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
    const categories = await EventCategory.find().sort({ name: 1 });
    res.status(200).json(categories);
  } catch (err) {
    next(err);
  }
};

// Get user's events (upcoming or ongoing)
export const getUserEvents = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req.user as IUser)._id;
    const now = dayjs().startOf("day").toDate();

    const createdEvents = await Event.find({
      $or: [{ "date.end": { $gte: now } }, { "date.start": { $gte: now } }],
      createdBy: userId,
    })
      .populate("category", "name icon")
      .populate("createdBy", "name")
      .sort({ "date.start": 1 })
      .lean();

    const sharedEventLinks = await SharedEvent.find({ user: userId })
      .populate({
        path: "event",
        populate: [
          { path: "category", select: "name icon" },
          { path: "createdBy", select: "name" },
        ],
        match: {
          $or: [{ "date.end": { $gte: now } }, { "date.start": { $gte: now } }],
        },
        options: {
          sort: { "date.start": 1 },
        },
      })
      .lean();

    const sharedEvents = sharedEventLinks
      .map((link: any) => link.event)
      .filter(Boolean);

    const allEvents = [...createdEvents, ...sharedEvents].sort((a, b) =>
      dayjs(a.date.start).diff(dayjs(b.date.start))
    );

    res.status(200).json(allEvents);
  } catch (err) {
    next(err);
  }
};

export const getPastEvents = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req.user as IUser)._id;

    const {
      page = 1,
      limit = 10,
      category,
      search,
      sortBy = "date.end",
      order = "desc",
    } = req.query;

    const pageNumber = parseInt(page as string, 10);
    const pageLimit = parseInt(limit as string, 10);

    const filters: any = {
      "date.end": { $lt: new Date() },
    };

    if (category) filters.category = category;
    if (search) {
      const regex = new RegExp(search as string, "i");
      filters.$or = [{ title: regex }, { location: regex }];
    }

    const createdEvents = await Event.find({
      ...filters,
      createdBy: userId,
    })
      .populate("category", "name icon")
      .populate("createdBy", "name")
      .sort({ [sortBy as string]: order === "asc" ? 1 : -1 })
      .skip((pageNumber - 1) * pageLimit)
      .limit(pageLimit)
      .lean();

    const sharedEventLinks = await SharedEvent.find({ user: userId })
      .populate({
        path: "event",
        populate: [
          { path: "category", select: "name icon" },
          { path: "createdBy", select: "name" },
        ],
        match: filters,
      })
      .lean();

    const sharedEvents = sharedEventLinks
      .map((link: any) => link.event)
      .filter(Boolean);

    const allEvents = [...createdEvents, ...sharedEvents];

    const totalEvents = allEvents.length;
    const paginatedEvents = allEvents.slice(
      (pageNumber - 1) * pageLimit,
      pageNumber * pageLimit
    );

    res.status(200).json({
      events: paginatedEvents,
      pagination: {
        currentPage: pageNumber,
        totalPages: Math.ceil(totalEvents / pageLimit),
        totalEvents,
        limit: pageLimit,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const privatiseEvent = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const userId = (req.user as IUser)._id;
    const { eventId } = req.params;

    const event = await Event.findOne({
      _id: eventId,
      createdBy: userId,
    }).session(session);
    if (!event) {
      throw new NotFoundError(
        "Event not found or you do not have permission to modify it."
      );
    }

    await SharedEvent.deleteMany({ event: event._id }).session(session);

    if (event.sharedWith) {
      event.sharedWith = [];
      await event.save({ session });
    }

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({ message: "Event made private." });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    next(err);
  }
};

export const shareEvent = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const userId = (req.user as IUser)._id;
    const { eventId } = req.params;

    const event = await Event.findOne({
      _id: eventId,
      createdBy: userId,
    }).session(session);

    if (!event) {
      throw new NotFoundError(
        "Event not found or you do not have permission to share it."
      );
    }

    const user = await User.findById(userId)
      .populate("connections")
      .session(session);
    if (!user || !user.connections || user.connections.length === 0) {
      throw new BadRequestError(
        "You have no connections to share this event with."
      );
    }

    const sharedEvents = user.connections.map((connection) => ({
      user: connection._id,
      event: event._id,
    }));

    await SharedEvent.insertMany(sharedEvents, { session });

    if (event.sharedWith) {
      event.sharedWith = user.connections.map((connection) => connection._id);
      await event.save({ session });
    }

    await session.commitTransaction();
    session.endSession();

    res
      .status(200)
      .json({ message: "Event shared successfully with all connections." });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    next(err);
  }
};

export const addSharedEvent = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const userId = (req.user as IUser)._id;
    const { eventId } = req.params;

    const sharedEvent = await SharedEvent.findOne({
      event: eventId,
      user: userId,
    })
      .populate("event")
      .session(session);

    if (!sharedEvent) {
      throw new NotFoundError("Shared event not found.");
    }

    const originalEvent = sharedEvent.event;
    if (!originalEvent || !(originalEvent instanceof mongoose.Document)) {
      throw new BadRequestError(
        "The shared event does not contain valid event data."
      );
    }

    const originalEventObject = originalEvent.toObject();

    delete originalEventObject._id;
    delete originalEventObject.createdBy;
    delete originalEventObject.copiedFrom;
    delete originalEventObject.createdAt;
    delete originalEventObject.updatedAt;

    const newEvent = new Event({
      ...originalEventObject,
      createdBy: userId,
      copiedFrom: originalEvent._id,
    });

    await newEvent.save({ session });

    await SharedEvent.deleteOne({ event: eventId, user: userId }).session(
      session
    );

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      message: "Shared event added to your events successfully.",
      event: newEvent,
    });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
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
