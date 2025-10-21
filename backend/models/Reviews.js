const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    user:{
        type: mongoose.Types.ObjectId,
        ref: 'Users',
        required: true
    },
    game:{
        type: mongoose.Types.ObjectId,
        ref: 'Games',
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

module.exports = mongoose.model("Reviews", reviewSchema);
