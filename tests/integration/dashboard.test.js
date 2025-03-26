const request = require("supertest");
const app = require("../../src/app");
const { createTestUser, generateTestToken } = require("../utils/test.utils");
const { ROLES } = require("../../src/constants/roles.constants");
const { USER_STATUS } = require("../../src/constants/status.constants");

describe("Dashboard API", () => {
  let superAdminToken;
  let managerToken;
  let staffToken;
  let studentToken;
  let superAdminUser;
  let managerUser;
  let staffUser;
  let studentUser;
  let departmentId;

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

    // Create a test department
    const departmentData = {
      name: "Test Department",
      code: "TEST",
      description: "Test department description",
      headId: managerUser.id,
    };

    const departmentResponse = await request(app)
      .post("/api/v1/departments")
      .set("Authorization", `Bearer ${superAdminToken}`)
      .send(departmentData);

    departmentId = departmentResponse.body.data.id;
  });

  describe("GET /api/v1/dashboard/system", () => {
    it("should get system-wide statistics (super admin only)", async () => {
      // Test super admin access
      const superAdminResponse = await request(app)
        .get("/api/v1/dashboard/system")
        .set("Authorization", `Bearer ${superAdminToken}`);

      expect(superAdminResponse.status).toBe(200);
      expect(superAdminResponse.body.success).toBe(true);
      expect(superAdminResponse.body.data).toBeDefined();
      expect(superAdminResponse.body.data).toHaveProperty("totalUsers");
      expect(superAdminResponse.body.data).toHaveProperty("totalDepartments");
      expect(superAdminResponse.body.data).toHaveProperty("totalCases");
      expect(superAdminResponse.body.data).toHaveProperty("totalDocuments");

      // Test manager access (should be denied)
      const managerResponse = await request(app)
        .get("/api/v1/dashboard/system")
        .set("Authorization", `Bearer ${managerToken}`);

      expect(managerResponse.status).toBe(403);
      expect(managerResponse.body.error).toBeDefined();

      // Test staff access (should be denied)
      const staffResponse = await request(app)
        .get("/api/v1/dashboard/system")
        .set("Authorization", `Bearer ${staffToken}`);

      expect(staffResponse.status).toBe(403);
      expect(staffResponse.body.error).toBeDefined();

      // Test student access (should be denied)
      const studentResponse = await request(app)
        .get("/api/v1/dashboard/system")
        .set("Authorization", `Bearer ${studentToken}`);

      expect(studentResponse.status).toBe(403);
      expect(studentResponse.body.error).toBeDefined();
    });
  });

  describe("GET /api/v1/dashboard/department/:departmentId", () => {
    it("should get department statistics (manager and super admin only)", async () => {
      // Test manager access
      const managerResponse = await request(app)
        .get(`/api/v1/dashboard/department/${departmentId}`)
        .set("Authorization", `Bearer ${managerToken}`);

      expect(managerResponse.status).toBe(200);
      expect(managerResponse.body.success).toBe(true);
      expect(managerResponse.body.data).toBeDefined();
      expect(managerResponse.body.data).toHaveProperty(
        "departmentId",
        departmentId
      );
      expect(managerResponse.body.data).toHaveProperty("totalStaff");
      expect(managerResponse.body.data).toHaveProperty("totalStudents");
      expect(managerResponse.body.data).toHaveProperty("activeCases");
      expect(managerResponse.body.data).toHaveProperty("completedCases");

      // Test super admin access
      const superAdminResponse = await request(app)
        .get(`/api/v1/dashboard/department/${departmentId}`)
        .set("Authorization", `Bearer ${superAdminToken}`);

      expect(superAdminResponse.status).toBe(200);
      expect(superAdminResponse.body.success).toBe(true);
      expect(superAdminResponse.body.data).toBeDefined();

      // Test staff access (should be denied)
      const staffResponse = await request(app)
        .get(`/api/v1/dashboard/department/${departmentId}`)
        .set("Authorization", `Bearer ${staffToken}`);

      expect(staffResponse.status).toBe(403);
      expect(staffResponse.body.error).toBeDefined();

      // Test student access (should be denied)
      const studentResponse = await request(app)
        .get(`/api/v1/dashboard/department/${departmentId}`)
        .set("Authorization", `Bearer ${studentToken}`);

      expect(studentResponse.status).toBe(403);
      expect(studentResponse.body.error).toBeDefined();
    });

    it("should return 404 for non-existent department", async () => {
      const response = await request(app)
        .get("/api/v1/dashboard/department/507f1f77bcf86cd799439011")
        .set("Authorization", `Bearer ${managerToken}`);

      expect(response.status).toBe(404);
      expect(response.body.error).toBeDefined();
    });
  });

  describe("GET /api/v1/dashboard/staff", () => {
    it("should get staff dashboard statistics (staff only)", async () => {
      // Test staff access
      const staffResponse = await request(app)
        .get("/api/v1/dashboard/staff")
        .set("Authorization", `Bearer ${staffToken}`);

      expect(staffResponse.status).toBe(200);
      expect(staffResponse.body.success).toBe(true);
      expect(staffResponse.body.data).toBeDefined();
      expect(staffResponse.body.data).toHaveProperty("assignedCases");
      expect(staffResponse.body.data).toHaveProperty("completedCases");
      expect(staffResponse.body.data).toHaveProperty("pendingTasks");
      expect(staffResponse.body.data).toHaveProperty("recentActivities");

      // Test super admin access (should be denied)
      const superAdminResponse = await request(app)
        .get("/api/v1/dashboard/staff")
        .set("Authorization", `Bearer ${superAdminToken}`);

      expect(superAdminResponse.status).toBe(403);
      expect(superAdminResponse.body.error).toBeDefined();

      // Test manager access (should be denied)
      const managerResponse = await request(app)
        .get("/api/v1/dashboard/staff")
        .set("Authorization", `Bearer ${managerToken}`);

      expect(managerResponse.status).toBe(403);
      expect(managerResponse.body.error).toBeDefined();

      // Test student access (should be denied)
      const studentResponse = await request(app)
        .get("/api/v1/dashboard/staff")
        .set("Authorization", `Bearer ${studentToken}`);

      expect(studentResponse.status).toBe(403);
      expect(studentResponse.body.error).toBeDefined();
    });
  });

  describe("GET /api/v1/dashboard/student", () => {
    it("should get student dashboard statistics (student only)", async () => {
      // Test student access
      const studentResponse = await request(app)
        .get("/api/v1/dashboard/student")
        .set("Authorization", `Bearer ${studentToken}`);

      expect(studentResponse.status).toBe(200);
      expect(studentResponse.body.success).toBe(true);
      expect(studentResponse.body.data).toBeDefined();
      expect(studentResponse.body.data).toHaveProperty("enrolledCourses");
      expect(studentResponse.body.data).toHaveProperty("upcomingExams");
      expect(studentResponse.body.data).toHaveProperty("pendingAssignments");
      expect(studentResponse.body.data).toHaveProperty("attendanceStatus");
      expect(studentResponse.body.data).toHaveProperty("recentGrades");

      // Test super admin access (should be denied)
      const superAdminResponse = await request(app)
        .get("/api/v1/dashboard/student")
        .set("Authorization", `Bearer ${superAdminToken}`);

      expect(superAdminResponse.status).toBe(403);
      expect(superAdminResponse.body.error).toBeDefined();

      // Test manager access (should be denied)
      const managerResponse = await request(app)
        .get("/api/v1/dashboard/student")
        .set("Authorization", `Bearer ${managerToken}`);

      expect(managerResponse.status).toBe(403);
      expect(managerResponse.body.error).toBeDefined();

      // Test staff access (should be denied)
      const staffResponse = await request(app)
        .get("/api/v1/dashboard/student")
        .set("Authorization", `Bearer ${staffToken}`);

      expect(staffResponse.status).toBe(403);
      expect(staffResponse.body.error).toBeDefined();
    });
  });

  describe("GET /api/v1/dashboard/analytics/case-completion", () => {
    it("should get case completion statistics (staff, manager, and super admin only)", async () => {
      // Test staff access
      const staffResponse = await request(app)
        .get("/api/v1/dashboard/analytics/case-completion")
        .set("Authorization", `Bearer ${staffToken}`);

      expect(staffResponse.status).toBe(200);
      expect(staffResponse.body.success).toBe(true);
      expect(staffResponse.body.data).toBeDefined();
      expect(staffResponse.body.data).toHaveProperty("totalCases");
      expect(staffResponse.body.data).toHaveProperty("completedCases");
      expect(staffResponse.body.data).toHaveProperty("completionRate");
      expect(staffResponse.body.data).toHaveProperty("averageResolutionTime");

      // Test manager access
      const managerResponse = await request(app)
        .get("/api/v1/dashboard/analytics/case-completion")
        .set("Authorization", `Bearer ${managerToken}`);

      expect(managerResponse.status).toBe(200);
      expect(managerResponse.body.success).toBe(true);
      expect(managerResponse.body.data).toBeDefined();

      // Test super admin access
      const superAdminResponse = await request(app)
        .get("/api/v1/dashboard/analytics/case-completion")
        .set("Authorization", `Bearer ${superAdminToken}`);

      expect(superAdminResponse.status).toBe(200);
      expect(superAdminResponse.body.success).toBe(true);
      expect(superAdminResponse.body.data).toBeDefined();

      // Test student access (should be denied)
      const studentResponse = await request(app)
        .get("/api/v1/dashboard/analytics/case-completion")
        .set("Authorization", `Bearer ${studentToken}`);

      expect(studentResponse.status).toBe(403);
      expect(studentResponse.body.error).toBeDefined();
    });
  });

  describe("GET /api/v1/dashboard/analytics/document-usage", () => {
    it("should get document usage statistics (staff, manager, and super admin only)", async () => {
      // Test staff access
      const staffResponse = await request(app)
        .get("/api/v1/dashboard/analytics/document-usage")
        .set("Authorization", `Bearer ${staffToken}`);

      expect(staffResponse.status).toBe(200);
      expect(staffResponse.body.success).toBe(true);
      expect(staffResponse.body.data).toBeDefined();
      expect(staffResponse.body.data).toHaveProperty("totalDocuments");
      expect(staffResponse.body.data).toHaveProperty("totalDownloads");
      expect(staffResponse.body.data).toHaveProperty("popularDocuments");
      expect(staffResponse.body.data).toHaveProperty("usageByCategory");

      // Test manager access
      const managerResponse = await request(app)
        .get("/api/v1/dashboard/analytics/document-usage")
        .set("Authorization", `Bearer ${managerToken}`);

      expect(managerResponse.status).toBe(200);
      expect(managerResponse.body.success).toBe(true);
      expect(managerResponse.body.data).toBeDefined();

      // Test super admin access
      const superAdminResponse = await request(app)
        .get("/api/v1/dashboard/analytics/document-usage")
        .set("Authorization", `Bearer ${superAdminToken}`);

      expect(superAdminResponse.status).toBe(200);
      expect(superAdminResponse.body.success).toBe(true);
      expect(superAdminResponse.body.data).toBeDefined();

      // Test student access (should be denied)
      const studentResponse = await request(app)
        .get("/api/v1/dashboard/analytics/document-usage")
        .set("Authorization", `Bearer ${studentToken}`);

      expect(studentResponse.status).toBe(403);
      expect(studentResponse.body.error).toBeDefined();
    });
  });
});
