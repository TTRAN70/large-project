const { api } = require("./util");
const User = require("../models/User");

describe("Auth endpoints", () => {
  beforeEach(async () => {
    await User.create({
      username: "test123",
      email: "test@example.com",
      password: "password123",
      isVerified: true,
    });
  });

  it("logs in with valid credentials", async () => {
    const res = await api.post("/api/auth/login").send({
      email: "test@example.com",
      password: "password123",
    });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("token");
    expect(res.body.user.username).toEqual("test123");
    expect(res.body.user.email).toEqual("test@example.com");
  });

  it("rejects invalid email", async () => {
    const res = await api.post("/api/auth/login").send({
      email: "test5@example.com",
      password: "password123",
    });

    expect(res.status).toBe(400);
  });

  it("rejects invalid password", async () => {
    const res = await api.post("/api/auth/login").send({
      email: "test@example.com",
      password: "wrongpassword",
    });

    expect(res.status).toBe(400);
  });
});
