import { Request, Response, NextFunction } from "express";
import { IUser } from "../models/User";
import validateRequest from "../utils/validate";
import { newEventSchema, updateEventSchema } from "../utils/schemas";
import Event from "../models/Event";
import SharedEvent from "../models/SharedEvent";
import EventCategory from "../models/EventCategory";

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
    const categories = await EventCategory.find();
    res.status(200).json(categories);
  } catch (err) {
    next(err);
  }
};

export const getUserEvents = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req.user as any)._id;

    const createdEvents = await Event.find({
      $or: [
        { "date.end": { $gte: new Date() } },
        { "date.start": { $gte: new Date() } },
      ],
      createdBy: userId,
    })
      .populate("category", "name icon")
      .populate("createdBy", "name")
      .lean();

    const sharedEventLinks = await SharedEvent.find({ user: userId })
      .populate({
        path: "event",
        populate: [
          { path: "category", select: "name icon" },
          { path: "createdBy", select: "name" },
        ],
        match: {
          $or: [
            { "date.end": { $gte: new Date() } },
            { "date.start": { $gte: new Date() } },
          ],
        },
      })
      .lean();

    const sharedEvents = sharedEventLinks
      .map((link: any) => link.event)
      .filter(Boolean);

    const allEvents = [...createdEvents, ...sharedEvents];

    res.status(200).json(allEvents);
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
