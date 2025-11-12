const { api } = require("./util");
const User = require("../models/User");
const jwt = require("jsonwebtoken");

describe("Follow/Unfollow endpoints", () => {
  let user1, user2, token;

  beforeEach(async () => {
    user1 = await User.create({
      email: "user1@test.com",
      password: "password123",
      username: "User1",
      isVerified: true,
    });
    user2 = await User.create({
      email: "user2@test.com",
      password: "password123",
      username: "User2",
      isVerified: true,
    });

    token = jwt.sign(
      { id: user1._id, username: user1.username },
      process.env.ACCESS_TOKEN_SECRET || "testsecret"
    );
  });

  it("follows another user", async () => {
    const res = await api
      .post(`/api/auth/follow/${user2._id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    const updated = await User.findById(user1._id);
    expect(updated.following).toContainEqual(user2._id);
  });

  it("unfollows another user", async () => {
    user1.following.push(user2._id);
    await user1.save();

    const res = await api
      .post(`/api/auth/unfollow/${user2._id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    const updated = await User.findById(user1._id);
    expect(updated.following).not.toContainEqual(user2._id);
  });

  it("integration: follows then unfollows another user", async () => {
    let res;
    let updated;

    res = await api
      .post(`/api/auth/follow/${user2._id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    updated = await User.findById(user1._id);
    expect(updated.following).toContainEqual(user2._id);

    res = await api
      .post(`/api/auth/unfollow/${user2._id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    updated = await User.findById(user1._id);
    expect(updated.following).not.toContainEqual(user2._id);
  });
});
