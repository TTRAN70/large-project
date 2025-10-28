const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      trim: true,
      minlength: 6,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    isVerified: {
      type: Boolean,
      default: false
    },
    avatar_name: {
      type: String,
      required: true,
      unique: true
    },
  //enforce arbitrary bio length
    bio: {
      type: String,
      maxlength: 300,
      default: ""
    },
    playlist: {
      type: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Game'
    }]
    },
  //cannot follow the same user twice on either end of relationship
    following: {
      type: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        unique: true
    }]
    },
    followers: {
      type: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        unique: true
    }]
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
