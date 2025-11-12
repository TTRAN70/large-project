const { api } = require("./util");
const User = require("../models/User");
const jwt = require("jsonwebtoken");

describe("Profile endpoints", () => {
  let token;
  let userId;

  beforeEach(async () => {
    const user = await User.create({
      email: "user@test.com",
      password: "password123",
      username: "User1",
      bio: "This is my bio.",
    });
    userId = user._id;
    token = jwt.sign(
      { id: userId, username: user.username },
      process.env.ACCESS_TOKEN_SECRET || "testsecret"
    );
  });

  it("fetches own profile", async () => {
    const res = await api
      .get("/api/auth/profile/me")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.email).toBe("user@test.com");
  });

  it("edits own profile", async () => {
    const newUserData = {
      username: "User2",
      bio: "This is my updated bio.",
    };
    const res = await api
      .post("/api/auth/profile/edit")
      .send(newUserData)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    const updated = await User.findById(userId);
    expect(updated.username).toEqual(newUserData.username);
    expect(updated.bio).toEqual(newUserData.bio);
  });

  it("deletes user profile", async () => {
    const res = await api
      .post("/api/auth/profile/delete")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    const deleted = await User.findById(userId);
    expect(deleted).toBeNull();
  });
});
