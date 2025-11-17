const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const EmailToken = require("../models/Email_token");
const ResetToken = require("../models/Reset_token"); // make sure this file exists (below)
const { randomBytes } = require("node:crypto");
const auth = require("../middleware/auth");
const mongoose = require("mongoose");
const Review = require("../models/Review");
const Game = require("../models/Game");
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const FRONTEND_URL =
  process.env.NODE_ENV === "development"
    ? process.env.FRONTEND_DEV_URI
    : process.env.FRONTEND_URL;

// Register
router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if user exists
    let user = await User.findOne({ $or: [{ email }, { username }] });
    if (user) {
      return res.status(400).json({ error: "User already exists" });
    }

    // Create new user
    user = new User({ username, email, password, isVerified: false });
    await user.save();

    // create email verification token
    const etoken = randomBytes(32).toString("hex");
    await EmailToken.create({
      user: user._id,
      token: etoken,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
    });

    // verification link
    const verifyUrl = `${FRONTEND_URL}/verify/${etoken}`;
    const msg = {
      to: user.email,
      from: process.env.SENDGRID_FROM_EMAIL,
      subject: "Verify your email",
      text: `Hi ${user.username}, verify your email here: ${verifyUrl}`,
      html: `<p>Hi ${user.username}, verify your email by clicking <a href="${verifyUrl}">this link</a>. Link expires in 1 hour.</p>`,
    };

    try {
      await sgMail.send(msg);
    } catch (error) {
      console.error("SendGrid send error:", error);
    }

    // Create JWT token
    const token = jwt.sign(
      { id: user._id, username: user.username },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "1d" }
    );

    res.status(201).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    // Check email verification
    if (!user.isVerified) {
      return res.status(400).json({ error: "Email not verified" });
    }

    // Create JWT token
    const token = jwt.sign(
      { id: user._id, username: user.username },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Verify
router.get("/verify/:token", async (req, res) => {
  try {
    const tokenDoc = await EmailToken.findOne({ token: req.params.token });
    if (!tokenDoc)
      return res.status(400).json({ error: "Invalid or expired token" });

    if (tokenDoc.expiresAt && tokenDoc.expiresAt < new Date()) {
      await EmailToken.deleteOne({ _id: tokenDoc._id });
      return res.status(400).json({ error: "Invalid or expired token" });
    }

    await User.findByIdAndUpdate(tokenDoc.user, { $set: { isVerified: true } });
    await EmailToken.deleteOne({ _id: tokenDoc._id });

    res.status(200).json({ message: "Email verified successfully!" });
  } catch (err) {
    console.error("Verify email error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Send forgot password
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    // Always generic response
    if (!user) {
      return res.status(200).json({
        message: "If an account exists, a reset link has been sent.",
      });
    }

    const etoken = randomBytes(32).toString("hex");

    // upsert: single active reset token per user (1h expiry)
    await ResetToken.findOneAndUpdate(
      { user: user._id },
      {
        user: user._id,
        token: etoken,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      },
      { upsert: true, new: true }
    );

    const resetUrl = `${FRONTEND_URL}/reset-password/${etoken}`;
    const msg = {
      to: user.email,
      from: process.env.SENDGRID_FROM_EMAIL,
      subject: "Reset your password",
      text: `Hi ${user.username}, reset your password here: ${resetUrl}`,
      html: `<p>Hi ${user.username}, reset your password by clicking <a href="${resetUrl}">this link</a>. Link expires in 1 hour.</p>`,
    };

    try {
      await sgMail.send(msg);
    } catch (error) {
      console.error("SendGrid send error:", error);
    }

    res.status(200).json({
      message: "If an account exists, a reset link has been sent.",
    });
  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Actually reset password
router.post("/reset-password/:token", async (req, res) => {
  try {
    const tokenDoc = await ResetToken.findOne({ token: req.params.token });
    if (!tokenDoc)
      return res.status(400).json({ error: "Invalid or expired token" });

    if (tokenDoc.expiresAt && tokenDoc.expiresAt < new Date()) {
      await ResetToken.deleteOne({ _id: tokenDoc._id });
      return res.status(400).json({ error: "Invalid or expired token" });
    }

    const user = await User.findById(tokenDoc.user);
    if (!user) {
      await ResetToken.deleteOne({ _id: tokenDoc._id });
      return res.status(400).json({ error: "Invalid or expired token" });
    }

    user.password = req.body.password;
    await user.save();

    await ResetToken.deleteOne({ _id: tokenDoc._id });

    res.json({ message: "Password reset was successful." });
  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Gets youself to follow User B.
// To this this to work on postman: Add header Authorization | Bearer <jwtToken>
router.post("/follow/:id", auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const followingId = req.params.id;

    // Finds your id and user B
    const user = await User.findById(userId);
    const following = await User.findById(followingId);

    // posible errors
    if (!following) return res.status(404).json({ error: "User not found" });
    if (user._id.toString() === following._id.toString()) {
      return res.status(400).json({ error: "You cannot follow yourself" });
    }
    if (user.following.some((id) => id.toString() === followingId)) {
      return res.status(400).json({ error: "You already follow this user" });
    }

    // updates your following list and user b's follower list
    user.following.push(following._id);
    following.followers.push(user._id);

    await user.save();
    await following.save();

    res
      .status(200)
      .json({ message: `You are now following ${following.username}` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Unfollow a user
// To use in Postman: Add header Authorization | Bearer <jwtToken>
router.post("/unfollow/:id", auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const unfollowId = req.params.id;

    // Find both users
    const user = await User.findById(userId);
    const unfollowUser = await User.findById(unfollowId);

    // types of error
    if (!unfollowUser) {
      return res.status(404).json({ error: "User not found" });
    }
    if (user._id.toString() === unfollowUser._id.toString()) {
      return res.status(400).json({ error: "You cannot unfollow yourself" });
    }

    if (!user.following.some((id) => id.toString() === unfollowId)) {
      return res.status(400).json({ error: "You are not following this user" });
    }

    // Remove each from the other's array
    user.following = user.following.filter(
      (id) => id.toString() !== unfollowId
    );
    unfollowUser.followers = unfollowUser.followers.filter(
      (id) => id.toString() !== userId
    );

    // Save changes
    await user.save();
    await unfollowUser.save();

    res
      .status(200)
      .json({ message: `You have unfollowed ${unfollowUser.username}` });
  } catch (error) {
    console.error("Error in /unfollow/:id:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// Get current user's profile secured
// get jwt token from login enpoint
// On postman: Add header Authorization | Bearer <jwtToken>
router.get("/profile/me", auth, async (req, res) => {
  try {
    //Gets the user and displays info, no password, and follower/following username
    const user = await User.findById(req.user.id)
      .select("-password")
      .populate("followers", "username")
      .populate("following", "username")
      .populate("playlist")
      .lean(); // plain JS object

    // Replace followers/following with just usernames
    user.followers = user.followers.map((f) => f.username);
    user.following = user.following.map((f) => f.username);
    // # of followers/following (unsure if needed)
    // user.followersCount = user.followers.length;
    // user.followingCount = user.following.length;

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// edit your profile's username and bio
// get jwt token from login enpoint
// On postman: Add header Authorization | Bearer <jwtToken>
router.post("/profile/edit", auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { username, bio } = req.body;

    // Find the user
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    // Only update allowed fields
    // if bio is "" it clears it, not in body does nothing
    if (username) user.username = username;
    if (bio !== undefined) user.bio = bio;

    // Save changes
    await user.save();

    // Return updated user (without password/)
    const updatedUser = await User.findById(userId)
      .select("-password -email")
      .populate("followers", "username")
      .populate("following", "username");

    res.status(200).json(updatedUser);
  } catch (error) {
    // Handle duplicate username
    if (error.code === 11000) {
      return res.status(400).json({ error: "Username already in use" });
    }
    res.status(500).json({ error: error.message });
  }
});

// delete your own profile
// get jwt token from login enpoint
// On postman: Add header Authorization | Bearer <jwtToken>
router.post("/profile/delete", auth, async (req, res) => {
  try {
    const userId = req.user.id;

    // Find the user
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "Account does not exist" });

    // Remove user from others' followers/following lists
    await User.updateMany(
      { followers: userId },
      { $pull: { followers: userId } }
    );
    await User.updateMany(
      { following: userId },
      { $pull: { following: userId } }
    );

    // Delete all of this user's reviews
    await Review.deleteMany({ user: userId });

    // Delete any refresh, email, or reset tokens linked to this user
    await EmailToken.deleteMany({ user: userId });
    await ResetToken.deleteMany({ user: userId });

    // Finally, delete the user document itself
    await User.findByIdAndDelete(userId);

    // Respond with confirmation
    res
      .status(200)
      .json({ message: "Your account and related data have been deleted" });
  } catch (error) {
    console.error("Error deleting profile:", error);
    res.status(500).json({ error: "Server error while deleting profile" });
  }
});

// GET all reviews by a specific user (public)
router.get("/profile/:id/reviews", async (req, res) => {
  try {
    const userId = req.params.id;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    // Check if user exists
    const user = await User.findById(userId).select("username").lean();
    if (!user) return res.status(404).json({ error: "User not found" });

    // Get reviews, newest first
    const reviews = await Review.find({ user: userId })
      .sort({ createdAt: -1 })
      .populate("game", "title") // populate only title
      .lean();

    // Format reviews
    const formatted = reviews.map((r) => ({
      id: r._id,
      game: r.game?.title || "Unknown",
      rating: r.rating,
      body: r.body,
      createdAt: r.createdAt,
    }));

    res.json({
      user: user.username,
      reviews: formatted, // empty array if no reviews
    });
  } catch (error) {
    console.error("Error fetching user reviews:", error.message);
    res.status(500).json({ error: "Server error" });
  }
});

// Get any user's profile by ID same as above without auth (secure)
router.get("/profile/:id", async (req, res) => {
  try {
    //Gets the user and displays info, no password, and follower/following username
    const user = await User.findById(req.params.id)
      .select("-password")
      .populate("followers", "username")
      .populate("following", "username")
      .lean(); // plain JS object

    // error if incorrect id
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Replace followers/following with just usernames
    user.followers = user.followers.map((f) => f.username);
    user.following = user.following.map((f) => f.username);

    // # of followers/following (unsure if needed)
    // user.followersCount = user.followers.length;
    // user.followingCount = user.following.length;

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /game with multiple search parameters
// Example: /game?title=Zelda&genre=Adventure&platform=Switch&publisher=Nintendo
// will eventually want to add a sort option after return
// put a limit so it doesn't brick me
router.get("/game", async (req, res) => {
  try {
    //for now 20 but later add as parameter
    const LIMIT = 20;

    // optional choices in the body
    // will error if no search parameters :/ ( for now)
    const {
      title,
      genre,
      platform,
      release_year,
      main_developer,
      publisher,
      description,
    } = req.query;

    const filter = {};

    if (title) {
      filter.title = { $regex: title, $options: "i" };
    }

    if (genre) {
      filter.genres = { $in: [new RegExp(genre, "i")] };
    }

    if (platform) {
      filter.platforms = { $in: [new RegExp(platform, "i")] };
    }

    // makes sure it's a number
    if (release_year && isNaN(Number(release_year))) {
      return res.status(400).json({ error: "release_year must be a number" });
    }
    if (release_year) {
      filter.release_year = Number(release_year);
    }

    if (main_developer) {
      filter.main_developer = { $regex: main_developer, $options: "i" };
    }

    if (publisher) {
      filter.publisher = { $regex: publisher, $options: "i" };
    }

    if (description) {
      filter.description = { $regex: description, $options: "i" };
    }

    // Find games matching filter, sorted alphabetically
    const games = await Game.find(filter)
      .sort({ title: 1 })
      .limit(LIMIT)
      .lean();

    res.json(games);
  } catch (error) {
    console.error("Error fetching games:", error.message);
    res.status(500).json({ error: "Server error" });
  }
});

// Adds game to your playlist
// get jwt token from login enpoint
// On postman: Add header Authorization | Bearer <jwtToken>
router.post("/watch/:id", auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const gameId = req.params.id;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(gameId)) {
      return res.status(400).json({ error: "Invalid game ID" });
    }

    // Check if game exists
    const game = await Game.findById(gameId);
    if (!game) {
      return res.status(404).json({ error: "Game not found" });
    }

    // Find user
    const user = await User.findById(userId);

    // Prevent duplicates
    if (user.playlist.some((id) => id.toString() === gameId)) {
      return res.status(400).json({ error: "Game already in playlist" });
    }

    // Add game to playlist
    user.playlist.push(game._id);
    await user.save();

    res.status(200).json({ message: `${game.title} added to your playlist!` });
  } catch (error) {
    console.error("Error adding game to playlist:", error.message);
    res.status(500).json({ error: "Server error" });
  }
});

// deletes the game from playlist
// get jwt token from login enpoint
// On postman: Add header Authorization | Bearer <jwtToken>
router.delete("/watch/:id", auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const gameId = req.params.id;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(gameId)) {
      return res.status(400).json({ error: "Invalid game ID" });
    }

    // Check if game exists
    const game = await Game.findById(gameId);
    if (!game) {
      return res.status(404).json({ error: "Game not found" });
    }

    // Find user
    const user = await User.findById(userId);

    // Check if game is in playlist
    if (!user.playlist.some((id) => id.toString() === gameId)) {
      return res.status(400).json({ error: "Game not in playlist" });
    }

    // Remove game from playlist
    user.playlist = user.playlist.filter((id) => id.toString() !== gameId);
    await user.save();

    res
      .status(200)
      .json({ message: `${game.title} removed from your playlist.` });
  } catch (error) {
    console.error("Error removing game from playlist:", error.message);
    res.status(500).json({ error: "Server error" });
  }
});

// make a review for a game
// get jwt token from login enpoint
// On postman: Add header Authorization | Bearer <jwtToken>
router.post("/review", auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { gameId, rating, body } = req.body;

    // list of errors
    if (!gameId || !rating || !body) {
      return res
        .status(400)
        .json({ error: "gameId, rating, and body are required" });
    }

    if (!mongoose.Types.ObjectId.isValid(gameId)) {
      return res.status(400).json({ error: "Invalid game ID" });
    }

    if (typeof rating !== "number" || rating < 0 || rating > 10) {
      return res
        .status(400)
        .json({ error: "Rating must be a number between 0 and 10" });
    }

    if (body.length > 1000) {
      return res
        .status(400)
        .json({ error: "Review body cannot exceed 1000 characters" });
    }

    // Check if game exists
    const game = await Game.findById(gameId);
    if (!game) {
      return res.status(404).json({ error: "Game not found" });
    }

    // Can't review spam
    const existingReview = await Review.findOne({ user: userId, game: gameId });
    if (existingReview) {
      return res
        .status(400)
        .json({ error: "You have already reviewed this game" });
    }

    // Create the review
    const review = new Review({
      user: userId,
      game: gameId,
      rating,
      body,
    });

    await review.save();

    res.status(201).json({ message: "Review created successfully", review });
  } catch (error) {
    console.error("Error creating review:", error.message);
    res.status(500).json({ error: "Server error" });
  }
});

// deletes your review made for a game
// get jwt token from login enpoint
// On postman: Add header Authorization | Bearer <jwtToken>
router.delete("/review/:id", auth, async (req, res) => {
  try {
    const reviewId = req.params.id;
    const userId = req.user.id;

    // Find the review
    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ error: "Review not found" });
    }

    // Check ownership
    if (review.user.toString() !== userId) {
      return res
        .status(403)
        .json({ error: "You are not allowed to delete this review" });
    }

    // Delete review
    await Review.findByIdAndDelete(reviewId);

    res.json({ message: "Review deleted successfully" });
  } catch (error) {
    console.error("Error deleting review:", error.message);
    res.status(500).json({ error: "Server error" });
  }
});

// PUT update a review by ID
// Requires auth and ownership
router.put("/review/:id", auth, async (req, res) => {
  try {
    const reviewId = req.params.id;
    const userId = req.user.id;
    const { rating, body } = req.body;

    if (!mongoose.Types.ObjectId.isValid(reviewId)) {
      return res.status(400).json({ error: "Invalid review ID" });
    }

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ error: "Review not found" });
    }

    // Check ownership
    if (review.user.toString() !== userId) {
      return res
        .status(403)
        .json({ error: "You are not allowed to update this review" });
    }

    // Validate fields if provided
    if (rating !== undefined) {
      if (typeof rating !== "number" || rating < 0 || rating > 10) {
        return res
          .status(400)
          .json({ error: "Rating must be a number between 0 and 10" });
      }
      review.rating = rating;
    }

    if (body !== undefined) {
      if (body.length > 1000) {
        return res
          .status(400)
          .json({ error: "Review body cannot exceed 1000 characters" });
      }
      review.body = body;
    }

    await review.save();

    res.json({ message: "Review updated successfully", review });
  } catch (error) {
    console.error("Error updating review:", error.message);
    res.status(500).json({ error: "Server error" });
  }
});

// Get a review by its gameID
router.get("/review/:id", async (req, res) => {
  try {
    const gameId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(gameId)) {
      return res.status(400).json({ error: "Invalid game ID" });
    }

    // get the reviewer's username // get the game title
    const reviews = await Review.find({ game: gameId })
      .populate("user", "username")
      .populate("game", "title")
      .lean();

    if (!reviews) {
      return res.status(404).json({ error: "Review not found" });
    }

    res.json(reviews);
  } catch (error) {
    console.error("Error fetching review:", error.message);
    res.status(500).json({ error: "Server error" });
  }
});

// GET all games reviewed by a specific user
router.get("/games/reviewed", auth, async (req, res) => {
  try {
    const userId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    // Find all reviews by this user
    const reviews = await Review.find({ user: userId }).lean();

    if (reviews.length === 0) {
      return res.status(404).json({ error: "No reviews found for this user" });
    }

    // Extract unique game IDs from reviews
    const gameIds = [
      ...new Set(reviews.map((review) => review.game.toString())),
    ];

    // Fetch all games that match these IDs
    const games = await Game.find({ _id: { $in: gameIds } }).lean();

    res.json(games);
  } catch (error) {
    console.error("Error fetching user's reviewed games:", error.message);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
