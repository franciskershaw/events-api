import express from "express";
import dotenv from "dotenv";
dotenv.config();

const app = express();

// Middleware
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
