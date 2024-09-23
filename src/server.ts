import express from "express";
import dotenv from "dotenv";
dotenv.config();
import morgan from "morgan";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import cors from "cors";
import passport from "passport";
import "colors";
import connectDb from "./config/db";

const PORT = process.env.PORT || 5500;

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

// Routes (example for now)
app.get("/", (req, res) => {
  res.send("Hello, TypeScript with Express!");
});

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
