const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

const Games = require("./models/Games.js");
const Users = require("./models/Users.js");

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));
setTimeout(()=>{console.log('wait');}, 1000000);

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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

async function testing(){

  let fortnite = await Games.find({title:"Fortnite"}).exec();
  const new2 = new mongoose.Types.ObjectId(fortnite._id);
  console.log(new2);
  let user = await Users.findOneAndUpdate({username:"testuser1"}, {playlist: [new2]}, {new: true}).exec();
  await Users.populate(user, {path:'playlist.games'});
  user.save();
  console.log(user);
}

testing();
