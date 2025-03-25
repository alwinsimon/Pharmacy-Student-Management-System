const request = require("supertest");
const app = require("../../src/app");
const { createTestUser, generateTestToken } = require("../utils/test.utils");
const { ROLES } = require("../../src/constants/roles.constants");
const { USER_STATUS } = require("../../src/constants/status.constants");

describe("Authentication API", () => {
  describe("POST /api/v1/auth/register", () => {
    it("should register a new user successfully", async () => {
      const userData = {
        email: "newuser@example.com",
        password: "StrongP@ss123",
        firstName: "John",
        lastName: "Doe",
        role: ROLES.STUDENT,
      };

      const response = await request(app)
        .post("/api/v1/auth/register")
        .send(userData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty("id");
      expect(response.body.data.email).toBe(userData.email);
      expect(response.body.data.role).toBe(userData.role);
      expect(response.body.data.status).toBe(USER_STATUS.PENDING);
    });

    it("should return 400 for invalid input", async () => {
      const response = await request(app).post("/api/v1/auth/register").send({
        email: "invalid-email",
        password: "weak",
        firstName: "John",
      });

      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
    });

    it("should return 409 for existing email", async () => {
      await createTestUser({ email: "existing@example.com" });

      const response = await request(app).post("/api/v1/auth/register").send({
        email: "existing@example.com",
        password: "StrongP@ss123",
        firstName: "John",
        lastName: "Doe",
      });

      expect(response.status).toBe(409);
      expect(response.body.error).toBeDefined();
    });
  });

  describe("POST /api/v1/auth/login", () => {
    it("should login successfully with valid credentials", async () => {
      const user = await createTestUser({
        email: "login@example.com",
        password: "StrongP@ss123",
        status: USER_STATUS.ACTIVE,
      });

      const response = await request(app).post("/api/v1/auth/login").send({
        email: "login@example.com",
        password: "StrongP@ss123",
      });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty("accessToken");
      expect(response.body.data).toHaveProperty("refreshToken");
      expect(response.body.data.user.id).toBe(user.id);
    });

    it("should return 401 for invalid credentials", async () => {
      const response = await request(app).post("/api/v1/auth/login").send({
        email: "wrong@example.com",
        password: "WrongP@ss123",
      });

      expect(response.status).toBe(401);
      expect(response.body.error).toBeDefined();
    });

    it("should return 401 for inactive account", async () => {
      await createTestUser({
        email: "inactive@example.com",
        password: "StrongP@ss123",
        status: USER_STATUS.INACTIVE,
      });

      const response = await request(app).post("/api/v1/auth/login").send({
        email: "inactive@example.com",
        password: "StrongP@ss123",
      });

      expect(response.status).toBe(401);
      expect(response.body.error).toBeDefined();
    });
  });

  describe("POST /api/v1/auth/refresh-token", () => {
    it("should refresh token successfully", async () => {
      const user = await createTestUser({
        email: "refresh@example.com",
        password: "StrongP@ss123",
        status: USER_STATUS.ACTIVE,
      });

      // First login to get tokens
      const loginResponse = await request(app).post("/api/v1/auth/login").send({
        email: "refresh@example.com",
        password: "StrongP@ss123",
      });

      const refreshToken = loginResponse.body.data.refreshToken;

      // Refresh token
      const response = await request(app)
        .post("/api/v1/auth/refresh-token")
        .send({ refreshToken });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty("accessToken");
      expect(response.body.data).toHaveProperty("refreshToken");
      expect(response.body.data.user.id).toBe(user.id);
    });

    it("should return 401 for invalid refresh token", async () => {
      const response = await request(app)
        .post("/api/v1/auth/refresh-token")
        .send({ refreshToken: "invalid-token" });

      expect(response.status).toBe(401);
      expect(response.body.error).toBeDefined();
    });
  });

  describe("POST /api/v1/auth/logout", () => {
    it("should logout successfully", async () => {
      const user = await createTestUser({
        email: "logout@example.com",
        password: "StrongP@ss123",
        status: USER_STATUS.ACTIVE,
      });

      // First login to get tokens
      const loginResponse = await request(app).post("/api/v1/auth/login").send({
        email: "logout@example.com",
        password: "StrongP@ss123",
      });

      const refreshToken = loginResponse.body.data.refreshToken;
      const accessToken = loginResponse.body.data.accessToken;

      // Logout
      const response = await request(app)
        .post("/api/v1/auth/logout")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ refreshToken });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it("should return 401 for invalid token", async () => {
      const response = await request(app)
        .post("/api/v1/auth/logout")
        .set("Authorization", "Bearer invalid-token")
        .send({ refreshToken: "invalid-refresh-token" });

      expect(response.status).toBe(401);
      expect(response.body.error).toBeDefined();
    });
  });

  describe("POST /api/v1/auth/verify-email", () => {
    it("should verify email successfully", async () => {
      const user = await createTestUser({
        email: "verify@example.com",
        password: "StrongP@ss123",
        status: USER_STATUS.PENDING,
        verificationToken: {
          token: "valid-token",
          expiresAt: new Date(Date.now() + 3600000), // 1 hour from now
        },
      });

      const response = await request(app)
        .post("/api/v1/auth/verify-email")
        .send({ token: "valid-token" });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      // Check if user status is updated
      const updatedUser = await User.findById(user.id);
      expect(updatedUser.status).toBe(USER_STATUS.VERIFIED);
      expect(updatedUser.isEmailVerified).toBe(true);
    });

    it("should return 400 for invalid token", async () => {
      const response = await request(app)
        .post("/api/v1/auth/verify-email")
        .send({ token: "invalid-token" });

      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
    });
  });

  describe("POST /api/v1/auth/forgot-password", () => {
    it("should send reset password email", async () => {
      await createTestUser({
        email: "reset@example.com",
        password: "StrongP@ss123",
        status: USER_STATUS.ACTIVE,
      });

      const response = await request(app)
        .post("/api/v1/auth/forgot-password")
        .send({ email: "reset@example.com" });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it("should return 404 for non-existent email", async () => {
      const response = await request(app)
        .post("/api/v1/auth/forgot-password")
        .send({ email: "nonexistent@example.com" });

      expect(response.status).toBe(404);
      expect(response.body.error).toBeDefined();
    });
  });

  describe("POST /api/v1/auth/reset-password", () => {
    it("should reset password successfully", async () => {
      const user = await createTestUser({
        email: "reset@example.com",
        password: "StrongP@ss123",
        status: USER_STATUS.ACTIVE,
        passwordResetToken: {
          token: "valid-reset-token",
          expiresAt: new Date(Date.now() + 3600000), // 1 hour from now
        },
      });

      const response = await request(app)
        .post("/api/v1/auth/reset-password")
        .send({
          token: "valid-reset-token",
          password: "NewStrongP@ss123",
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      // Verify new password works
      const loginResponse = await request(app).post("/api/v1/auth/login").send({
        email: "reset@example.com",
        password: "NewStrongP@ss123",
      });

      expect(loginResponse.status).toBe(200);
    });

    it("should return 400 for invalid token", async () => {
      const response = await request(app)
        .post("/api/v1/auth/reset-password")
        .send({
          token: "invalid-token",
          password: "NewStrongP@ss123",
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
    });
  });
});
