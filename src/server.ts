import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import cors from "cors";
import passport from "passport";
dotenv.config();

const PORT = process.env.PORT || 5400;

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
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
