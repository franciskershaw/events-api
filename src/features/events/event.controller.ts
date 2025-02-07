import { NextFunction, Request, Response } from "express";

import Event from "./event.model";
import EventCategory from "./category/category.model";
import { IUser } from "../users/user.model";
import { createEventSchema, updateEventSchema } from "./event.validation";
import validateRequest from "../../core/utils/validate";
import dayjs from "dayjs";
import User from "../users/user.model";

// Create an event and add it to the user's array of events
export const createEvent = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req.user as IUser)._id;

    const eventData = validateRequest(req.body, createEventSchema);
    eventData.createdBy = userId;

    if (!eventData.date.end) {
      eventData.date.end = eventData.date.start;
    }

    const event = new Event(eventData);
    await event.save();

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

    // Get the current user with their connections
    const currentUser = await User.findById(userId).select("connections");
    if (!currentUser) {
      throw new Error("User not found");
    }

    // Create an array of user IDs including the current user and their connections
    const userIds = [
      userId,
      ...currentUser.connections.map((connection) => connection._id),
    ];

    const events = await Event.find({
      $or: [{ "date.end": { $gte: now } }, { "date.start": { $gte: now } }],
      createdBy: { $in: userIds },
    })
      .populate("category", "name icon")
      .populate("createdBy", "name")
      .sort({ "date.start": 1 })
      .lean();

    res.status(200).json(events);
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

    const totalEvents = createdEvents.length;
    const paginatedEvents = createdEvents.slice(
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

// Toggle event privacy
export const toggleEventPrivacy = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const eventId = req.params.eventId;
    const userId = (req.user as IUser)._id;

    const event = await Event.findOne({ _id: eventId, createdBy: userId });

    if (!event) {
      throw new Error(
        "Event not found or you don't have permission to modify it"
      );
    }

    event.private = !event.private;
    await event.save();

    res.status(200).json({
      message: `Event privacy ${
        event.private ? "enabled" : "disabled"
      } successfully`,
      private: event.private,
    });
  } catch (err) {
    next(err);
  }
};
