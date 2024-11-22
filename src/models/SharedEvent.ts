import mongoose, { Document, Model } from "mongoose";

export interface ISharedEvent extends Document {
  event: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  permissions: "view" | "edit";
  createdAt: Date;
  updatedAt: Date;
}

const SharedEventSchema = new mongoose.Schema(
  {
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    permissions: {
      type: String,
      enum: ["view", "edit"],
      default: "view",
    },
  },
  { timestamps: true }
);

const SharedEvent: Model<ISharedEvent> = mongoose.model<ISharedEvent>(
  "SharedEvent",
  SharedEventSchema
);
export default SharedEvent;
