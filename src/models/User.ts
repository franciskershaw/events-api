import mongoose, { Document, Model } from "mongoose";

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  email: string;
  password?: string;
  name: string;
  role: "user" | "admin";
  connectionId: string;
  provider: "google" | "local";
  googleId?: string;
  preferences: {
    theme?: string;
    defaultView?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Please add an email"],
      unique: true,
      trim: true,
      lowercase: true,
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },
    password: {
      type: String,
      select: false,
    },
    name: {
      type: String,
      trim: true,
      required: [true, "Please add a name"],
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    connectionId: {
      type: String,
      required: true,
      unique: true,
    },
    provider: {
      type: String,
      enum: ["google", "local"],
      required: true,
    },
    preferences: {
      theme: { type: String, default: "light" },
      defaultView: { type: String, default: "upcoming" },
    },
  },
  { timestamps: true }
);

const User: Model<IUser> = mongoose.model<IUser>("User", UserSchema);
export default User;
