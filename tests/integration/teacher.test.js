const request = require("supertest");
const app = require("../../src/app");
const { createTestUser, generateTestToken } = require("../utils/test.utils");
const { ROLES } = require("../../src/constants/roles.constants");
const { USER_STATUS } = require("../../src/constants/status.constants");

describe("Teacher Management API", () => {
  let adminToken;
  let teacherToken;
  let studentToken;
  let adminUser;
  let teacherUser;
  let studentUser;

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
  });

  describe("GET /api/v1/teachers", () => {
    it("should get all teachers (admin only)", async () => {
      // Create some test teachers
      await createTestUser({
        email: "teacher1@example.com",
        role: ROLES.TEACHER,
      });
      await createTestUser({
        email: "teacher2@example.com",
        role: ROLES.TEACHER,
      });

      const response = await request(app)
        .get("/api/v1/teachers")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(2); // Including test teacher
    });

    it("should return 403 for non-admin users", async () => {
      // Test teacher access
      const teacherResponse = await request(app)
        .get("/api/v1/teachers")
        .set("Authorization", `Bearer ${teacherToken}`);

      expect(teacherResponse.status).toBe(403);
      expect(teacherResponse.body.error).toBeDefined();

      // Test student access
      const studentResponse = await request(app)
        .get("/api/v1/teachers")
        .set("Authorization", `Bearer ${studentToken}`);

      expect(studentResponse.status).toBe(403);
      expect(studentResponse.body.error).toBeDefined();
    });
  });

  describe("GET /api/v1/teachers/:id", () => {
    it("should get teacher by ID (admin only)", async () => {
      const teacher = await createTestUser({
        email: "get-teacher@example.com",
        role: ROLES.TEACHER,
      });

      const response = await request(app)
        .get(`/api/v1/teachers/${teacher.id}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(teacher.id);
    });

    it("should return 404 for non-existent teacher", async () => {
      const response = await request(app)
        .get("/api/v1/teachers/507f1f77bcf86cd799439011")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
      expect(response.body.error).toBeDefined();
    });
  });

  describe("POST /api/v1/teachers", () => {
    it("should create new teacher (admin only)", async () => {
      const teacherData = {
        email: "new-teacher@example.com",
        password: "StrongP@ss123",
        firstName: "New",
        lastName: "Teacher",
        department: "Pharmacy",
        specialization: "Clinical Pharmacy",
        qualification: "Ph.D.",
        experience: "5 years",
      };

      const response = await request(app)
        .post("/api/v1/teachers")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(teacherData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.email).toBe(teacherData.email);
      expect(response.body.data.role).toBe(ROLES.TEACHER);
      expect(response.body.data.department).toBe(teacherData.department);
      expect(response.body.data.specialization).toBe(
        teacherData.specialization
      );
    });

    it("should return 403 for non-admin users", async () => {
      const teacherData = {
        email: "unauthorized@example.com",
        password: "StrongP@ss123",
      };

      // Test teacher access
      const teacherResponse = await request(app)
        .post("/api/v1/teachers")
        .set("Authorization", `Bearer ${teacherToken}`)
        .send(teacherData);

      expect(teacherResponse.status).toBe(403);
      expect(teacherResponse.body.error).toBeDefined();

      // Test student access
      const studentResponse = await request(app)
        .post("/api/v1/teachers")
        .set("Authorization", `Bearer ${studentToken}`)
        .send(teacherData);

      expect(studentResponse.status).toBe(403);
      expect(studentResponse.body.error).toBeDefined();
    });
  });

  describe("PUT /api/v1/teachers/:id", () => {
    it("should update teacher (admin only)", async () => {
      const teacher = await createTestUser({
        email: "update-teacher@example.com",
        role: ROLES.TEACHER,
      });

      const updateData = {
        firstName: "Updated",
        lastName: "Name",
        department: "Clinical Pharmacy",
        specialization: "Pharmacology",
        qualification: "M.Pharm",
        experience: "10 years",
      };

      const response = await request(app)
        .put(`/api/v1/teachers/${teacher.id}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.firstName).toBe(updateData.firstName);
      expect(response.body.data.lastName).toBe(updateData.lastName);
      expect(response.body.data.department).toBe(updateData.department);
      expect(response.body.data.specialization).toBe(updateData.specialization);
    });

    it("should return 403 for non-admin users", async () => {
      const teacher = await createTestUser({
        email: "unauthorized-update@example.com",
        role: ROLES.TEACHER,
      });

      const updateData = {
        firstName: "Updated",
        lastName: "Name",
      };

      // Test teacher access
      const teacherResponse = await request(app)
        .put(`/api/v1/teachers/${teacher.id}`)
        .set("Authorization", `Bearer ${teacherToken}`)
        .send(updateData);

      expect(teacherResponse.status).toBe(403);
      expect(teacherResponse.body.error).toBeDefined();

      // Test student access
      const studentResponse = await request(app)
        .put(`/api/v1/teachers/${teacher.id}`)
        .set("Authorization", `Bearer ${studentToken}`)
        .send(updateData);

      expect(studentResponse.status).toBe(403);
      expect(studentResponse.body.error).toBeDefined();
    });
  });

  describe("DELETE /api/v1/teachers/:id", () => {
    it("should delete teacher (admin only)", async () => {
      const teacher = await createTestUser({
        email: "delete-teacher@example.com",
        role: ROLES.TEACHER,
      });

      const response = await request(app)
        .delete(`/api/v1/teachers/${teacher.id}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      // Verify teacher is deleted
      const getResponse = await request(app)
        .get(`/api/v1/teachers/${teacher.id}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(getResponse.status).toBe(404);
    });

    it("should return 403 for non-admin users", async () => {
      const teacher = await createTestUser({
        email: "unauthorized-delete@example.com",
        role: ROLES.TEACHER,
      });

      // Test teacher access
      const teacherResponse = await request(app)
        .delete(`/api/v1/teachers/${teacher.id}`)
        .set("Authorization", `Bearer ${teacherToken}`);

      expect(teacherResponse.status).toBe(403);
      expect(teacherResponse.body.error).toBeDefined();

      // Test student access
      const studentResponse = await request(app)
        .delete(`/api/v1/teachers/${teacher.id}`)
        .set("Authorization", `Bearer ${studentToken}`);

      expect(studentResponse.status).toBe(403);
      expect(studentResponse.body.error).toBeDefined();
    });
  });

  describe("GET /api/v1/teachers/:id/classes", () => {
    it("should get teacher classes (admin and teacher)", async () => {
      const teacher = await createTestUser({
        email: "classes-teacher@example.com",
        role: ROLES.TEACHER,
      });

      // Test admin access
      const adminResponse = await request(app)
        .get(`/api/v1/teachers/${teacher.id}/classes`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(adminResponse.status).toBe(200);
      expect(adminResponse.body.success).toBe(true);
      expect(Array.isArray(adminResponse.body.data)).toBe(true);

      // Test teacher access (own classes)
      const teacherResponse = await request(app)
        .get(`/api/v1/teachers/${teacher.id}/classes`)
        .set("Authorization", `Bearer ${teacherToken}`);

      expect(teacherResponse.status).toBe(200);
      expect(teacherResponse.body.success).toBe(true);
      expect(Array.isArray(teacherResponse.body.data)).toBe(true);

      // Test student access (should be denied)
      const studentResponse = await request(app)
        .get(`/api/v1/teachers/${teacher.id}/classes`)
        .set("Authorization", `Bearer ${studentToken}`);

      expect(studentResponse.status).toBe(403);
      expect(studentResponse.body.error).toBeDefined();
    });

    it("should return 403 for teacher accessing other teacher classes", async () => {
      const otherTeacher = await createTestUser({
        email: "other-teacher@example.com",
        role: ROLES.TEACHER,
      });

      const response = await request(app)
        .get(`/api/v1/teachers/${otherTeacher.id}/classes`)
        .set("Authorization", `Bearer ${teacherToken}`);

      expect(response.status).toBe(403);
      expect(response.body.error).toBeDefined();
    });
  });

  describe("GET /api/v1/teachers/:id/students", () => {
    it("should get teacher students (admin and teacher)", async () => {
      const teacher = await createTestUser({
        email: "students-teacher@example.com",
        role: ROLES.TEACHER,
      });

      // Create some test students
      await createTestUser({
        email: "student1@example.com",
        role: ROLES.STUDENT,
      });
      await createTestUser({
        email: "student2@example.com",
        role: ROLES.STUDENT,
      });

      // Test admin access
      const adminResponse = await request(app)
        .get(`/api/v1/teachers/${teacher.id}/students`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(adminResponse.status).toBe(200);
      expect(adminResponse.body.success).toBe(true);
      expect(Array.isArray(adminResponse.body.data)).toBe(true);

      // Test teacher access (own students)
      const teacherResponse = await request(app)
        .get(`/api/v1/teachers/${teacher.id}/students`)
        .set("Authorization", `Bearer ${teacherToken}`);

      expect(teacherResponse.status).toBe(200);
      expect(teacherResponse.body.success).toBe(true);
      expect(Array.isArray(teacherResponse.body.data)).toBe(true);

      // Test student access (should be denied)
      const studentResponse = await request(app)
        .get(`/api/v1/teachers/${teacher.id}/students`)
        .set("Authorization", `Bearer ${studentToken}`);

      expect(studentResponse.status).toBe(403);
      expect(studentResponse.body.error).toBeDefined();
    });

    it("should return 403 for teacher accessing other teacher students", async () => {
      const otherTeacher = await createTestUser({
        email: "other-teacher@example.com",
        role: ROLES.TEACHER,
      });

      const response = await request(app)
        .get(`/api/v1/teachers/${otherTeacher.id}/students`)
        .set("Authorization", `Bearer ${teacherToken}`);

      expect(response.status).toBe(403);
      expect(response.body.error).toBeDefined();
    });
  });
});
