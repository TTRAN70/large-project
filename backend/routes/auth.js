const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const EmailToken = require("../models/Email_token");
const ResetToken = require("../models/Reset_token"); // make sure this file exists (below)
const nodemailer = require("nodemailer");
const { randomBytes } = require("node:crypto");

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

const transporter = nodemailer.createTransport({
  service: "gmail", // or use host/port below
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});


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
    user = new User({ username, email, password });
    await user.save();

     // create email verification token
    const etoken = randomBytes(32).toString("hex");
    await EmailToken.create({
      user: user._id,
      token: etoken,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000)
    });

    // verification link
    const verifyUrl = `${FRONTEND_URL}/verify/${etoken}`;
	await transporter.sendMail({
      from: `"GameRater" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: "Verify your email",
      html: `<p>Hi ${user.username}, verify your email by clicking <a href="${verifyUrl}">this link</a>. Link expires in 1 hour.</p>`
    });


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
    if (!tokenDoc) return res.status(400).json({ error: "Invalid or expired token" });

    if (tokenDoc.expiresAt && tokenDoc.expiresAt < new Date()) {
      await EmailToken.deleteOne({ _id: tokenDoc._id });
      return res.status(400).json({ error: "Invalid or expired token" });
    }

    await User.findByIdAndUpdate(tokenDoc.user, { $set: { isVerified: true } });
    await EmailToken.deleteOne({ _id: tokenDoc._id });

    res.json({ message: "Email verified successfully!" });
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
      return res.json({
        message: "If an account exists, a reset link has been sent."
      });
    }

    const etoken = randomBytes(32).toString("hex");

    // upsert: single active reset token per user (1h expiry)
    await ResetToken.findOneAndUpdate(
      { user: user._id },
      { user: user._id, token: etoken, expiresAt: new Date(Date.now() + 60 * 60 * 1000)},
      { upsert: true, new: true }
    );

    const resetUrl = `${FRONTEND_URL}/reset-password/${etoken}`;
    await transporter.sendMail({
      from: `"GameRater" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: "Password Reset",
      html: `<p>Reset your password by clicking <a href="${resetUrl}">this link</a>. Link expires in 1 hour.</p>`
    });

    res.json({
      message: "If an account exists, a reset link has been sent."
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
    if (!tokenDoc) return res.status(400).json({ error: "Invalid or expired token" });

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

    res.json({ message: "Password reset successfully." });
  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).json({ error: "Server error" });
  }
}); 


module.exports = router;
