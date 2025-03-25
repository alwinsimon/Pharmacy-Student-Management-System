const request = require("supertest");
const app = require("../../src/app");
const { createTestUser, generateTestToken } = require("../utils/test.utils");
const { ROLES } = require("../../src/constants/roles.constants");
const { USER_STATUS } = require("../../src/constants/status.constants");

describe("Student Management API", () => {
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

  describe("GET /api/v1/students", () => {
    it("should get all students (admin and teacher only)", async () => {
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
        .get("/api/v1/students")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(adminResponse.status).toBe(200);
      expect(adminResponse.body.success).toBe(true);
      expect(Array.isArray(adminResponse.body.data)).toBe(true);

      // Test teacher access
      const teacherResponse = await request(app)
        .get("/api/v1/students")
        .set("Authorization", `Bearer ${teacherToken}`);

      expect(teacherResponse.status).toBe(200);
      expect(teacherResponse.body.success).toBe(true);
      expect(Array.isArray(teacherResponse.body.data)).toBe(true);

      // Test student access (should be denied)
      const studentResponse = await request(app)
        .get("/api/v1/students")
        .set("Authorization", `Bearer ${studentToken}`);

      expect(studentResponse.status).toBe(403);
      expect(studentResponse.body.error).toBeDefined();
    });
  });

  describe("GET /api/v1/students/:id", () => {
    it("should get student by ID (admin and teacher only)", async () => {
      const student = await createTestUser({
        email: "get-student@example.com",
        role: ROLES.STUDENT,
      });

      // Test admin access
      const adminResponse = await request(app)
        .get(`/api/v1/students/${student.id}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(adminResponse.status).toBe(200);
      expect(adminResponse.body.success).toBe(true);
      expect(adminResponse.body.data.id).toBe(student.id);

      // Test teacher access
      const teacherResponse = await request(app)
        .get(`/api/v1/students/${student.id}`)
        .set("Authorization", `Bearer ${teacherToken}`);

      expect(teacherResponse.status).toBe(200);
      expect(teacherResponse.body.success).toBe(true);
      expect(teacherResponse.body.data.id).toBe(student.id);

      // Test student access (should be denied)
      const studentResponse = await request(app)
        .get(`/api/v1/students/${student.id}`)
        .set("Authorization", `Bearer ${studentToken}`);

      expect(studentResponse.status).toBe(403);
      expect(studentResponse.body.error).toBeDefined();
    });

    it("should return 404 for non-existent student", async () => {
      const response = await request(app)
        .get("/api/v1/students/507f1f77bcf86cd799439011")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
      expect(response.body.error).toBeDefined();
    });
  });

  describe("POST /api/v1/students", () => {
    it("should create new student (admin only)", async () => {
      const studentData = {
        email: "new-student@example.com",
        password: "StrongP@ss123",
        firstName: "New",
        lastName: "Student",
        studentId: "STU001",
        batch: "2024",
        department: "Pharmacy",
      };

      const response = await request(app)
        .post("/api/v1/students")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(studentData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.email).toBe(studentData.email);
      expect(response.body.data.role).toBe(ROLES.STUDENT);
      expect(response.body.data.studentId).toBe(studentData.studentId);
    });

    it("should return 403 for non-admin users", async () => {
      const studentData = {
        email: "unauthorized@example.com",
        password: "StrongP@ss123",
      };

      // Test teacher access
      const teacherResponse = await request(app)
        .post("/api/v1/students")
        .set("Authorization", `Bearer ${teacherToken}`)
        .send(studentData);

      expect(teacherResponse.status).toBe(403);
      expect(teacherResponse.body.error).toBeDefined();

      // Test student access
      const studentResponse = await request(app)
        .post("/api/v1/students")
        .set("Authorization", `Bearer ${studentToken}`)
        .send(studentData);

      expect(studentResponse.status).toBe(403);
      expect(studentResponse.body.error).toBeDefined();
    });
  });

  describe("PUT /api/v1/students/:id", () => {
    it("should update student (admin only)", async () => {
      const student = await createTestUser({
        email: "update-student@example.com",
        role: ROLES.STUDENT,
      });

      const updateData = {
        firstName: "Updated",
        lastName: "Name",
        batch: "2025",
        department: "Clinical Pharmacy",
      };

      const response = await request(app)
        .put(`/api/v1/students/${student.id}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.firstName).toBe(updateData.firstName);
      expect(response.body.data.lastName).toBe(updateData.lastName);
      expect(response.body.data.batch).toBe(updateData.batch);
      expect(response.body.data.department).toBe(updateData.department);
    });

    it("should return 403 for non-admin users", async () => {
      const student = await createTestUser({
        email: "unauthorized-update@example.com",
        role: ROLES.STUDENT,
      });

      const updateData = {
        firstName: "Updated",
        lastName: "Name",
      };

      // Test teacher access
      const teacherResponse = await request(app)
        .put(`/api/v1/students/${student.id}`)
        .set("Authorization", `Bearer ${teacherToken}`)
        .send(updateData);

      expect(teacherResponse.status).toBe(403);
      expect(teacherResponse.body.error).toBeDefined();

      // Test student access
      const studentResponse = await request(app)
        .put(`/api/v1/students/${student.id}`)
        .set("Authorization", `Bearer ${studentToken}`)
        .send(updateData);

      expect(studentResponse.status).toBe(403);
      expect(studentResponse.body.error).toBeDefined();
    });
  });

  describe("DELETE /api/v1/students/:id", () => {
    it("should delete student (admin only)", async () => {
      const student = await createTestUser({
        email: "delete-student@example.com",
        role: ROLES.STUDENT,
      });

      const response = await request(app)
        .delete(`/api/v1/students/${student.id}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      // Verify student is deleted
      const getResponse = await request(app)
        .get(`/api/v1/students/${student.id}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(getResponse.status).toBe(404);
    });

    it("should return 403 for non-admin users", async () => {
      const student = await createTestUser({
        email: "unauthorized-delete@example.com",
        role: ROLES.STUDENT,
      });

      // Test teacher access
      const teacherResponse = await request(app)
        .delete(`/api/v1/students/${student.id}`)
        .set("Authorization", `Bearer ${teacherToken}`);

      expect(teacherResponse.status).toBe(403);
      expect(teacherResponse.body.error).toBeDefined();

      // Test student access
      const studentResponse = await request(app)
        .delete(`/api/v1/students/${student.id}`)
        .set("Authorization", `Bearer ${studentToken}`);

      expect(studentResponse.status).toBe(403);
      expect(studentResponse.body.error).toBeDefined();
    });
  });

  describe("GET /api/v1/students/:id/attendance", () => {
    it("should get student attendance (admin and teacher only)", async () => {
      const student = await createTestUser({
        email: "attendance-student@example.com",
        role: ROLES.STUDENT,
      });

      // Test admin access
      const adminResponse = await request(app)
        .get(`/api/v1/students/${student.id}/attendance`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(adminResponse.status).toBe(200);
      expect(adminResponse.body.success).toBe(true);
      expect(Array.isArray(adminResponse.body.data)).toBe(true);

      // Test teacher access
      const teacherResponse = await request(app)
        .get(`/api/v1/students/${student.id}/attendance`)
        .set("Authorization", `Bearer ${teacherToken}`);

      expect(teacherResponse.status).toBe(200);
      expect(teacherResponse.body.success).toBe(true);
      expect(Array.isArray(teacherResponse.body.data)).toBe(true);

      // Test student access (should be denied)
      const studentResponse = await request(app)
        .get(`/api/v1/students/${student.id}/attendance`)
        .set("Authorization", `Bearer ${studentToken}`);

      expect(studentResponse.status).toBe(403);
      expect(studentResponse.body.error).toBeDefined();
    });
  });

  describe("GET /api/v1/students/:id/grades", () => {
    it("should get student grades (admin, teacher, and student)", async () => {
      const student = await createTestUser({
        email: "grades-student@example.com",
        role: ROLES.STUDENT,
      });

      // Test admin access
      const adminResponse = await request(app)
        .get(`/api/v1/students/${student.id}/grades`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(adminResponse.status).toBe(200);
      expect(adminResponse.body.success).toBe(true);
      expect(Array.isArray(adminResponse.body.data)).toBe(true);

      // Test teacher access
      const teacherResponse = await request(app)
        .get(`/api/v1/students/${student.id}/grades`)
        .set("Authorization", `Bearer ${teacherToken}`);

      expect(teacherResponse.status).toBe(200);
      expect(teacherResponse.body.success).toBe(true);
      expect(Array.isArray(teacherResponse.body.data)).toBe(true);

      // Test student access (own grades)
      const studentResponse = await request(app)
        .get(`/api/v1/students/${student.id}/grades`)
        .set("Authorization", `Bearer ${studentToken}`);

      expect(studentResponse.status).toBe(200);
      expect(studentResponse.body.success).toBe(true);
      expect(Array.isArray(studentResponse.body.data)).toBe(true);
    });

    it("should return 403 for student accessing other student grades", async () => {
      const otherStudent = await createTestUser({
        email: "other-student@example.com",
        role: ROLES.STUDENT,
      });

      const response = await request(app)
        .get(`/api/v1/students/${otherStudent.id}/grades`)
        .set("Authorization", `Bearer ${studentToken}`);

      expect(response.status).toBe(403);
      expect(response.body.error).toBeDefined();
    });
  });
});
