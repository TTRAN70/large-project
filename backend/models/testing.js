const mongoose = require("mongoose");
const Game = require("./Game.js");
const User = require("./User.js");
const Review = require("./Review.js");
const Refresh_token = require("./Refresh_token.js");
const Email_token = require("./Email_token.js");

async function testDB(){
    const resDel1 = await User.deleteMany({username: {$regex:".*"}}).exec();
    const resDel2 = await Game.deleteMany({title: {$regex:".*"}}).exec();
    const resDel3 = await Review.deleteMany({body: {$regex:".*"}}).exec();

    const user1 = await User.create({username:"testUser1", password:"testpw", avatar_name:"charlesMingus", email:"testEmail1@gmail.com" });
    const user2 = await User.create({username:"testUser2", password:"testpw", avatar_name:"keithJarrett", email:"testEmail2@gmail.com" });
    const game = await Game.create({title:"Fortnite", description:"Fortnite is an online video game and game platform developed by Epic Games and released in 2017. It is available in seven distinct game mode versions that otherwise share the same general gameplay and game engine.", release_year: 2017, cover_url: "", main_developer: "Epic Games", publisher: "Epic Games", genres: ["Battle Royale", "Third-Person Shooter", "Creative"], platforms: ["Xbox", "Playstation", "PC", "Mac", "Mobile", "Switch"]});
    game.save();
    user2.save();
    user1.playlist.push(game._id);
    user1.following.push(user2._id);
    user1.save();
    const userPopulated = await User.findOne({avatar_name: user1.avatar_name}).populate("playlist").populate("following").exec();
    console.log(userPopulated, "\n", userPopulated.following[0], userPopulated.playlist[0]);
    const review = await Review.create({user: user1._id, game: game._id, rating: 1, body: "I can't get a victory royale :("});
    review.save();
    const reviewPopulated = await Review.findOne({user: review.user}).populate("user", "avatar_name").populate("game", "title").exec();
    console.log(reviewPopulated);
}
module.exports = testDB;