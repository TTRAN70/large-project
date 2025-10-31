const mongoose = require("mongoose");

const resetTokenSchema = new mongoose.Schema(
  {
    user:      { type: mongoose.Types.ObjectId, ref: "Users", required: true },
    token:     { type: String, required: true },
    expiresAt: { type: Date }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Reset_token", resetTokenSchema);
