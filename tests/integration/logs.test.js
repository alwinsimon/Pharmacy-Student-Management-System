const request = require("supertest");
const app = require("../../src/app");
const { createTestUser, generateTestToken } = require("../utils/test.utils");
const { ROLES } = require("../../src/constants/roles.constants");
const { USER_STATUS } = require("../../src/constants/status.constants");

describe("Logs API", () => {
  let superAdminToken;
  let managerToken;
  let staffToken;
  let studentToken;
  let superAdminUser;
  let managerUser;
  let staffUser;
  let studentUser;
  let logId;

  beforeEach(async () => {
    // Create super admin user
    superAdminUser = await createTestUser({
      email: "superadmin@example.com",
      password: "StrongP@ss123",
      role: ROLES.SUPER_ADMIN,
      status: USER_STATUS.ACTIVE,
    });

    // Create manager user
    managerUser = await createTestUser({
      email: "manager@example.com",
      password: "StrongP@ss123",
      role: ROLES.MANAGER,
      status: USER_STATUS.ACTIVE,
    });

    // Create staff user
    staffUser = await createTestUser({
      email: "staff@example.com",
      password: "StrongP@ss123",
      role: ROLES.STAFF,
      status: USER_STATUS.ACTIVE,
    });

    // Create student user
    studentUser = await createTestUser({
      email: "student@example.com",
      password: "StrongP@ss123",
      role: ROLES.STUDENT,
      status: USER_STATUS.ACTIVE,
    });

    // Get tokens
    const [superAdminLogin, managerLogin, staffLogin, studentLogin] =
      await Promise.all([
        request(app).post("/api/v1/auth/login").send({
          email: "superadmin@example.com",
          password: "StrongP@ss123",
        }),
        request(app).post("/api/v1/auth/login").send({
          email: "manager@example.com",
          password: "StrongP@ss123",
        }),
        request(app).post("/api/v1/auth/login").send({
          email: "staff@example.com",
          password: "StrongP@ss123",
        }),
        request(app).post("/api/v1/auth/login").send({
          email: "student@example.com",
          password: "StrongP@ss123",
        }),
      ]);

    superAdminToken = superAdminLogin.body.data.accessToken;
    managerToken = managerLogin.body.data.accessToken;
    staffToken = staffLogin.body.data.accessToken;
    studentToken = studentLogin.body.data.accessToken;

    // Create a test log by performing an action
    const documentData = {
      title: "Test Document",
      description: "Test document description",
      type: "PDF",
      category: "ACADEMIC",
      fileUrl: "https://example.com/test.pdf",
      metadata: {
        courseId: "123",
        semester: 1,
      },
    };

    const createResponse = await request(app)
      .post("/api/v1/documents")
      .set("Authorization", `Bearer ${superAdminToken}`)
      .send(documentData);

    // Get the log ID from the response
    const logsResponse = await request(app)
      .get("/api/v1/logs")
      .set("Authorization", `Bearer ${superAdminToken}`);

    logId = logsResponse.body.data[0].id;
  });

  describe("GET /api/v1/logs", () => {
    it("should get activity logs with pagination (super admin and manager only)", async () => {
      // Test super admin access
      const superAdminResponse = await request(app)
        .get("/api/v1/logs")
        .set("Authorization", `Bearer ${superAdminToken}`);

      expect(superAdminResponse.status).toBe(200);
      expect(superAdminResponse.body.success).toBe(true);
      expect(Array.isArray(superAdminResponse.body.data)).toBe(true);
      expect(superAdminResponse.body.data.length).toBeGreaterThan(0);
      expect(superAdminResponse.body.data[0]).toHaveProperty("id");
      expect(superAdminResponse.body.data[0]).toHaveProperty("action");
      expect(superAdminResponse.body.data[0]).toHaveProperty("userId");
      expect(superAdminResponse.body.data[0]).toHaveProperty("timestamp");

      // Test manager access
      const managerResponse = await request(app)
        .get("/api/v1/logs")
        .set("Authorization", `Bearer ${managerToken}`);

      expect(managerResponse.status).toBe(200);
      expect(managerResponse.body.success).toBe(true);
      expect(Array.isArray(managerResponse.body.data)).toBe(true);

      // Test staff access (should be denied)
      const staffResponse = await request(app)
        .get("/api/v1/logs")
        .set("Authorization", `Bearer ${staffToken}`);

      expect(staffResponse.status).toBe(403);
      expect(staffResponse.body.error).toBeDefined();

      // Test student access (should be denied)
      const studentResponse = await request(app)
        .get("/api/v1/logs")
        .set("Authorization", `Bearer ${studentToken}`);

      expect(studentResponse.status).toBe(403);
      expect(studentResponse.body.error).toBeDefined();
    });

    it("should support pagination parameters", async () => {
      const page = 1;
      const limit = 10;

      const response = await request(app)
        .get(`/api/v1/logs?page=${page}&limit=${limit}`)
        .set("Authorization", `Bearer ${superAdminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBeLessThanOrEqual(limit);
      expect(response.body).toHaveProperty("pagination");
      expect(response.body.pagination).toHaveProperty("page", page);
      expect(response.body.pagination).toHaveProperty("limit", limit);
      expect(response.body.pagination).toHaveProperty("total");
    });
  });

  describe("GET /api/v1/logs/:id", () => {
    it("should get log by ID (super admin and manager only)", async () => {
      // Test super admin access
      const superAdminResponse = await request(app)
        .get(`/api/v1/logs/${logId}`)
        .set("Authorization", `Bearer ${superAdminToken}`);

      expect(superAdminResponse.status).toBe(200);
      expect(superAdminResponse.body.success).toBe(true);
      expect(superAdminResponse.body.data).toBeDefined();
      expect(superAdminResponse.body.data.id).toBe(logId);
      expect(superAdminResponse.body.data).toHaveProperty("action");
      expect(superAdminResponse.body.data).toHaveProperty("userId");
      expect(superAdminResponse.body.data).toHaveProperty("timestamp");

      // Test manager access
      const managerResponse = await request(app)
        .get(`/api/v1/logs/${logId}`)
        .set("Authorization", `Bearer ${managerToken}`);

      expect(managerResponse.status).toBe(200);
      expect(managerResponse.body.success).toBe(true);
      expect(managerResponse.body.data).toBeDefined();

      // Test staff access (should be denied)
      const staffResponse = await request(app)
        .get(`/api/v1/logs/${logId}`)
        .set("Authorization", `Bearer ${staffToken}`);

      expect(staffResponse.status).toBe(403);
      expect(staffResponse.body.error).toBeDefined();

      // Test student access (should be denied)
      const studentResponse = await request(app)
        .get(`/api/v1/logs/${logId}`)
        .set("Authorization", `Bearer ${studentToken}`);

      expect(studentResponse.status).toBe(403);
      expect(studentResponse.body.error).toBeDefined();
    });

    it("should return 404 for non-existent log", async () => {
      const response = await request(app)
        .get("/api/v1/logs/507f1f77bcf86cd799439011")
        .set("Authorization", `Bearer ${superAdminToken}`);

      expect(response.status).toBe(404);
      expect(response.body.error).toBeDefined();
    });
  });

  describe("GET /api/v1/logs/user/:userId", () => {
    it("should get logs by user (super admin and manager only)", async () => {
      // Test super admin access
      const superAdminResponse = await request(app)
        .get(`/api/v1/logs/user/${superAdminUser.id}`)
        .set("Authorization", `Bearer ${superAdminToken}`);

      expect(superAdminResponse.status).toBe(200);
      expect(superAdminResponse.body.success).toBe(true);
      expect(Array.isArray(superAdminResponse.body.data)).toBe(true);
      expect(superAdminResponse.body.data.length).toBeGreaterThan(0);
      expect(superAdminResponse.body.data[0].userId).toBe(superAdminUser.id);

      // Test manager access
      const managerResponse = await request(app)
        .get(`/api/v1/logs/user/${superAdminUser.id}`)
        .set("Authorization", `Bearer ${managerToken}`);

      expect(managerResponse.status).toBe(200);
      expect(managerResponse.body.success).toBe(true);
      expect(Array.isArray(managerResponse.body.data)).toBe(true);

      // Test staff access (should be denied)
      const staffResponse = await request(app)
        .get(`/api/v1/logs/user/${superAdminUser.id}`)
        .set("Authorization", `Bearer ${staffToken}`);

      expect(staffResponse.status).toBe(403);
      expect(staffResponse.body.error).toBeDefined();

      // Test student access (should be denied)
      const studentResponse = await request(app)
        .get(`/api/v1/logs/user/${superAdminUser.id}`)
        .set("Authorization", `Bearer ${studentToken}`);

      expect(studentResponse.status).toBe(403);
      expect(studentResponse.body.error).toBeDefined();
    });

    it("should return 404 for non-existent user", async () => {
      const response = await request(app)
        .get("/api/v1/logs/user/507f1f77bcf86cd799439011")
        .set("Authorization", `Bearer ${superAdminToken}`);

      expect(response.status).toBe(404);
      expect(response.body.error).toBeDefined();
    });
  });

  describe("GET /api/v1/logs/entity/:entity/:entityId", () => {
    it("should get logs by entity (super admin and manager only)", async () => {
      // Test super admin access
      const superAdminResponse = await request(app)
        .get(`/api/v1/logs/entity/DOCUMENT/${logId}`)
        .set("Authorization", `Bearer ${superAdminToken}`);

      expect(superAdminResponse.status).toBe(200);
      expect(superAdminResponse.body.success).toBe(true);
      expect(Array.isArray(superAdminResponse.body.data)).toBe(true);
      expect(superAdminResponse.body.data.length).toBeGreaterThan(0);
      expect(superAdminResponse.body.data[0]).toHaveProperty(
        "entity",
        "DOCUMENT"
      );
      expect(superAdminResponse.body.data[0]).toHaveProperty("entityId", logId);

      // Test manager access
      const managerResponse = await request(app)
        .get(`/api/v1/logs/entity/DOCUMENT/${logId}`)
        .set("Authorization", `Bearer ${managerToken}`);

      expect(managerResponse.status).toBe(200);
      expect(managerResponse.body.success).toBe(true);
      expect(Array.isArray(managerResponse.body.data)).toBe(true);

      // Test staff access (should be denied)
      const staffResponse = await request(app)
        .get(`/api/v1/logs/entity/DOCUMENT/${logId}`)
        .set("Authorization", `Bearer ${staffToken}`);

      expect(staffResponse.status).toBe(403);
      expect(staffResponse.body.error).toBeDefined();

      // Test student access (should be denied)
      const studentResponse = await request(app)
        .get(`/api/v1/logs/entity/DOCUMENT/${logId}`)
        .set("Authorization", `Bearer ${studentToken}`);

      expect(studentResponse.status).toBe(403);
      expect(studentResponse.body.error).toBeDefined();
    });

    it("should handle invalid entity types", async () => {
      const response = await request(app)
        .get(`/api/v1/logs/entity/INVALID_TYPE/${logId}`)
        .set("Authorization", `Bearer ${superAdminToken}`);

      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
    });

    it("should handle non-existent entity IDs", async () => {
      const response = await request(app)
        .get("/api/v1/logs/entity/DOCUMENT/507f1f77bcf86cd799439011")
        .set("Authorization", `Bearer ${superAdminToken}`);

      expect(response.status).toBe(404);
      expect(response.body.error).toBeDefined();
    });
  });
});
