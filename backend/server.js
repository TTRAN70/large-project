// Load environment variables at the very start
require("dotenv").config({ path: "../.env" });

const mongoose = require("mongoose");
const app = require("./app");

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
  .then(() => {
    console.log("MongoDB connected");
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => console.error("MongoDB connection error:", err.message));
