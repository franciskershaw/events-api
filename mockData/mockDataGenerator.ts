import { faker } from "@faker-js/faker";
import dayjs from "dayjs";
import dotenv from "dotenv";
import mongoose from "mongoose";
import Event, { IEvent } from "../src/models/Event";
import EventCategory from "../src/models/EventCategory";
import User from "../src/models/User";

dotenv.config();

// Constants
const MAX_TOTAL_EVENTS = 500;
const DEFAULT_UPCOMING_EVENTS = 20;
const PAST_EVENTS_YEARS = 2;
const FUTURE_EVENTS_DAYS = 365;
const MAX_EVENT_DURATION_DAYS = 7;

// Weighted duration options to make the mock data more realistic
const EVENT_DURATION_WEIGHTS = {
  SAME_DAY: 0.8, // 80% of events are same-day
  MULTI_DAY: 0.2, // 20% are multi-day events
};

const generateMockEvents = async (
  userEmail: string,
  upcomingCount: number = DEFAULT_UPCOMING_EVENTS,
  pastCount?: number
) => {
  console.log(
    `Creating mock data, please wait...${
      pastCount
        ? ` (${pastCount} past events + ${upcomingCount} upcoming events)`
        : ` (${upcomingCount} upcoming events)`
    }`
  );
  try {
    // Validate total count
    const totalCount = upcomingCount + (pastCount || 0);
    if (totalCount > MAX_TOTAL_EVENTS) {
      throw new Error(
        `Total event count (${totalCount}) exceeds maximum limit of ${MAX_TOTAL_EVENTS} events. ` +
          `Upcoming: ${upcomingCount}, Past: ${pastCount || 0}`
      );
    }

    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is not defined in environment variables");
    }
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    const user = await User.findOne({ email: userEmail });
    if (!user) {
      throw new Error("User not found");
    }

    const categories = await EventCategory.find();
    if (categories.length === 0) {
      throw new Error("No event categories found");
    }

    // Delete existing events for this user
    const deleteResult = await Event.deleteMany({ createdBy: user._id });
    console.log(
      `Deleted ${deleteResult.deletedCount} existing events for user ${userEmail}`
    );

    const mockEvents: Partial<IEvent>[] = [];

    const generateEventDates = (baseDate: Date) => {
      const startDate = baseDate;
      let endDate = startDate;

      // Determine if this will be a multi-day event
      if (Math.random() > EVENT_DURATION_WEIGHTS.SAME_DAY) {
        // For multi-day events, add 1-7 days
        const additionalDays =
          Math.floor(Math.random() * MAX_EVENT_DURATION_DAYS) + 1;
        endDate = dayjs(startDate).add(additionalDays, "days").toDate();
      }

      return { start: startDate, end: endDate };
    };

    // Generate past events if pastCount is provided
    if (pastCount) {
      for (let i = 0; i < pastCount; i++) {
        const startDate = faker.date.past({ years: PAST_EVENTS_YEARS });
        const { start, end } = generateEventDates(startDate);

        const mockEvent: Partial<IEvent> = {
          title: faker.lorem.words({ min: 2, max: 5 }),
          date: { start, end },
          location: {
            venue: faker.lorem.words({ min: 2, max: 5 }),
            city: faker.location.city(),
          },
          category:
            categories[Math.floor(Math.random() * categories.length)]._id,
          createdBy: user._id,
          description: faker.lorem.paragraph(),
          private: false,
          unConfirmed: false,
        };

        mockEvents.push(mockEvent);
      }
    }

    // Generate current/future events
    for (let i = 0; i < upcomingCount; i++) {
      const startDate = faker.date.between({
        from: new Date(),
        to: dayjs().add(FUTURE_EVENTS_DAYS, "days").toDate(),
      });

      const { start, end } = generateEventDates(startDate);

      const mockEvent: Partial<IEvent> = {
        title: faker.lorem.words({ min: 2, max: 5 }),
        date: { start, end },
        location: {
          venue: faker.lorem.words({ min: 2, max: 5 }),
          city: faker.location.city(),
        },
        category: categories[Math.floor(Math.random() * categories.length)]._id,
        createdBy: user._id,
        description: faker.lorem.paragraph(),
        private: false,
        unConfirmed: false,
      };

      mockEvents.push(mockEvent);
    }

    await Event.insertMany(mockEvents);
    console.log(
      `Successfully created ${mockEvents.length} new mock events for user ${userEmail}` +
        (pastCount
          ? ` (${pastCount} past events + ${upcomingCount} upcoming events)`
          : ` (${upcomingCount} upcoming events)`)
    );

    await mongoose.disconnect();
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
};

// Allow running from command line
if (require.main === module) {
  const userEmail = process.argv[2];
  const upcomingCount = parseInt(
    process.argv[3] || String(DEFAULT_UPCOMING_EVENTS),
    10
  );
  const pastCount = process.argv[4] ? parseInt(process.argv[4], 10) : undefined;

  if (!userEmail) {
    console.error("Please provide your user email as an argument");
    process.exit(1);
  }

  generateMockEvents(userEmail, upcomingCount, pastCount)
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("Error:", error);
      process.exit(1);
    });
}

export default generateMockEvents;
