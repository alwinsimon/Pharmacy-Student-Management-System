const request = require("supertest");
const app = require("../../src/app");
const { createTestUser, generateTestToken } = require("../utils/test.utils");
const { ROLES } = require("../../src/constants/roles.constants");
const { USER_STATUS } = require("../../src/constants/status.constants");
const { PERMISSIONS } = require("../../src/constants/permissions.constants");
const path = require("path");

describe("Users API", () => {
  let superAdminToken;
  let managerToken;
  let staffToken;
  let studentToken;
  let superAdminUser;
  let managerUser;
  let staffUser;
  let studentUser;
  let pendingUser;

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

    // Create pending user
    pendingUser = await createTestUser({
      email: "pending@example.com",
      password: "StrongP@ss123",
      role: ROLES.STUDENT,
      status: USER_STATUS.PENDING,
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
  });

  describe("GET /api/v1/users", () => {
    it("should get all users with pagination (super admin and manager only)", async () => {
      // Test super admin access
      const superAdminResponse = await request(app)
        .get("/api/v1/users")
        .set("Authorization", `Bearer ${superAdminToken}`);

      expect(superAdminResponse.status).toBe(200);
      expect(superAdminResponse.body.success).toBe(true);
      expect(Array.isArray(superAdminResponse.body.data)).toBe(true);
      expect(superAdminResponse.body.data.length).toBeGreaterThan(0);
      expect(superAdminResponse.body.data[0]).toHaveProperty("id");
      expect(superAdminResponse.body.data[0]).toHaveProperty("email");
      expect(superAdminResponse.body.data[0]).toHaveProperty("role");

      // Test manager access
      const managerResponse = await request(app)
        .get("/api/v1/users")
        .set("Authorization", `Bearer ${managerToken}`);

      expect(managerResponse.status).toBe(200);
      expect(managerResponse.body.success).toBe(true);
      expect(Array.isArray(managerResponse.body.data)).toBe(true);

      // Test staff access (should be denied)
      const staffResponse = await request(app)
        .get("/api/v1/users")
        .set("Authorization", `Bearer ${staffToken}`);

      expect(staffResponse.status).toBe(403);
      expect(staffResponse.body.error).toBeDefined();

      // Test student access (should be denied)
      const studentResponse = await request(app)
        .get("/api/v1/users")
        .set("Authorization", `Bearer ${studentToken}`);

      expect(studentResponse.status).toBe(403);
      expect(studentResponse.body.error).toBeDefined();
    });

    it("should support pagination parameters", async () => {
      const page = 1;
      const limit = 10;

      const response = await request(app)
        .get(`/api/v1/users?page=${page}&limit=${limit}`)
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

  describe("GET /api/v1/users/:id", () => {
    it("should get user by ID (authenticated users only)", async () => {
      // Test super admin access
      const superAdminResponse = await request(app)
        .get(`/api/v1/users/${staffUser.id}`)
        .set("Authorization", `Bearer ${superAdminToken}`);

      expect(superAdminResponse.status).toBe(200);
      expect(superAdminResponse.body.success).toBe(true);
      expect(superAdminResponse.body.data).toBeDefined();
      expect(superAdminResponse.body.data.id).toBe(staffUser.id);

      // Test manager access
      const managerResponse = await request(app)
        .get(`/api/v1/users/${staffUser.id}`)
        .set("Authorization", `Bearer ${managerToken}`);

      expect(managerResponse.status).toBe(200);
      expect(managerResponse.body.success).toBe(true);
      expect(managerResponse.body.data).toBeDefined();

      // Test staff access (own profile)
      const staffResponse = await request(app)
        .get(`/api/v1/users/${staffUser.id}`)
        .set("Authorization", `Bearer ${staffToken}`);

      expect(staffResponse.status).toBe(200);
      expect(staffResponse.body.success).toBe(true);
      expect(staffResponse.body.data).toBeDefined();

      // Test student access (own profile)
      const studentResponse = await request(app)
        .get(`/api/v1/users/${studentUser.id}`)
        .set("Authorization", `Bearer ${studentToken}`);

      expect(studentResponse.status).toBe(200);
      expect(studentResponse.body.success).toBe(true);
      expect(studentResponse.body.data).toBeDefined();

      // Test accessing other user's profile (should be denied)
      const unauthorizedResponse = await request(app)
        .get(`/api/v1/users/${staffUser.id}`)
        .set("Authorization", `Bearer ${studentToken}`);

      expect(unauthorizedResponse.status).toBe(403);
      expect(unauthorizedResponse.body.error).toBeDefined();
    });

    it("should return 404 for non-existent user", async () => {
      const response = await request(app)
        .get("/api/v1/users/507f1f77bcf86cd799439011")
        .set("Authorization", `Bearer ${superAdminToken}`);

      expect(response.status).toBe(404);
      expect(response.body.error).toBeDefined();
    });
  });

  describe("POST /api/v1/users", () => {
    it("should create a new user (super admin and manager only)", async () => {
      const userData = {
        email: "newuser@example.com",
        password: "StrongP@ss123",
        firstName: "New",
        lastName: "User",
        role: ROLES.STAFF,
        departmentId: "507f1f77bcf86cd799439011",
      };

      // Test super admin access
      const superAdminResponse = await request(app)
        .post("/api/v1/users")
        .set("Authorization", `Bearer ${superAdminToken}`)
        .send(userData);

      expect(superAdminResponse.status).toBe(201);
      expect(superAdminResponse.body.success).toBe(true);
      expect(superAdminResponse.body.data).toBeDefined();
      expect(superAdminResponse.body.data.email).toBe(userData.email);
      expect(superAdminResponse.body.data.role).toBe(userData.role);

      // Test manager access
      const managerResponse = await request(app)
        .post("/api/v1/users")
        .set("Authorization", `Bearer ${managerToken}`)
        .send({
          ...userData,
          email: "newuser2@example.com",
        });

      expect(managerResponse.status).toBe(201);
      expect(managerResponse.body.success).toBe(true);
      expect(managerResponse.body.data).toBeDefined();

      // Test staff access (should be denied)
      const staffResponse = await request(app)
        .post("/api/v1/users")
        .set("Authorization", `Bearer ${staffToken}`)
        .send({
          ...userData,
          email: "newuser3@example.com",
        });

      expect(staffResponse.status).toBe(403);
      expect(staffResponse.body.error).toBeDefined();

      // Test student access (should be denied)
      const studentResponse = await request(app)
        .post("/api/v1/users")
        .set("Authorization", `Bearer ${studentToken}`)
        .send({
          ...userData,
          email: "newuser4@example.com",
        });

      expect(studentResponse.status).toBe(403);
      expect(studentResponse.body.error).toBeDefined();
    });

    it("should validate user creation data", async () => {
      const invalidData = {
        email: "invalid-email",
        password: "weak", // Too weak
        firstName: "", // Empty
        lastName: "", // Empty
        role: "INVALID_ROLE",
        departmentId: "invalid-id",
      };

      const response = await request(app)
        .post("/api/v1/users")
        .set("Authorization", `Bearer ${superAdminToken}`)
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
    });

    it("should prevent duplicate email addresses", async () => {
      const duplicateData = {
        email: "staff@example.com", // Using existing email
        password: "StrongP@ss123",
        firstName: "Duplicate",
        lastName: "User",
        role: ROLES.STAFF,
        departmentId: "507f1f77bcf86cd799439011",
      };

      const response = await request(app)
        .post("/api/v1/users")
        .set("Authorization", `Bearer ${superAdminToken}`)
        .send(duplicateData);

      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
    });
  });

  describe("PUT /api/v1/users/:id", () => {
    it("should update user (authenticated users can update their own profile)", async () => {
      const updateData = {
        firstName: "Updated",
        lastName: "Name",
      };

      // Test super admin updating any user
      const superAdminResponse = await request(app)
        .put(`/api/v1/users/${staffUser.id}`)
        .set("Authorization", `Bearer ${superAdminToken}`)
        .send(updateData);

      expect(superAdminResponse.status).toBe(200);
      expect(superAdminResponse.body.success).toBe(true);
      expect(superAdminResponse.body.data).toBeDefined();
      expect(superAdminResponse.body.data.firstName).toBe(updateData.firstName);
      expect(superAdminResponse.body.data.lastName).toBe(updateData.lastName);

      // Test manager updating any user
      const managerResponse = await request(app)
        .put(`/api/v1/users/${staffUser.id}`)
        .set("Authorization", `Bearer ${managerToken}`)
        .send(updateData);

      expect(managerResponse.status).toBe(200);
      expect(managerResponse.body.success).toBe(true);
      expect(managerResponse.body.data).toBeDefined();

      // Test staff updating own profile
      const staffResponse = await request(app)
        .put(`/api/v1/users/${staffUser.id}`)
        .set("Authorization", `Bearer ${staffToken}`)
        .send(updateData);

      expect(staffResponse.status).toBe(200);
      expect(staffResponse.body.success).toBe(true);
      expect(staffResponse.body.data).toBeDefined();

      // Test student updating own profile
      const studentResponse = await request(app)
        .put(`/api/v1/users/${studentUser.id}`)
        .set("Authorization", `Bearer ${studentToken}`)
        .send(updateData);

      expect(studentResponse.status).toBe(200);
      expect(studentResponse.body.success).toBe(true);
      expect(studentResponse.body.data).toBeDefined();

      // Test updating other user's profile (should be denied)
      const unauthorizedResponse = await request(app)
        .put(`/api/v1/users/${staffUser.id}`)
        .set("Authorization", `Bearer ${studentToken}`)
        .send(updateData);

      expect(unauthorizedResponse.status).toBe(403);
      expect(unauthorizedResponse.body.error).toBeDefined();
    });

    it("should validate user update data", async () => {
      const invalidData = {
        firstName: "", // Empty
        lastName: "", // Empty
      };

      const response = await request(app)
        .put(`/api/v1/users/${staffUser.id}`)
        .set("Authorization", `Bearer ${superAdminToken}`)
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
    });

    it("should return 404 for non-existent user", async () => {
      const updateData = {
        firstName: "Updated",
        lastName: "Name",
      };

      const response = await request(app)
        .put("/api/v1/users/507f1f77bcf86cd799439011")
        .set("Authorization", `Bearer ${superAdminToken}`)
        .send(updateData);

      expect(response.status).toBe(404);
      expect(response.body.error).toBeDefined();
    });
  });

  describe("PATCH /api/v1/users/:id/status", () => {
    it("should update user status (super admin and manager only)", async () => {
      const statusData = {
        status: USER_STATUS.INACTIVE,
      };

      // Test super admin access
      const superAdminResponse = await request(app)
        .patch(`/api/v1/users/${staffUser.id}/status`)
        .set("Authorization", `Bearer ${superAdminToken}`)
        .send(statusData);

      expect(superAdminResponse.status).toBe(200);
      expect(superAdminResponse.body.success).toBe(true);
      expect(superAdminResponse.body.data).toBeDefined();
      expect(superAdminResponse.body.data.status).toBe(statusData.status);

      // Test manager access
      const managerResponse = await request(app)
        .patch(`/api/v1/users/${staffUser.id}/status`)
        .set("Authorization", `Bearer ${managerToken}`)
        .send({
          status: USER_STATUS.ACTIVE,
        });

      expect(managerResponse.status).toBe(200);
      expect(managerResponse.body.success).toBe(true);
      expect(managerResponse.body.data).toBeDefined();

      // Test staff access (should be denied)
      const staffResponse = await request(app)
        .patch(`/api/v1/users/${staffUser.id}/status`)
        .set("Authorization", `Bearer ${staffToken}`)
        .send(statusData);

      expect(staffResponse.status).toBe(403);
      expect(staffResponse.body.error).toBeDefined();

      // Test student access (should be denied)
      const studentResponse = await request(app)
        .patch(`/api/v1/users/${staffUser.id}/status`)
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
        .patch(`/api/v1/users/${staffUser.id}/status`)
        .set("Authorization", `Bearer ${superAdminToken}`)
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
    });

    it("should return 404 for non-existent user", async () => {
      const statusData = {
        status: USER_STATUS.INACTIVE,
      };

      const response = await request(app)
        .patch("/api/v1/users/507f1f77bcf86cd799439011/status")
        .set("Authorization", `Bearer ${superAdminToken}`)
        .send(statusData);

      expect(response.status).toBe(404);
      expect(response.body.error).toBeDefined();
    });
  });

  describe("PATCH /api/v1/users/:id/permissions", () => {
    it("should update user permissions (super admin only)", async () => {
      const permissionsData = {
        permissions: [PERMISSIONS.USER_READ, PERMISSIONS.USER_CREATE],
      };

      // Test super admin access
      const superAdminResponse = await request(app)
        .patch(`/api/v1/users/${staffUser.id}/permissions`)
        .set("Authorization", `Bearer ${superAdminToken}`)
        .send(permissionsData);

      expect(superAdminResponse.status).toBe(200);
      expect(superAdminResponse.body.success).toBe(true);
      expect(superAdminResponse.body.data).toBeDefined();
      expect(superAdminResponse.body.data.permissions).toEqual(
        permissionsData.permissions
      );

      // Test manager access (should be denied)
      const managerResponse = await request(app)
        .patch(`/api/v1/users/${staffUser.id}/permissions`)
        .set("Authorization", `Bearer ${managerToken}`)
        .send(permissionsData);

      expect(managerResponse.status).toBe(403);
      expect(managerResponse.body.error).toBeDefined();

      // Test staff access (should be denied)
      const staffResponse = await request(app)
        .patch(`/api/v1/users/${staffUser.id}/permissions`)
        .set("Authorization", `Bearer ${staffToken}`)
        .send(permissionsData);

      expect(staffResponse.status).toBe(403);
      expect(staffResponse.body.error).toBeDefined();

      // Test student access (should be denied)
      const studentResponse = await request(app)
        .patch(`/api/v1/users/${staffUser.id}/permissions`)
        .set("Authorization", `Bearer ${studentToken}`)
        .send(permissionsData);

      expect(studentResponse.status).toBe(403);
      expect(studentResponse.body.error).toBeDefined();
    });

    it("should validate permissions update data", async () => {
      const invalidData = {
        permissions: ["INVALID_PERMISSION"],
      };

      const response = await request(app)
        .patch(`/api/v1/users/${staffUser.id}/permissions`)
        .set("Authorization", `Bearer ${superAdminToken}`)
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
    });

    it("should return 404 for non-existent user", async () => {
      const permissionsData = {
        permissions: [PERMISSIONS.USER_READ, PERMISSIONS.USER_CREATE],
      };

      const response = await request(app)
        .patch("/api/v1/users/507f1f77bcf86cd799439011/permissions")
        .set("Authorization", `Bearer ${superAdminToken}`)
        .send(permissionsData);

      expect(response.status).toBe(404);
      expect(response.body.error).toBeDefined();
    });
  });

  describe("DELETE /api/v1/users/:id", () => {
    it("should delete user (super admin only)", async () => {
      // Test super admin access
      const superAdminResponse = await request(app)
        .delete(`/api/v1/users/${staffUser.id}`)
        .set("Authorization", `Bearer ${superAdminToken}`);

      expect(superAdminResponse.status).toBe(200);
      expect(superAdminResponse.body.success).toBe(true);

      // Verify user is deleted
      const getResponse = await request(app)
        .get(`/api/v1/users/${staffUser.id}`)
        .set("Authorization", `Bearer ${superAdminToken}`);

      expect(getResponse.status).toBe(404);
      expect(getResponse.body.error).toBeDefined();

      // Test manager access (should be denied)
      const managerResponse = await request(app)
        .delete(`/api/v1/users/${studentUser.id}`)
        .set("Authorization", `Bearer ${managerToken}`);

      expect(managerResponse.status).toBe(403);
      expect(managerResponse.body.error).toBeDefined();

      // Test staff access (should be denied)
      const staffResponse = await request(app)
        .delete(`/api/v1/users/${studentUser.id}`)
        .set("Authorization", `Bearer ${staffToken}`);

      expect(staffResponse.status).toBe(403);
      expect(staffResponse.body.error).toBeDefined();

      // Test student access (should be denied)
      const studentResponse = await request(app)
        .delete(`/api/v1/users/${staffUser.id}`)
        .set("Authorization", `Bearer ${studentToken}`);

      expect(studentResponse.status).toBe(403);
      expect(studentResponse.body.error).toBeDefined();
    });

    it("should return 404 for non-existent user", async () => {
      const response = await request(app)
        .delete("/api/v1/users/507f1f77bcf86cd799439011")
        .set("Authorization", `Bearer ${superAdminToken}`);

      expect(response.status).toBe(404);
      expect(response.body.error).toBeDefined();
    });
  });

  describe("GET /api/v1/users/role/:role", () => {
    it("should get users by role (super admin and manager only)", async () => {
      // Test super admin access
      const superAdminResponse = await request(app)
        .get(`/api/v1/users/role/${ROLES.STAFF}`)
        .set("Authorization", `Bearer ${superAdminToken}`);

      expect(superAdminResponse.status).toBe(200);
      expect(superAdminResponse.body.success).toBe(true);
      expect(Array.isArray(superAdminResponse.body.data)).toBe(true);
      expect(superAdminResponse.body.data.length).toBeGreaterThan(0);
      expect(superAdminResponse.body.data[0].role).toBe(ROLES.STAFF);

      // Test manager access
      const managerResponse = await request(app)
        .get(`/api/v1/users/role/${ROLES.STAFF}`)
        .set("Authorization", `Bearer ${managerToken}`);

      expect(managerResponse.status).toBe(200);
      expect(managerResponse.body.success).toBe(true);
      expect(Array.isArray(managerResponse.body.data)).toBe(true);

      // Test staff access (should be denied)
      const staffResponse = await request(app)
        .get(`/api/v1/users/role/${ROLES.STAFF}`)
        .set("Authorization", `Bearer ${staffToken}`);

      expect(staffResponse.status).toBe(403);
      expect(staffResponse.body.error).toBeDefined();

      // Test student access (should be denied)
      const studentResponse = await request(app)
        .get(`/api/v1/users/role/${ROLES.STAFF}`)
        .set("Authorization", `Bearer ${studentToken}`);

      expect(studentResponse.status).toBe(403);
      expect(studentResponse.body.error).toBeDefined();
    });

    it("should return 404 for invalid role", async () => {
      const response = await request(app)
        .get("/api/v1/users/role/INVALID_ROLE")
        .set("Authorization", `Bearer ${superAdminToken}`);

      expect(response.status).toBe(404);
      expect(response.body.error).toBeDefined();
    });
  });

  describe("GET /api/v1/users/department/:departmentId", () => {
    it("should get users by department (super admin and manager only)", async () => {
      const departmentId = "507f1f77bcf86cd799439011";

      // Test super admin access
      const superAdminResponse = await request(app)
        .get(`/api/v1/users/department/${departmentId}`)
        .set("Authorization", `Bearer ${superAdminToken}`);

      expect(superAdminResponse.status).toBe(200);
      expect(superAdminResponse.body.success).toBe(true);
      expect(Array.isArray(superAdminResponse.body.data)).toBe(true);

      // Test manager access
      const managerResponse = await request(app)
        .get(`/api/v1/users/department/${departmentId}`)
        .set("Authorization", `Bearer ${managerToken}`);

      expect(managerResponse.status).toBe(200);
      expect(managerResponse.body.success).toBe(true);
      expect(Array.isArray(managerResponse.body.data)).toBe(true);

      // Test staff access (should be denied)
      const staffResponse = await request(app)
        .get(`/api/v1/users/department/${departmentId}`)
        .set("Authorization", `Bearer ${staffToken}`);

      expect(staffResponse.status).toBe(403);
      expect(staffResponse.body.error).toBeDefined();

      // Test student access (should be denied)
      const studentResponse = await request(app)
        .get(`/api/v1/users/department/${departmentId}`)
        .set("Authorization", `Bearer ${studentToken}`);

      expect(studentResponse.status).toBe(403);
      expect(studentResponse.body.error).toBeDefined();
    });

    it("should return 404 for non-existent department", async () => {
      const response = await request(app)
        .get("/api/v1/users/department/507f1f77bcf86cd799439011")
        .set("Authorization", `Bearer ${superAdminToken}`);

      expect(response.status).toBe(404);
      expect(response.body.error).toBeDefined();
    });
  });

  describe("POST /api/v1/users/:id/approve", () => {
    it("should approve user registration (super admin and manager only)", async () => {
      // Test super admin access
      const superAdminResponse = await request(app)
        .post(`/api/v1/users/${pendingUser.id}/approve`)
        .set("Authorization", `Bearer ${superAdminToken}`);

      expect(superAdminResponse.status).toBe(200);
      expect(superAdminResponse.body.success).toBe(true);
      expect(superAdminResponse.body.data).toBeDefined();
      expect(superAdminResponse.body.data.status).toBe(USER_STATUS.ACTIVE);

      // Test manager access
      const managerResponse = await request(app)
        .post(`/api/v1/users/${pendingUser.id}/approve`)
        .set("Authorization", `Bearer ${managerToken}`);

      expect(managerResponse.status).toBe(200);
      expect(managerResponse.body.success).toBe(true);
      expect(managerResponse.body.data).toBeDefined();

      // Test staff access (should be denied)
      const staffResponse = await request(app)
        .post(`/api/v1/users/${pendingUser.id}/approve`)
        .set("Authorization", `Bearer ${staffToken}`);

      expect(staffResponse.status).toBe(403);
      expect(staffResponse.body.error).toBeDefined();

      // Test student access (should be denied)
      const studentResponse = await request(app)
        .post(`/api/v1/users/${pendingUser.id}/approve`)
        .set("Authorization", `Bearer ${studentToken}`);

      expect(studentResponse.status).toBe(403);
      expect(studentResponse.body.error).toBeDefined();
    });

    it("should return 404 for non-existent user", async () => {
      const response = await request(app)
        .post("/api/v1/users/507f1f77bcf86cd799439011/approve")
        .set("Authorization", `Bearer ${superAdminToken}`);

      expect(response.status).toBe(404);
      expect(response.body.error).toBeDefined();
    });

    it("should not allow approving already approved users", async () => {
      const response = await request(app)
        .post(`/api/v1/users/${staffUser.id}/approve`)
        .set("Authorization", `Bearer ${superAdminToken}`);

      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
    });
  });

  describe("POST /api/v1/users/:id/reject", () => {
    it("should reject user registration (super admin and manager only)", async () => {
      const rejectData = {
        reason: "Invalid registration details",
      };

      // Test super admin access
      const superAdminResponse = await request(app)
        .post(`/api/v1/users/${pendingUser.id}/reject`)
        .set("Authorization", `Bearer ${superAdminToken}`)
        .send(rejectData);

      expect(superAdminResponse.status).toBe(200);
      expect(superAdminResponse.body.success).toBe(true);
      expect(superAdminResponse.body.data).toBeDefined();
      expect(superAdminResponse.body.data.status).toBe(USER_STATUS.REJECTED);

      // Test manager access
      const managerResponse = await request(app)
        .post(`/api/v1/users/${pendingUser.id}/reject`)
        .set("Authorization", `Bearer ${managerToken}`)
        .send(rejectData);

      expect(managerResponse.status).toBe(200);
      expect(managerResponse.body.success).toBe(true);
      expect(managerResponse.body.data).toBeDefined();

      // Test staff access (should be denied)
      const staffResponse = await request(app)
        .post(`/api/v1/users/${pendingUser.id}/reject`)
        .set("Authorization", `Bearer ${staffToken}`)
        .send(rejectData);

      expect(staffResponse.status).toBe(403);
      expect(staffResponse.body.error).toBeDefined();

      // Test student access (should be denied)
      const studentResponse = await request(app)
        .post(`/api/v1/users/${pendingUser.id}/reject`)
        .set("Authorization", `Bearer ${studentToken}`)
        .send(rejectData);

      expect(studentResponse.status).toBe(403);
      expect(studentResponse.body.error).toBeDefined();
    });

    it("should validate rejection reason", async () => {
      const invalidData = {
        reason: "", // Empty reason
      };

      const response = await request(app)
        .post(`/api/v1/users/${pendingUser.id}/reject`)
        .set("Authorization", `Bearer ${superAdminToken}`)
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
    });

    it("should return 404 for non-existent user", async () => {
      const rejectData = {
        reason: "Invalid registration details",
      };

      const response = await request(app)
        .post("/api/v1/users/507f1f77bcf86cd799439011/reject")
        .set("Authorization", `Bearer ${superAdminToken}`)
        .send(rejectData);

      expect(response.status).toBe(404);
      expect(response.body.error).toBeDefined();
    });

    it("should not allow rejecting already approved users", async () => {
      const rejectData = {
        reason: "Invalid registration details",
      };

      const response = await request(app)
        .post(`/api/v1/users/${staffUser.id}/reject`)
        .set("Authorization", `Bearer ${superAdminToken}`)
        .send(rejectData);

      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
    });
  });

  describe("POST /api/v1/users/:id/profile-picture", () => {
    it("should upload profile picture (authenticated users can upload their own)", async () => {
      const profilePicturePath = path.join(
        __dirname,
        "../fixtures/test-profile.png"
      );

      // Test super admin uploading for any user
      const superAdminResponse = await request(app)
        .post(`/api/v1/users/${staffUser.id}/profile-picture`)
        .set("Authorization", `Bearer ${superAdminToken}`)
        .attach("profilePicture", profilePicturePath);

      expect(superAdminResponse.status).toBe(200);
      expect(superAdminResponse.body.success).toBe(true);
      expect(superAdminResponse.body.data).toBeDefined();
      expect(superAdminResponse.body.data.profilePictureUrl).toBeDefined();

      // Test manager uploading for any user
      const managerResponse = await request(app)
        .post(`/api/v1/users/${staffUser.id}/profile-picture`)
        .set("Authorization", `Bearer ${managerToken}`)
        .attach("profilePicture", profilePicturePath);

      expect(managerResponse.status).toBe(200);
      expect(managerResponse.body.success).toBe(true);
      expect(managerResponse.body.data).toBeDefined();

      // Test staff uploading own profile picture
      const staffResponse = await request(app)
        .post(`/api/v1/users/${staffUser.id}/profile-picture`)
        .set("Authorization", `Bearer ${staffToken}`)
        .attach("profilePicture", profilePicturePath);

      expect(staffResponse.status).toBe(200);
      expect(staffResponse.body.success).toBe(true);
      expect(staffResponse.body.data).toBeDefined();

      // Test student uploading own profile picture
      const studentResponse = await request(app)
        .post(`/api/v1/users/${studentUser.id}/profile-picture`)
        .set("Authorization", `Bearer ${studentToken}`)
        .attach("profilePicture", profilePicturePath);

      expect(studentResponse.status).toBe(200);
      expect(studentResponse.body.success).toBe(true);
      expect(studentResponse.body.data).toBeDefined();

      // Test uploading for other user (should be denied)
      const unauthorizedResponse = await request(app)
        .post(`/api/v1/users/${staffUser.id}/profile-picture`)
        .set("Authorization", `Bearer ${studentToken}`)
        .attach("profilePicture", profilePicturePath);

      expect(unauthorizedResponse.status).toBe(403);
      expect(unauthorizedResponse.body.error).toBeDefined();
    });

    it("should validate profile picture file type", async () => {
      const invalidFilePath = path.join(__dirname, "../fixtures/test.txt");

      const response = await request(app)
        .post(`/api/v1/users/${staffUser.id}/profile-picture`)
        .set("Authorization", `Bearer ${superAdminToken}`)
        .attach("profilePicture", invalidFilePath);

      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
    });

    it("should return 404 for non-existent user", async () => {
      const profilePicturePath = path.join(
        __dirname,
        "../fixtures/test-profile.png"
      );

      const response = await request(app)
        .post("/api/v1/users/507f1f77bcf86cd799439011/profile-picture")
        .set("Authorization", `Bearer ${superAdminToken}`)
        .attach("profilePicture", profilePicturePath);

      expect(response.status).toBe(404);
      expect(response.body.error).toBeDefined();
    });
  });

  describe("GET /api/v1/users/search", () => {
    it("should search users (super admin and manager only)", async () => {
      const searchQuery = "staff";

      // Test super admin access
      const superAdminResponse = await request(app)
        .get(`/api/v1/users/search?q=${searchQuery}`)
        .set("Authorization", `Bearer ${superAdminToken}`);

      expect(superAdminResponse.status).toBe(200);
      expect(superAdminResponse.body.success).toBe(true);
      expect(Array.isArray(superAdminResponse.body.data)).toBe(true);
      expect(superAdminResponse.body.data.length).toBeGreaterThan(0);
      expect(
        superAdminResponse.body.data.some((user) =>
          user.email.toLowerCase().includes(searchQuery.toLowerCase())
        )
      ).toBe(true);

      // Test manager access
      const managerResponse = await request(app)
        .get(`/api/v1/users/search?q=${searchQuery}`)
        .set("Authorization", `Bearer ${managerToken}`);

      expect(managerResponse.status).toBe(200);
      expect(managerResponse.body.success).toBe(true);
      expect(Array.isArray(managerResponse.body.data)).toBe(true);

      // Test staff access (should be denied)
      const staffResponse = await request(app)
        .get(`/api/v1/users/search?q=${searchQuery}`)
        .set("Authorization", `Bearer ${staffToken}`);

      expect(staffResponse.status).toBe(403);
      expect(staffResponse.body.error).toBeDefined();

      // Test student access (should be denied)
      const studentResponse = await request(app)
        .get(`/api/v1/users/search?q=${searchQuery}`)
        .set("Authorization", `Bearer ${studentToken}`);

      expect(studentResponse.status).toBe(403);
      expect(studentResponse.body.error).toBeDefined();
    });

    it("should support pagination in search results", async () => {
      const searchQuery = "staff";
      const page = 1;
      const limit = 10;

      const response = await request(app)
        .get(
          `/api/v1/users/search?q=${searchQuery}&page=${page}&limit=${limit}`
        )
        .set("Authorization", `Bearer ${superAdminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBeLessThanOrEqual(limit);
      expect(response.body).toHaveProperty("pagination");
      expect(response.body.pagination).toHaveProperty("page", page);
      expect(response.body.pagination).toHaveProperty("limit", limit);
      expect(response.body.pagination).toHaveProperty("total");
    });

    it("should handle empty search query", async () => {
      const response = await request(app)
        .get("/api/v1/users/search?q=")
        .set("Authorization", `Bearer ${superAdminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });
});
