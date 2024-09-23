import mongoose from "mongoose";

const EventCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please add a category name"],
      trim: true,
    },
    faIcon: {
      type: String,
      required: [true, "Please add a FontAwesome icon reference"],
    },
  },
  { timestamps: true }
);

export default mongoose.model("EventCategory", EventCategorySchema);
