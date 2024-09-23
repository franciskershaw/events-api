import mongoose from "mongoose";

const EventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Please add a title for the event"],
      trim: true,
    },
    date: {
      start: {
        type: Date,
        required: [true, "Please add a start date for the event"],
      },
      end: {
        type: Date, // Optional, only needed if it's a multi-day event
      },
      time: {
        type: String, // Optional, if you need to store time as a string (e.g., "14:00")
      },
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "EventCategory",
      required: [true, "Please specify the event category"],
    },
    additionalAttributes: {
      type: Object, // Flexible object for category-specific fields (e.g., kickOff for sport)
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Event must have a creator"],
    },
    sharedWith: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    extraInfo: {
      type: String,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Event", EventSchema);
