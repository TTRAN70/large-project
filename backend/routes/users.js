const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const User = require("../models/User");

// Get current user (protected route)
router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all users with search (protected route)
router.get("/", auth, async (req, res) => {
  try {
    // optional choices in the body
    // will error if no search parameters :/ ( for now)
    const { username } = req.query;

    const filter = {};

    if (username) {
      filter.username = { $regex: username, $options: "i" };
    }
    // Find games matching filter, sorted alphabetically
    const users = await User.find(filter).select("-password");

    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
