import mongoose, { Document, Model } from "mongoose";

export interface IEvent extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  date: {
    start: Date;
    end?: Date;
  };
  location?: {
    venue?: string;
    city?: string;
  };
  description?: string;
  category: mongoose.Types.ObjectId;
  additionalAttributes?: Record<string, any>;
  copiedFrom?: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
  private: boolean;
  unConfirmed: boolean;
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
        type: Date,
      },
    },
    location: {
      venue: {
        type: String,
        trim: true,
      },
      city: {
        type: String,
        trim: true,
      },
    },
    description: {
      type: String,
      trim: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "EventCategory",
      required: [true, "Please specify the event category"],
    },
    additionalAttributes: {
      type: Object,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Event must have a creator"],
    },
    private: {
      type: Boolean,
      default: false,
    },
    unConfirmed: {
      type: Boolean,
      default: false,
    },
    copiedFrom: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      default: null,
    },
  },
  { timestamps: true }
);

const Event: Model<IEvent> = mongoose.model<IEvent>("Event", EventSchema);
export default Event;
