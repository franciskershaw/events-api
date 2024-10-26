import mongoose from "mongoose";

const EventCategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please add a category name"],
    trim: true,
  },
  icon: {
    type: String,
    required: [true, "Please add an icon reference"],
  },
});

export default mongoose.model("EventCategory", EventCategorySchema);
