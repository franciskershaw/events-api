import mongoose, { ValidatorProps, Model, Document } from "mongoose";

export interface IEvent extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  date: {
    start: Date;
    end?: Date;
  };
  location: string;
  category: mongoose.Types.ObjectId;
  additionalAttributes: Object;
  sharedWith: mongoose.Types.ObjectId[];
  extraInfo: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

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
    },
    location: {
      type: String,
      trim: true,
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

const Event: Model<IEvent> = mongoose.model<IEvent>("Event", EventSchema);
export default Event;
