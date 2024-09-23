import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
dotenv.config();

const app = express();

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
} else {
  app.use(morgan("combined"));
}

// Middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Example route
app.get("/", (req, res) => {
  res.send("Hello, TypeScript with Express!");
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
