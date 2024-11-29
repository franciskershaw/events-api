import mongoose from "mongoose";
import dotenv from "dotenv";
import { faker } from "@faker-js/faker";
import User from "../src/models/User";
import Event, { IEvent } from "../src/models/Event";
import EventCategory from "../src/models/EventCategory";

dotenv.config();

const generateMockEvents = async (
  userEmail: string,
  upcomingCount: number = 20,
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
    await mongoose.connect(process.env.MONGO_URI!);
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

    // Generate past events if pastCount is provided
    if (pastCount) {
      for (let i = 0; i < pastCount; i++) {
        const startDate = faker.date.past({ years: 2 }); // Random date within past 2 years
        const endDate = faker.date.between({
          from: startDate,
          to: new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000),
        });

        const mockEvent: Partial<IEvent> = {
          title: faker.lorem.words({ min: 2, max: 5 }),
          date: {
            start: startDate,
            end: endDate,
          },
          location: faker.location.city(),
          category:
            categories[Math.floor(Math.random() * categories.length)]._id,
          createdBy: user._id,
          extraInfo: faker.lorem.paragraph(),
          sharedWith: [],
        };

        mockEvents.push(mockEvent);
      }
    }

    // Generate current/future events
    for (let i = 0; i < upcomingCount; i++) {
      const startDate = faker.date.between({
        from: new Date(),
        to: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      });

      const endDate = faker.date.between({
        from: startDate,
        to: new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000),
      });

      const mockEvent: Partial<IEvent> = {
        title: faker.lorem.words({ min: 2, max: 5 }),
        date: {
          start: startDate,
          end: endDate,
        },
        location: faker.location.city(),
        category: categories[Math.floor(Math.random() * categories.length)]._id,
        createdBy: user._id,
        extraInfo: faker.lorem.paragraph(),
        sharedWith: [],
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
  const upcomingCount = parseInt(process.argv[3] || "20", 10);
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
