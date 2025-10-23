const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    game:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Game',
        required: true
    },
    rating:{
        type: Number,
        minimum: 0,
        maximum: 10,
        required: true
    },
    body:{
        type: String,
        maxLength: 1000,
        required: true
    }
  },
  {
    timestamps: true
  }
);

//TODO: add helper functions if necessary/convenient 

module.exports = mongoose.model("Review", reviewSchema);
