import mongoose, { Document, Model } from "mongoose";

export interface IEventCategory extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  icon: string;
  createdBy?: mongoose.Types.ObjectId; // Allows custom categories per user
}

const EventCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please add a category name"],
      trim: true,
    },
    icon: {
      type: String,
      required: [true, "Please add an icon reference"],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Null if it's a default global category
    },
  },
  { timestamps: true }
);

const EventCategory: Model<IEventCategory> = mongoose.model<IEventCategory>(
  "EventCategory",
  EventCategorySchema
);
export default EventCategory;
