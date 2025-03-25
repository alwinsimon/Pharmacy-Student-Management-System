const request = require("supertest");
const app = require("../../src/app");
const { createTestUser, generateTestToken } = require("../utils/test.utils");
const { ROLES } = require("../../src/constants/roles.constants");
const { USER_STATUS } = require("../../src/constants/status.constants");
const path = require("path");

describe("Departments API", () => {
  let superAdminToken;
  let managerToken;
  let staffToken;
  let studentToken;
  let superAdminUser;
  let managerUser;
  let staffUser;
  let studentUser;
  let departmentId;
  let subDepartmentId;

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

    // Create a test sub-department
    const subDepartmentData = {
      name: "Test Sub-Department",
      code: "TEST-SUB",
      description: "Test sub-department description",
      headId: staffUser.id,
      parentId: departmentId,
    };

    const subDepartmentResponse = await request(app)
      .post("/api/v1/departments")
      .set("Authorization", `Bearer ${superAdminToken}`)
      .send(subDepartmentData);

    subDepartmentId = subDepartmentResponse.body.data.id;
  });

  describe("GET /api/v1/departments", () => {
    it("should get all departments with pagination (authenticated users only)", async () => {
      // Test super admin access
      const superAdminResponse = await request(app)
        .get("/api/v1/departments")
        .set("Authorization", `Bearer ${superAdminToken}`);

      expect(superAdminResponse.status).toBe(200);
      expect(superAdminResponse.body.success).toBe(true);
      expect(Array.isArray(superAdminResponse.body.data)).toBe(true);
      expect(superAdminResponse.body.data.length).toBeGreaterThan(0);
      expect(superAdminResponse.body.data[0]).toHaveProperty("id");
      expect(superAdminResponse.body.data[0]).toHaveProperty("name");
      expect(superAdminResponse.body.data[0]).toHaveProperty("code");

      // Test manager access
      const managerResponse = await request(app)
        .get("/api/v1/departments")
        .set("Authorization", `Bearer ${managerToken}`);

      expect(managerResponse.status).toBe(200);
      expect(managerResponse.body.success).toBe(true);
      expect(Array.isArray(managerResponse.body.data)).toBe(true);

      // Test staff access
      const staffResponse = await request(app)
        .get("/api/v1/departments")
        .set("Authorization", `Bearer ${staffToken}`);

      expect(staffResponse.status).toBe(200);
      expect(staffResponse.body.success).toBe(true);
      expect(Array.isArray(staffResponse.body.data)).toBe(true);

      // Test student access
      const studentResponse = await request(app)
        .get("/api/v1/departments")
        .set("Authorization", `Bearer ${studentToken}`);

      expect(studentResponse.status).toBe(200);
      expect(studentResponse.body.success).toBe(true);
      expect(Array.isArray(studentResponse.body.data)).toBe(true);

      // Test without authentication
      const unauthenticatedResponse = await request(app).get(
        "/api/v1/departments"
      );

      expect(unauthenticatedResponse.status).toBe(401);
      expect(unauthenticatedResponse.body.error).toBeDefined();
    });

    it("should support pagination parameters", async () => {
      const page = 1;
      const limit = 10;

      const response = await request(app)
        .get(`/api/v1/departments?page=${page}&limit=${limit}`)
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

  describe("GET /api/v1/departments/:id", () => {
    it("should get department by ID (authenticated users only)", async () => {
      // Test super admin access
      const superAdminResponse = await request(app)
        .get(`/api/v1/departments/${departmentId}`)
        .set("Authorization", `Bearer ${superAdminToken}`);

      expect(superAdminResponse.status).toBe(200);
      expect(superAdminResponse.body.success).toBe(true);
      expect(superAdminResponse.body.data).toBeDefined();
      expect(superAdminResponse.body.data.id).toBe(departmentId);
      expect(superAdminResponse.body.data).toHaveProperty("name");
      expect(superAdminResponse.body.data).toHaveProperty("code");

      // Test manager access
      const managerResponse = await request(app)
        .get(`/api/v1/departments/${departmentId}`)
        .set("Authorization", `Bearer ${managerToken}`);

      expect(managerResponse.status).toBe(200);
      expect(managerResponse.body.success).toBe(true);
      expect(managerResponse.body.data).toBeDefined();

      // Test staff access
      const staffResponse = await request(app)
        .get(`/api/v1/departments/${departmentId}`)
        .set("Authorization", `Bearer ${staffToken}`);

      expect(staffResponse.status).toBe(200);
      expect(staffResponse.body.success).toBe(true);
      expect(staffResponse.body.data).toBeDefined();

      // Test student access
      const studentResponse = await request(app)
        .get(`/api/v1/departments/${departmentId}`)
        .set("Authorization", `Bearer ${studentToken}`);

      expect(studentResponse.status).toBe(200);
      expect(studentResponse.body.success).toBe(true);
      expect(studentResponse.body.data).toBeDefined();

      // Test without authentication
      const unauthenticatedResponse = await request(app).get(
        `/api/v1/departments/${departmentId}`
      );

      expect(unauthenticatedResponse.status).toBe(401);
      expect(unauthenticatedResponse.body.error).toBeDefined();
    });

    it("should return 404 for non-existent department", async () => {
      const response = await request(app)
        .get("/api/v1/departments/507f1f77bcf86cd799439011")
        .set("Authorization", `Bearer ${superAdminToken}`);

      expect(response.status).toBe(404);
      expect(response.body.error).toBeDefined();
    });
  });

  describe("GET /api/v1/departments/code/:code", () => {
    it("should get department by code (authenticated users only)", async () => {
      // Test super admin access
      const superAdminResponse = await request(app)
        .get("/api/v1/departments/code/TEST")
        .set("Authorization", `Bearer ${superAdminToken}`);

      expect(superAdminResponse.status).toBe(200);
      expect(superAdminResponse.body.success).toBe(true);
      expect(superAdminResponse.body.data).toBeDefined();
      expect(superAdminResponse.body.data.code).toBe("TEST");

      // Test manager access
      const managerResponse = await request(app)
        .get("/api/v1/departments/code/TEST")
        .set("Authorization", `Bearer ${managerToken}`);

      expect(managerResponse.status).toBe(200);
      expect(managerResponse.body.success).toBe(true);
      expect(managerResponse.body.data).toBeDefined();

      // Test staff access
      const staffResponse = await request(app)
        .get("/api/v1/departments/code/TEST")
        .set("Authorization", `Bearer ${staffToken}`);

      expect(staffResponse.status).toBe(200);
      expect(staffResponse.body.success).toBe(true);
      expect(staffResponse.body.data).toBeDefined();

      // Test student access
      const studentResponse = await request(app)
        .get("/api/v1/departments/code/TEST")
        .set("Authorization", `Bearer ${studentToken}`);

      expect(studentResponse.status).toBe(200);
      expect(studentResponse.body.success).toBe(true);
      expect(studentResponse.body.data).toBeDefined();

      // Test without authentication
      const unauthenticatedResponse = await request(app).get(
        "/api/v1/departments/code/TEST"
      );

      expect(unauthenticatedResponse.status).toBe(401);
      expect(unauthenticatedResponse.body.error).toBeDefined();
    });

    it("should return 404 for non-existent department code", async () => {
      const response = await request(app)
        .get("/api/v1/departments/code/NONEXISTENT")
        .set("Authorization", `Bearer ${superAdminToken}`);

      expect(response.status).toBe(404);
      expect(response.body.error).toBeDefined();
    });
  });

  describe("POST /api/v1/departments", () => {
    it("should create a new department (super admin only)", async () => {
      const departmentData = {
        name: "New Department",
        code: "NEW",
        description: "New department description",
        headId: managerUser.id,
      };

      // Test super admin access
      const superAdminResponse = await request(app)
        .post("/api/v1/departments")
        .set("Authorization", `Bearer ${superAdminToken}`)
        .send(departmentData);

      expect(superAdminResponse.status).toBe(201);
      expect(superAdminResponse.body.success).toBe(true);
      expect(superAdminResponse.body.data).toBeDefined();
      expect(superAdminResponse.body.data.name).toBe(departmentData.name);
      expect(superAdminResponse.body.data.code).toBe(departmentData.code);

      // Test manager access (should be denied)
      const managerResponse = await request(app)
        .post("/api/v1/departments")
        .set("Authorization", `Bearer ${managerToken}`)
        .send(departmentData);

      expect(managerResponse.status).toBe(403);
      expect(managerResponse.body.error).toBeDefined();

      // Test staff access (should be denied)
      const staffResponse = await request(app)
        .post("/api/v1/departments")
        .set("Authorization", `Bearer ${staffToken}`)
        .send(departmentData);

      expect(staffResponse.status).toBe(403);
      expect(staffResponse.body.error).toBeDefined();

      // Test student access (should be denied)
      const studentResponse = await request(app)
        .post("/api/v1/departments")
        .set("Authorization", `Bearer ${studentToken}`)
        .send(departmentData);

      expect(studentResponse.status).toBe(403);
      expect(studentResponse.body.error).toBeDefined();
    });

    it("should validate department creation data", async () => {
      const invalidData = {
        name: "", // Empty name
        code: "", // Empty code
        description: "", // Empty description
        headId: "invalid-id", // Invalid user ID
      };

      const response = await request(app)
        .post("/api/v1/departments")
        .set("Authorization", `Bearer ${superAdminToken}`)
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
    });

    it("should prevent duplicate department codes", async () => {
      const duplicateData = {
        name: "Duplicate Department",
        code: "TEST", // Using existing code
        description: "Duplicate department description",
        headId: managerUser.id,
      };

      const response = await request(app)
        .post("/api/v1/departments")
        .set("Authorization", `Bearer ${superAdminToken}`)
        .send(duplicateData);

      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
    });
  });

  describe("PUT /api/v1/departments/:id", () => {
    it("should update department (super admin and manager only)", async () => {
      const updateData = {
        name: "Updated Department",
        description: "Updated department description",
      };

      // Test super admin access
      const superAdminResponse = await request(app)
        .put(`/api/v1/departments/${departmentId}`)
        .set("Authorization", `Bearer ${superAdminToken}`)
        .send(updateData);

      expect(superAdminResponse.status).toBe(200);
      expect(superAdminResponse.body.success).toBe(true);
      expect(superAdminResponse.body.data).toBeDefined();
      expect(superAdminResponse.body.data.name).toBe(updateData.name);
      expect(superAdminResponse.body.data.description).toBe(
        updateData.description
      );

      // Test manager access
      const managerResponse = await request(app)
        .put(`/api/v1/departments/${departmentId}`)
        .set("Authorization", `Bearer ${managerToken}`)
        .send(updateData);

      expect(managerResponse.status).toBe(200);
      expect(managerResponse.body.success).toBe(true);
      expect(managerResponse.body.data).toBeDefined();

      // Test staff access (should be denied)
      const staffResponse = await request(app)
        .put(`/api/v1/departments/${departmentId}`)
        .set("Authorization", `Bearer ${staffToken}`)
        .send(updateData);

      expect(staffResponse.status).toBe(403);
      expect(staffResponse.body.error).toBeDefined();

      // Test student access (should be denied)
      const studentResponse = await request(app)
        .put(`/api/v1/departments/${departmentId}`)
        .set("Authorization", `Bearer ${studentToken}`)
        .send(updateData);

      expect(studentResponse.status).toBe(403);
      expect(studentResponse.body.error).toBeDefined();
    });

    it("should validate department update data", async () => {
      const invalidData = {
        name: "", // Empty name
        description: "", // Empty description
      };

      const response = await request(app)
        .put(`/api/v1/departments/${departmentId}`)
        .set("Authorization", `Bearer ${superAdminToken}`)
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
    });

    it("should return 404 for non-existent department", async () => {
      const updateData = {
        name: "Updated Department",
        description: "Updated department description",
      };

      const response = await request(app)
        .put("/api/v1/departments/507f1f77bcf86cd799439011")
        .set("Authorization", `Bearer ${superAdminToken}`)
        .send(updateData);

      expect(response.status).toBe(404);
      expect(response.body.error).toBeDefined();
    });
  });

  describe("PATCH /api/v1/departments/:id/status", () => {
    it("should update department status (super admin only)", async () => {
      const statusData = {
        status: "INACTIVE",
      };

      // Test super admin access
      const superAdminResponse = await request(app)
        .patch(`/api/v1/departments/${departmentId}/status`)
        .set("Authorization", `Bearer ${superAdminToken}`)
        .send(statusData);

      expect(superAdminResponse.status).toBe(200);
      expect(superAdminResponse.body.success).toBe(true);
      expect(superAdminResponse.body.data).toBeDefined();
      expect(superAdminResponse.body.data.status).toBe(statusData.status);

      // Test manager access (should be denied)
      const managerResponse = await request(app)
        .patch(`/api/v1/departments/${departmentId}/status`)
        .set("Authorization", `Bearer ${managerToken}`)
        .send(statusData);

      expect(managerResponse.status).toBe(403);
      expect(managerResponse.body.error).toBeDefined();

      // Test staff access (should be denied)
      const staffResponse = await request(app)
        .patch(`/api/v1/departments/${departmentId}/status`)
        .set("Authorization", `Bearer ${staffToken}`)
        .send(statusData);

      expect(staffResponse.status).toBe(403);
      expect(staffResponse.body.error).toBeDefined();

      // Test student access (should be denied)
      const studentResponse = await request(app)
        .patch(`/api/v1/departments/${departmentId}/status`)
        .set("Authorization", `Bearer ${studentToken}`)
        .send(statusData);

      expect(studentResponse.status).toBe(403);
      expect(studentResponse.body.error).toBeDefined();
    });

    it("should validate status update data", async () => {
      const invalidData = {
        status: "INVALID_STATUS",
      };

      const response = await request(app)
        .patch(`/api/v1/departments/${departmentId}/status`)
        .set("Authorization", `Bearer ${superAdminToken}`)
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
    });

    it("should return 404 for non-existent department", async () => {
      const statusData = {
        status: "INACTIVE",
      };

      const response = await request(app)
        .patch("/api/v1/departments/507f1f77bcf86cd799439011/status")
        .set("Authorization", `Bearer ${superAdminToken}`)
        .send(statusData);

      expect(response.status).toBe(404);
      expect(response.body.error).toBeDefined();
    });
  });

  describe("POST /api/v1/departments/:id/head/:userId", () => {
    it("should assign department head (super admin only)", async () => {
      // Test super admin access
      const superAdminResponse = await request(app)
        .post(`/api/v1/departments/${departmentId}/head/${staffUser.id}`)
        .set("Authorization", `Bearer ${superAdminToken}`);

      expect(superAdminResponse.status).toBe(200);
      expect(superAdminResponse.body.success).toBe(true);
      expect(superAdminResponse.body.data).toBeDefined();
      expect(superAdminResponse.body.data.headId).toBe(staffUser.id);

      // Test manager access (should be denied)
      const managerResponse = await request(app)
        .post(`/api/v1/departments/${departmentId}/head/${staffUser.id}`)
        .set("Authorization", `Bearer ${managerToken}`);

      expect(managerResponse.status).toBe(403);
      expect(managerResponse.body.error).toBeDefined();

      // Test staff access (should be denied)
      const staffResponse = await request(app)
        .post(`/api/v1/departments/${departmentId}/head/${staffUser.id}`)
        .set("Authorization", `Bearer ${staffToken}`);

      expect(staffResponse.status).toBe(403);
      expect(staffResponse.body.error).toBeDefined();

      // Test student access (should be denied)
      const studentResponse = await request(app)
        .post(`/api/v1/departments/${departmentId}/head/${staffUser.id}`)
        .set("Authorization", `Bearer ${studentToken}`);

      expect(studentResponse.status).toBe(403);
      expect(studentResponse.body.error).toBeDefined();
    });

    it("should return 404 for non-existent department", async () => {
      const response = await request(app)
        .post(
          `/api/v1/departments/507f1f77bcf86cd799439011/head/${staffUser.id}`
        )
        .set("Authorization", `Bearer ${superAdminToken}`);

      expect(response.status).toBe(404);
      expect(response.body.error).toBeDefined();
    });

    it("should return 404 for non-existent user", async () => {
      const response = await request(app)
        .post(
          `/api/v1/departments/${departmentId}/head/507f1f77bcf86cd799439011`
        )
        .set("Authorization", `Bearer ${superAdminToken}`);

      expect(response.status).toBe(404);
      expect(response.body.error).toBeDefined();
    });
  });

  describe("DELETE /api/v1/departments/:id", () => {
    it("should delete department (super admin only)", async () => {
      // Test super admin access
      const superAdminResponse = await request(app)
        .delete(`/api/v1/departments/${departmentId}`)
        .set("Authorization", `Bearer ${superAdminToken}`);

      expect(superAdminResponse.status).toBe(200);
      expect(superAdminResponse.body.success).toBe(true);

      // Verify department is deleted
      const getResponse = await request(app)
        .get(`/api/v1/departments/${departmentId}`)
        .set("Authorization", `Bearer ${superAdminToken}`);

      expect(getResponse.status).toBe(404);
      expect(getResponse.body.error).toBeDefined();

      // Test manager access (should be denied)
      const managerResponse = await request(app)
        .delete(`/api/v1/departments/${subDepartmentId}`)
        .set("Authorization", `Bearer ${managerToken}`);

      expect(managerResponse.status).toBe(403);
      expect(managerResponse.body.error).toBeDefined();

      // Test staff access (should be denied)
      const staffResponse = await request(app)
        .delete(`/api/v1/departments/${subDepartmentId}`)
        .set("Authorization", `Bearer ${staffToken}`);

      expect(staffResponse.status).toBe(403);
      expect(staffResponse.body.error).toBeDefined();

      // Test student access (should be denied)
      const studentResponse = await request(app)
        .delete(`/api/v1/departments/${subDepartmentId}`)
        .set("Authorization", `Bearer ${studentToken}`);

      expect(studentResponse.status).toBe(403);
      expect(studentResponse.body.error).toBeDefined();
    });

    it("should return 404 for non-existent department", async () => {
      const response = await request(app)
        .delete("/api/v1/departments/507f1f77bcf86cd799439011")
        .set("Authorization", `Bearer ${superAdminToken}`);

      expect(response.status).toBe(404);
      expect(response.body.error).toBeDefined();
    });
  });

  describe("GET /api/v1/departments/:id/sub-departments", () => {
    it("should get sub-departments (authenticated users only)", async () => {
      // Test super admin access
      const superAdminResponse = await request(app)
        .get(`/api/v1/departments/${departmentId}/sub-departments`)
        .set("Authorization", `Bearer ${superAdminToken}`);

      expect(superAdminResponse.status).toBe(200);
      expect(superAdminResponse.body.success).toBe(true);
      expect(Array.isArray(superAdminResponse.body.data)).toBe(true);
      expect(superAdminResponse.body.data.length).toBeGreaterThan(0);
      expect(superAdminResponse.body.data[0]).toHaveProperty(
        "parentId",
        departmentId
      );

      // Test manager access
      const managerResponse = await request(app)
        .get(`/api/v1/departments/${departmentId}/sub-departments`)
        .set("Authorization", `Bearer ${managerToken}`);

      expect(managerResponse.status).toBe(200);
      expect(managerResponse.body.success).toBe(true);
      expect(Array.isArray(managerResponse.body.data)).toBe(true);

      // Test staff access
      const staffResponse = await request(app)
        .get(`/api/v1/departments/${departmentId}/sub-departments`)
        .set("Authorization", `Bearer ${staffToken}`);

      expect(staffResponse.status).toBe(200);
      expect(staffResponse.body.success).toBe(true);
      expect(Array.isArray(staffResponse.body.data)).toBe(true);

      // Test student access
      const studentResponse = await request(app)
        .get(`/api/v1/departments/${departmentId}/sub-departments`)
        .set("Authorization", `Bearer ${studentToken}`);

      expect(studentResponse.status).toBe(200);
      expect(studentResponse.body.success).toBe(true);
      expect(Array.isArray(studentResponse.body.data)).toBe(true);

      // Test without authentication
      const unauthenticatedResponse = await request(app).get(
        `/api/v1/departments/${departmentId}/sub-departments`
      );

      expect(unauthenticatedResponse.status).toBe(401);
      expect(unauthenticatedResponse.body.error).toBeDefined();
    });

    it("should return 404 for non-existent department", async () => {
      const response = await request(app)
        .get("/api/v1/departments/507f1f77bcf86cd799439011/sub-departments")
        .set("Authorization", `Bearer ${superAdminToken}`);

      expect(response.status).toBe(404);
      expect(response.body.error).toBeDefined();
    });
  });

  describe("POST /api/v1/departments/:id/logo", () => {
    it("should upload department logo (super admin and manager only)", async () => {
      const logoPath = path.join(__dirname, "../fixtures/test-logo.png");

      // Test super admin access
      const superAdminResponse = await request(app)
        .post(`/api/v1/departments/${departmentId}/logo`)
        .set("Authorization", `Bearer ${superAdminToken}`)
        .attach("logo", logoPath);

      expect(superAdminResponse.status).toBe(200);
      expect(superAdminResponse.body.success).toBe(true);
      expect(superAdminResponse.body.data).toBeDefined();
      expect(superAdminResponse.body.data.logoUrl).toBeDefined();

      // Test manager access
      const managerResponse = await request(app)
        .post(`/api/v1/departments/${departmentId}/logo`)
        .set("Authorization", `Bearer ${managerToken}`)
        .attach("logo", logoPath);

      expect(managerResponse.status).toBe(200);
      expect(managerResponse.body.success).toBe(true);
      expect(managerResponse.body.data).toBeDefined();

      // Test staff access (should be denied)
      const staffResponse = await request(app)
        .post(`/api/v1/departments/${departmentId}/logo`)
        .set("Authorization", `Bearer ${staffToken}`)
        .attach("logo", logoPath);

      expect(staffResponse.status).toBe(403);
      expect(staffResponse.body.error).toBeDefined();

      // Test student access (should be denied)
      const studentResponse = await request(app)
        .post(`/api/v1/departments/${departmentId}/logo`)
        .set("Authorization", `Bearer ${studentToken}`)
        .attach("logo", logoPath);

      expect(studentResponse.status).toBe(403);
      expect(studentResponse.body.error).toBeDefined();
    });

    it("should validate logo file type", async () => {
      const invalidLogoPath = path.join(__dirname, "../fixtures/test.txt");

      const response = await request(app)
        .post(`/api/v1/departments/${departmentId}/logo`)
        .set("Authorization", `Bearer ${superAdminToken}`)
        .attach("logo", invalidLogoPath);

      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
    });

    it("should return 404 for non-existent department", async () => {
      const logoPath = path.join(__dirname, "../fixtures/test-logo.png");

      const response = await request(app)
        .post("/api/v1/departments/507f1f77bcf86cd799439011/logo")
        .set("Authorization", `Bearer ${superAdminToken}`)
        .attach("logo", logoPath);

      expect(response.status).toBe(404);
      expect(response.body.error).toBeDefined();
    });
  });
});
