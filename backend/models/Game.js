const mongoose = require("mongoose");

const gameSchema = new mongoose.Schema(
  {
  //attempt loose enforcement of no duplicate entries
    title:{
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description:{
      type: String,
      required: true,
      trim: true,
    },
  //earliest known game was released to public in 1948
    release_year:{
      type: Number,
      min: 1948
    },
    cover_url:{
      type: String
    },
    main_developer:{
      type: String
    },
    publisher:{
      type: String
    },
  //same as 1st note
    genres:{
      type: [{
        type: String,
        unique: true
      }]
    },
    platforms:{
      type: [{
        type: String,
        unique: true
      }]
    } 
  },
  {
    timestamps: false,
  }
);

//TODO: add pre-add hook to populate url field by default

module.exports = mongoose.model("Game", gameSchema);
