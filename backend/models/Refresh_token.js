const mongoose = require("mongoose");

const rTokenSchema = new mongoose.Schema(
  {
    user:{
        type: mongoose.Types.ObjectId,
        ref: 'Users',
        required: true
    },
    token:{
        type: String,
        required: true
    },
    expiresAt:{
        type: Date
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Refresh_token", rTokenSchema);