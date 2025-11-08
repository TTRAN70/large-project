// Load environment variables at the very start
require("dotenv").config({ path: "./.env" });

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const Game = require("./models/Game.js");
const User = require("./models/User.js");
const Review = require("./models/Review.js");
const Refresh_token = require("./models/Refresh_token.js");
const Email_token = require("./models/Email_token.js");


const app = express();
// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set("trust proxy", true);

// Build MongoDB URI from env
const dbURI = process.env.MONGODB_URI;
if (!dbURI) {
  console.error(
    "MongoDB URI is undefined! Please set MONGODB_URI in your .env file."
  );
  process.exit(1);
}

// Connect to MongoDB
mongoose
  .connect(dbURI /*, { useNewUrlParser: true, useUnifiedTopology: true } */)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err.message));

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/users", require("./routes/users"));

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "OK", message: "Server is running" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});