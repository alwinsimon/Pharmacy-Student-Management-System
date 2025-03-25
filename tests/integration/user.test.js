const request = require("supertest");
const app = require("../../src/app");
const { createTestUser, generateTestToken } = require("../utils/test.utils");
const { ROLES } = require("../../src/constants/roles.constants");
const { USER_STATUS } = require("../../src/constants/status.constants");

describe("User Management API", () => {
  let adminToken;
  let adminUser;

  beforeEach(async () => {
    // Create admin user for testing
    adminUser = await createTestUser({
      email: "admin@example.com",
      password: "StrongP@ss123",
      role: ROLES.ADMIN,
      status: USER_STATUS.ACTIVE,
    });

    // Login to get admin token
    const loginResponse = await request(app).post("/api/v1/auth/login").send({
      email: "admin@example.com",
      password: "StrongP@ss123",
    });

    adminToken = loginResponse.body.data.accessToken;
  });

  describe("GET /api/v1/users", () => {
    it("should get all users (admin only)", async () => {
      // Create some test users
      await createTestUser({ email: "user1@example.com" });
      await createTestUser({ email: "user2@example.com" });

      const response = await request(app)
        .get("/api/v1/users")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(2); // Including admin user
    });

    it("should return 403 for non-admin users", async () => {
      const user = await createTestUser({
        email: "regular@example.com",
        role: ROLES.STUDENT,
      });

      const loginResponse = await request(app).post("/api/v1/auth/login").send({
        email: "regular@example.com",
        password: "StrongP@ss123",
      });

      const userToken = loginResponse.body.data.accessToken;

      const response = await request(app)
        .get("/api/v1/users")
        .set("Authorization", `Bearer ${userToken}`);

      expect(response.status).toBe(403);
      expect(response.body.error).toBeDefined();
    });
  });

  describe("GET /api/v1/users/:id", () => {
    it("should get user by ID (admin only)", async () => {
      const user = await createTestUser({ email: "get@example.com" });

      const response = await request(app)
        .get(`/api/v1/users/${user.id}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(user.id);
    });

    it("should return 404 for non-existent user", async () => {
      const response = await request(app)
        .get("/api/v1/users/507f1f77bcf86cd799439011")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
      expect(response.body.error).toBeDefined();
    });
  });

  describe("PUT /api/v1/users/:id", () => {
    it("should update user (admin only)", async () => {
      const user = await createTestUser({ email: "update@example.com" });

      const updateData = {
        firstName: "Updated",
        lastName: "Name",
        status: USER_STATUS.ACTIVE,
      };

      const response = await request(app)
        .put(`/api/v1/users/${user.id}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.firstName).toBe(updateData.firstName);
      expect(response.body.data.lastName).toBe(updateData.lastName);
      expect(response.body.data.status).toBe(updateData.status);
    });

    it("should return 400 for invalid update data", async () => {
      const user = await createTestUser({ email: "invalid@example.com" });

      const response = await request(app)
        .put(`/api/v1/users/${user.id}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          email: "invalid-email",
          status: "INVALID_STATUS",
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
    });
  });

  describe("DELETE /api/v1/users/:id", () => {
    it("should delete user (admin only)", async () => {
      const user = await createTestUser({ email: "delete@example.com" });

      const response = await request(app)
        .delete(`/api/v1/users/${user.id}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      // Verify user is deleted
      const getResponse = await request(app)
        .get(`/api/v1/users/${user.id}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(getResponse.status).toBe(404);
    });

    it("should return 404 for non-existent user", async () => {
      const response = await request(app)
        .delete("/api/v1/users/507f1f77bcf86cd799439011")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
      expect(response.body.error).toBeDefined();
    });
  });

  describe("PUT /api/v1/users/:id/status", () => {
    it("should update user status (admin only)", async () => {
      const user = await createTestUser({
        email: "status@example.com",
        status: USER_STATUS.ACTIVE,
      });

      const response = await request(app)
        .put(`/api/v1/users/${user.id}/status`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ status: USER_STATUS.INACTIVE });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe(USER_STATUS.INACTIVE);
    });

    it("should return 400 for invalid status", async () => {
      const user = await createTestUser({
        email: "invalid-status@example.com",
      });

      const response = await request(app)
        .put(`/api/v1/users/${user.id}/status`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ status: "INVALID_STATUS" });

      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
    });
  });

  describe("PUT /api/v1/users/:id/role", () => {
    it("should update user role (admin only)", async () => {
      const user = await createTestUser({
        email: "role@example.com",
        role: ROLES.STUDENT,
      });

      const response = await request(app)
        .put(`/api/v1/users/${user.id}/role`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ role: ROLES.TEACHER });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.role).toBe(ROLES.TEACHER);
    });

    it("should return 400 for invalid role", async () => {
      const user = await createTestUser({ email: "invalid-role@example.com" });

      const response = await request(app)
        .put(`/api/v1/users/${user.id}/role`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ role: "INVALID_ROLE" });

      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
    });
  });
});
