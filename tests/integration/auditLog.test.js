const request = require("supertest");
const app = require("../../src/app");
const { createTestUser, generateTestToken } = require("../utils/test.utils");
const { ROLES } = require("../../src/constants/roles.constants");
const { USER_STATUS } = require("../../src/constants/status.constants");

describe("Audit Log Management API", () => {
  let adminToken;
  let teacherToken;
  let studentToken;
  let adminUser;
  let teacherUser;
  let studentUser;
  let testCourse;

  beforeEach(async () => {
    // Create admin user
    adminUser = await createTestUser({
      email: "admin@example.com",
      password: "StrongP@ss123",
      role: ROLES.ADMIN,
      status: USER_STATUS.ACTIVE,
    });

    // Create teacher user
    teacherUser = await createTestUser({
      email: "teacher@example.com",
      password: "StrongP@ss123",
      role: ROLES.TEACHER,
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
    const [adminLogin, teacherLogin, studentLogin] = await Promise.all([
      request(app).post("/api/v1/auth/login").send({
        email: "admin@example.com",
        password: "StrongP@ss123",
      }),
      request(app).post("/api/v1/auth/login").send({
        email: "teacher@example.com",
        password: "StrongP@ss123",
      }),
      request(app).post("/api/v1/auth/login").send({
        email: "student@example.com",
        password: "StrongP@ss123",
      }),
    ]);

    adminToken = adminLogin.body.data.accessToken;
    teacherToken = teacherLogin.body.data.accessToken;
    studentToken = studentLogin.body.data.accessToken;

    // Create a test course
    const courseData = {
      name: "Test Course",
      code: "PHM101",
      description: "Test course description",
      credits: 3,
      department: "Pharmacy",
      semester: 1,
    };

    const courseResponse = await request(app)
      .post("/api/v1/courses")
      .set("Authorization", `Bearer ${adminToken}`)
      .send(courseData);

    testCourse = courseResponse.body.data;
  });

  describe("GET /api/v1/audit-logs", () => {
    it("should get audit logs (admin only)", async () => {
      // Test admin access
      const adminResponse = await request(app)
        .get("/api/v1/audit-logs")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(adminResponse.status).toBe(200);
      expect(adminResponse.body.success).toBe(true);
      expect(Array.isArray(adminResponse.body.data)).toBe(true);

      // Test teacher access (should be denied)
      const teacherResponse = await request(app)
        .get("/api/v1/audit-logs")
        .set("Authorization", `Bearer ${teacherToken}`);

      expect(teacherResponse.status).toBe(403);
      expect(teacherResponse.body.error).toBeDefined();

      // Test student access (should be denied)
      const studentResponse = await request(app)
        .get("/api/v1/audit-logs")
        .set("Authorization", `Bearer ${studentToken}`);

      expect(studentResponse.status).toBe(403);
      expect(studentResponse.body.error).toBeDefined();
    });

    it("should filter audit logs by date range", async () => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 7); // Last 7 days
      const endDate = new Date();

      const response = await request(app)
        .get("/api/v1/audit-logs")
        .query({
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        })
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it("should filter audit logs by user", async () => {
      const response = await request(app)
        .get("/api/v1/audit-logs")
        .query({
          userId: adminUser.id,
        })
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(
        response.body.data.every((log) => log.userId === adminUser.id)
      ).toBe(true);
    });

    it("should filter audit logs by action", async () => {
      const response = await request(app)
        .get("/api/v1/audit-logs")
        .query({
          action: "CREATE",
        })
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.every((log) => log.action === "CREATE")).toBe(
        true
      );
    });

    it("should filter audit logs by resource type", async () => {
      const response = await request(app)
        .get("/api/v1/audit-logs")
        .query({
          resourceType: "COURSE",
        })
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(
        response.body.data.every((log) => log.resourceType === "COURSE")
      ).toBe(true);
    });

    it("should paginate audit logs", async () => {
      const response = await request(app)
        .get("/api/v1/audit-logs")
        .query({
          page: 1,
          limit: 10,
        })
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeLessThanOrEqual(10);
      expect(response.body).toHaveProperty("pagination");
      expect(response.body.pagination).toHaveProperty("total");
      expect(response.body.pagination).toHaveProperty("page");
      expect(response.body.pagination).toHaveProperty("limit");
    });
  });

  describe("GET /api/v1/audit-logs/:id", () => {
    it("should get audit log by ID (admin only)", async () => {
      // Create a test audit log by performing an action
      await request(app)
        .post("/api/v1/courses")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: "Test Course for Audit",
          code: "PHM102",
          description: "Test course description",
          credits: 3,
          department: "Pharmacy",
          semester: 1,
        });

      // Get the audit log ID from the response
      const logsResponse = await request(app)
        .get("/api/v1/audit-logs")
        .query({
          resourceType: "COURSE",
          action: "CREATE",
        })
        .set("Authorization", `Bearer ${adminToken}`);

      const auditLogId = logsResponse.body.data[0].id;

      // Test admin access
      const adminResponse = await request(app)
        .get(`/api/v1/audit-logs/${auditLogId}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(adminResponse.status).toBe(200);
      expect(adminResponse.body.success).toBe(true);
      expect(adminResponse.body.data.id).toBe(auditLogId);

      // Test teacher access (should be denied)
      const teacherResponse = await request(app)
        .get(`/api/v1/audit-logs/${auditLogId}`)
        .set("Authorization", `Bearer ${teacherToken}`);

      expect(teacherResponse.status).toBe(403);
      expect(teacherResponse.body.error).toBeDefined();

      // Test student access (should be denied)
      const studentResponse = await request(app)
        .get(`/api/v1/audit-logs/${auditLogId}`)
        .set("Authorization", `Bearer ${studentToken}`);

      expect(studentResponse.status).toBe(403);
      expect(studentResponse.body.error).toBeDefined();
    });

    it("should return 404 for non-existent audit log", async () => {
      const response = await request(app)
        .get("/api/v1/audit-logs/507f1f77bcf86cd799439011")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
      expect(response.body.error).toBeDefined();
    });
  });

  describe("GET /api/v1/audit-logs/user/:userId", () => {
    it("should get user audit logs (admin only)", async () => {
      // Test admin access
      const adminResponse = await request(app)
        .get(`/api/v1/audit-logs/user/${adminUser.id}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(adminResponse.status).toBe(200);
      expect(adminResponse.body.success).toBe(true);
      expect(Array.isArray(adminResponse.body.data)).toBe(true);
      expect(
        adminResponse.body.data.every((log) => log.userId === adminUser.id)
      ).toBe(true);

      // Test teacher access (should be denied)
      const teacherResponse = await request(app)
        .get(`/api/v1/audit-logs/user/${adminUser.id}`)
        .set("Authorization", `Bearer ${teacherToken}`);

      expect(teacherResponse.status).toBe(403);
      expect(teacherResponse.body.error).toBeDefined();

      // Test student access (should be denied)
      const studentResponse = await request(app)
        .get(`/api/v1/audit-logs/user/${adminUser.id}`)
        .set("Authorization", `Bearer ${studentToken}`);

      expect(studentResponse.status).toBe(403);
      expect(studentResponse.body.error).toBeDefined();
    });

    it("should filter user audit logs by date range", async () => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 7); // Last 7 days
      const endDate = new Date();

      const response = await request(app)
        .get(`/api/v1/audit-logs/user/${adminUser.id}`)
        .query({
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        })
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it("should filter user audit logs by action", async () => {
      const response = await request(app)
        .get(`/api/v1/audit-logs/user/${adminUser.id}`)
        .query({
          action: "CREATE",
        })
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.every((log) => log.action === "CREATE")).toBe(
        true
      );
    });

    it("should paginate user audit logs", async () => {
      const response = await request(app)
        .get(`/api/v1/audit-logs/user/${adminUser.id}`)
        .query({
          page: 1,
          limit: 10,
        })
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeLessThanOrEqual(10);
      expect(response.body).toHaveProperty("pagination");
      expect(response.body.pagination).toHaveProperty("total");
      expect(response.body.pagination).toHaveProperty("page");
      expect(response.body.pagination).toHaveProperty("limit");
    });
  });

  describe("GET /api/v1/audit-logs/resource/:resourceType/:resourceId", () => {
    it("should get resource audit logs (admin only)", async () => {
      // Test admin access
      const adminResponse = await request(app)
        .get(`/api/v1/audit-logs/resource/COURSE/${testCourse.id}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(adminResponse.status).toBe(200);
      expect(adminResponse.body.success).toBe(true);
      expect(Array.isArray(adminResponse.body.data)).toBe(true);
      expect(
        adminResponse.body.data.every(
          (log) =>
            log.resourceType === "COURSE" && log.resourceId === testCourse.id
        )
      ).toBe(true);

      // Test teacher access (should be denied)
      const teacherResponse = await request(app)
        .get(`/api/v1/audit-logs/resource/COURSE/${testCourse.id}`)
        .set("Authorization", `Bearer ${teacherToken}`);

      expect(teacherResponse.status).toBe(403);
      expect(teacherResponse.body.error).toBeDefined();

      // Test student access (should be denied)
      const studentResponse = await request(app)
        .get(`/api/v1/audit-logs/resource/COURSE/${testCourse.id}`)
        .set("Authorization", `Bearer ${studentToken}`);

      expect(studentResponse.status).toBe(403);
      expect(studentResponse.body.error).toBeDefined();
    });

    it("should filter resource audit logs by date range", async () => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 7); // Last 7 days
      const endDate = new Date();

      const response = await request(app)
        .get(`/api/v1/audit-logs/resource/COURSE/${testCourse.id}`)
        .query({
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        })
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it("should filter resource audit logs by action", async () => {
      const response = await request(app)
        .get(`/api/v1/audit-logs/resource/COURSE/${testCourse.id}`)
        .query({
          action: "CREATE",
        })
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.every((log) => log.action === "CREATE")).toBe(
        true
      );
    });

    it("should paginate resource audit logs", async () => {
      const response = await request(app)
        .get(`/api/v1/audit-logs/resource/COURSE/${testCourse.id}`)
        .query({
          page: 1,
          limit: 10,
        })
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeLessThanOrEqual(10);
      expect(response.body).toHaveProperty("pagination");
      expect(response.body.pagination).toHaveProperty("total");
      expect(response.body.pagination).toHaveProperty("page");
      expect(response.body.pagination).toHaveProperty("limit");
    });
  });

  describe("POST /api/v1/audit-logs/export", () => {
    it("should export audit logs (admin only)", async () => {
      const exportData = {
        startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // Last 7 days
        endDate: new Date().toISOString(),
        format: "CSV",
        filters: {
          resourceType: "COURSE",
          action: "CREATE",
        },
      };

      // Test admin access
      const adminResponse = await request(app)
        .post("/api/v1/audit-logs/export")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(exportData);

      expect(adminResponse.status).toBe(200);
      expect(adminResponse.body.success).toBe(true);
      expect(adminResponse.body.data).toHaveProperty("downloadUrl");
      expect(adminResponse.body.data).toHaveProperty("expiresAt");

      // Test teacher access (should be denied)
      const teacherResponse = await request(app)
        .post("/api/v1/audit-logs/export")
        .set("Authorization", `Bearer ${teacherToken}`)
        .send(exportData);

      expect(teacherResponse.status).toBe(403);
      expect(teacherResponse.body.error).toBeDefined();

      // Test student access (should be denied)
      const studentResponse = await request(app)
        .post("/api/v1/audit-logs/export")
        .set("Authorization", `Bearer ${studentToken}`)
        .send(exportData);

      expect(studentResponse.status).toBe(403);
      expect(studentResponse.body.error).toBeDefined();
    });

    it("should return 400 for invalid export data", async () => {
      const invalidExportData = {
        startDate: "invalid_date",
        endDate: "invalid_date",
        format: "INVALID_FORMAT",
      };

      const response = await request(app)
        .post("/api/v1/audit-logs/export")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(invalidExportData);

      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
    });
  });
});
