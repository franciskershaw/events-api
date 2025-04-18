import mongoose, { Document, Model } from "mongoose";

export interface IEvent extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  date: {
    start: string;
    end?: string;
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
  recurrence: {
    isRecurring: boolean;
    pattern: {
      frequency: "daily" | "weekly" | "monthly" | "yearly";
      interval: number; // every X days/weeks/months/years
      startDate: string; // when recurrence ends
      endDate: string; // when recurrence ends
    };
  };
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
        type: String,
        required: [true, "Please add a start date for the event"],
      },
      end: {
        type: String,
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
      index: true,
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
      index: true,
    },
    recurrence: {
      isRecurring: {
        type: Boolean,
        default: false,
      },
      pattern: {
        frequency: {
          type: String,
          enum: ["daily", "weekly", "monthly", "yearly"],
          default: "weekly",
        },
        interval: {
          type: Number,
          default: 1,
        },
        daysOfWeek: {
          type: [Number],
          default: [],
        },
        startDate: {
          type: String,
        },
        endDate: {
          type: String,
        },
        count: {
          type: Number,
        },
      },
    },
  },
  {
    timestamps: true,
    // This is the key setting - don't convert dates on Mongoose's side
    strict: true,
  }
);

EventSchema.index({ "date.start": 1, "date.end": 1 });

const Event: Model<IEvent> = mongoose.model<IEvent>("Event", EventSchema);
export default Event;
