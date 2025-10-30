// Load environment variables at the very start
require('dotenv').config({ path: '../.env' });


const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

// ... (other requires like models, routes, etc.)

const Game = require("./models/Game.js");
const User = require("./models/User.js");
const Review = require("./models/Review.js");
const Refresh_token = require("./models/Refresh_token.js");
const Email_token = require("./models/Email_token.js");
//remove line 12 before deployment
const test = require("./models/testing.js");


const app = express();
// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Build MongoDB URI from environment variable
const dbURI = process.env.MONGODB_URI;
if (!dbURI) {
  console.error("MongoDB URI is undefined! Please set MONGODB_URI in your .env file.");
  // Optionally, provide a fallback for development:
  // dbURI = "mongodb://127.0.0.1:27017/your_local_db";
  // If no fallback is desired, exit to avoid using an undefined URI:
  process.exit(1);
}

// Connect to MongoDB (with error handling)
mongoose.connect(dbURI /*, { useNewUrlParser: true, useUnifiedTopology: true } */)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB connection error:", err.message));

// ... (your routes and other server logic)
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
