import express from "express";
import dotenv from "dotenv";
dotenv.config();
import morgan from "morgan";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import cors from "cors";
import passport from "./core/config/passport";
import authRoutes from "./features/auth/auth.routes";
import userRoutes from "./features/users/user.routes";
import eventRoutes from "./features/events/event.routes";
import "colors";
import connectDb from "./core/config/database";
import { errorHandler } from "./core/middleware/error.middleware";

// Declare port to run server on
const PORT = process.env.PORT || 5500;

// Initialise app
const app = express();

// Logger
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
} else {
  app.use(morgan("combined"));
}

// Parser
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Cookies
app.use(cookieParser());

// Basic security
app.use(helmet());

// Cors
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

// Passport / Auth
app.use(passport.initialize());

// Routes
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);

app.get("/", (_, res) => {
  res.status(200).json({ message: "Welcome to the Organisey API" });
});

// Error handler
app.use(errorHandler);

// Connect to DB and start the server
connectDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(
        `Server running in ${process.env.NODE_ENV} mode on port ${PORT}\n`
          .yellow,
        "-----------------------------------------------------------".yellow
      );
    });
  })
  .catch((err) => {
    console.error(
      `Error connecting to MongoDB: ${err.message}`.red.underline.bold
    );
    process.exit(1);
  });
