import mongoose, { Document, Model } from "mongoose";

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  email: string;
  password?: string;
  name: string;
  role: "user" | "admin";
  connectionId: {
    id: string;
    expiry: Date;
  };
  provider: "google" | "local";
  googleId?: string;
  preferences: {
    connectionPreferences: {
      [key: string]: {
        hideEvents: boolean;
      };
    };
  };
  connections: mongoose.Types.ObjectId[];
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
      id: {
        type: String,
        unique: true,
      },
      expiry: {
        type: Date,
      },
    },
    provider: {
      type: String,
      enum: ["google", "local"],
      required: true,
    },
    preferences: {
      connectionPreferences: {
        type: Map,
        of: new mongoose.Schema(
          {
            hideEvents: { type: Boolean, default: false },
          },
          { _id: false }
        ),
        default: new Map(),
      },
    },
    connections: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

const User: Model<IUser> = mongoose.model<IUser>("User", UserSchema);
export default User;
