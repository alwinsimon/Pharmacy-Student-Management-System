const request = require("supertest");
const app = require("../../src/app");
const { createTestUser, generateTestToken } = require("../utils/test.utils");
const { ROLES } = require("../../src/constants/roles.constants");
const { USER_STATUS } = require("../../src/constants/status.constants");

describe("Course Management API", () => {
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

  describe("GET /api/v1/courses", () => {
    it("should get all courses (all users)", async () => {
      // Create some test courses
      const courseData = {
        name: "Test Course 1",
        code: "PHM101",
        description: "Test course description",
        credits: 3,
        department: "Pharmacy",
        semester: 1,
      };

      await request(app)
        .post("/api/v1/courses")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(courseData);

      // Test admin access
      const adminResponse = await request(app)
        .get("/api/v1/courses")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(adminResponse.status).toBe(200);
      expect(adminResponse.body.success).toBe(true);
      expect(Array.isArray(adminResponse.body.data)).toBe(true);

      // Test teacher access
      const teacherResponse = await request(app)
        .get("/api/v1/courses")
        .set("Authorization", `Bearer ${teacherToken}`);

      expect(teacherResponse.status).toBe(200);
      expect(teacherResponse.body.success).toBe(true);
      expect(Array.isArray(teacherResponse.body.data)).toBe(true);

      // Test student access
      const studentResponse = await request(app)
        .get("/api/v1/courses")
        .set("Authorization", `Bearer ${studentToken}`);

      expect(studentResponse.status).toBe(200);
      expect(studentResponse.body.success).toBe(true);
      expect(Array.isArray(studentResponse.body.data)).toBe(true);
    });
  });

  describe("GET /api/v1/courses/:id", () => {
    it("should get course by ID (all users)", async () => {
      // Create a test course
      const courseData = {
        name: "Test Course",
        code: "PHM102",
        description: "Test course description",
        credits: 3,
        department: "Pharmacy",
        semester: 1,
      };

      const createResponse = await request(app)
        .post("/api/v1/courses")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(courseData);

      const courseId = createResponse.body.data.id;

      // Test admin access
      const adminResponse = await request(app)
        .get(`/api/v1/courses/${courseId}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(adminResponse.status).toBe(200);
      expect(adminResponse.body.success).toBe(true);
      expect(adminResponse.body.data.id).toBe(courseId);

      // Test teacher access
      const teacherResponse = await request(app)
        .get(`/api/v1/courses/${courseId}`)
        .set("Authorization", `Bearer ${teacherToken}`);

      expect(teacherResponse.status).toBe(200);
      expect(teacherResponse.body.success).toBe(true);
      expect(teacherResponse.body.data.id).toBe(courseId);

      // Test student access
      const studentResponse = await request(app)
        .get(`/api/v1/courses/${courseId}`)
        .set("Authorization", `Bearer ${studentToken}`);

      expect(studentResponse.status).toBe(200);
      expect(studentResponse.body.success).toBe(true);
      expect(studentResponse.body.data.id).toBe(courseId);
    });

    it("should return 404 for non-existent course", async () => {
      const response = await request(app)
        .get("/api/v1/courses/507f1f77bcf86cd799439011")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
      expect(response.body.error).toBeDefined();
    });
  });

  describe("POST /api/v1/courses", () => {
    it("should create new course (admin only)", async () => {
      const courseData = {
        name: "New Course",
        code: "PHM103",
        description: "New course description",
        credits: 4,
        department: "Pharmacy",
        semester: 2,
        prerequisites: ["PHM101"],
        objectives: ["Objective 1", "Objective 2"],
        topics: ["Topic 1", "Topic 2"],
      };

      const response = await request(app)
        .post("/api/v1/courses")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(courseData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(courseData.name);
      expect(response.body.data.code).toBe(courseData.code);
      expect(response.body.data.credits).toBe(courseData.credits);
      expect(response.body.data.department).toBe(courseData.department);
    });

    it("should return 403 for non-admin users", async () => {
      const courseData = {
        name: "Unauthorized Course",
        code: "PHM104",
        description: "Unauthorized course description",
        credits: 3,
        department: "Pharmacy",
      };

      // Test teacher access
      const teacherResponse = await request(app)
        .post("/api/v1/courses")
        .set("Authorization", `Bearer ${teacherToken}`)
        .send(courseData);

      expect(teacherResponse.status).toBe(403);
      expect(teacherResponse.body.error).toBeDefined();

      // Test student access
      const studentResponse = await request(app)
        .post("/api/v1/courses")
        .set("Authorization", `Bearer ${studentToken}`)
        .send(courseData);

      expect(studentResponse.status).toBe(403);
      expect(studentResponse.body.error).toBeDefined();
    });

    it("should return 400 for invalid course data", async () => {
      const invalidCourseData = {
        name: "", // Invalid empty name
        code: "PHM105",
        credits: -1, // Invalid negative credits
        department: "Pharmacy",
      };

      const response = await request(app)
        .post("/api/v1/courses")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(invalidCourseData);

      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
    });
  });

  describe("PUT /api/v1/courses/:id", () => {
    it("should update course (admin only)", async () => {
      // Create a test course
      const courseData = {
        name: "Update Course",
        code: "PHM106",
        description: "Update course description",
        credits: 3,
        department: "Pharmacy",
        semester: 1,
      };

      const createResponse = await request(app)
        .post("/api/v1/courses")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(courseData);

      const courseId = createResponse.body.data.id;

      const updateData = {
        name: "Updated Course",
        description: "Updated course description",
        credits: 4,
        semester: 2,
        prerequisites: ["PHM101", "PHM102"],
      };

      const response = await request(app)
        .put(`/api/v1/courses/${courseId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(updateData.name);
      expect(response.body.data.description).toBe(updateData.description);
      expect(response.body.data.credits).toBe(updateData.credits);
      expect(response.body.data.semester).toBe(updateData.semester);
      expect(response.body.data.prerequisites).toEqual(
        updateData.prerequisites
      );
    });

    it("should return 403 for non-admin users", async () => {
      // Create a test course
      const courseData = {
        name: "Unauthorized Update Course",
        code: "PHM107",
        description: "Unauthorized update course description",
        credits: 3,
        department: "Pharmacy",
      };

      const createResponse = await request(app)
        .post("/api/v1/courses")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(courseData);

      const courseId = createResponse.body.data.id;

      const updateData = {
        name: "Updated Course",
        description: "Updated description",
      };

      // Test teacher access
      const teacherResponse = await request(app)
        .put(`/api/v1/courses/${courseId}`)
        .set("Authorization", `Bearer ${teacherToken}`)
        .send(updateData);

      expect(teacherResponse.status).toBe(403);
      expect(teacherResponse.body.error).toBeDefined();

      // Test student access
      const studentResponse = await request(app)
        .put(`/api/v1/courses/${courseId}`)
        .set("Authorization", `Bearer ${studentToken}`)
        .send(updateData);

      expect(studentResponse.status).toBe(403);
      expect(studentResponse.body.error).toBeDefined();
    });
  });

  describe("DELETE /api/v1/courses/:id", () => {
    it("should delete course (admin only)", async () => {
      // Create a test course
      const courseData = {
        name: "Delete Course",
        code: "PHM108",
        description: "Delete course description",
        credits: 3,
        department: "Pharmacy",
      };

      const createResponse = await request(app)
        .post("/api/v1/courses")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(courseData);

      const courseId = createResponse.body.data.id;

      const response = await request(app)
        .delete(`/api/v1/courses/${courseId}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      // Verify course is deleted
      const getResponse = await request(app)
        .get(`/api/v1/courses/${courseId}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(getResponse.status).toBe(404);
    });

    it("should return 403 for non-admin users", async () => {
      // Create a test course
      const courseData = {
        name: "Unauthorized Delete Course",
        code: "PHM109",
        description: "Unauthorized delete course description",
        credits: 3,
        department: "Pharmacy",
      };

      const createResponse = await request(app)
        .post("/api/v1/courses")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(courseData);

      const courseId = createResponse.body.data.id;

      // Test teacher access
      const teacherResponse = await request(app)
        .delete(`/api/v1/courses/${courseId}`)
        .set("Authorization", `Bearer ${teacherToken}`);

      expect(teacherResponse.status).toBe(403);
      expect(teacherResponse.body.error).toBeDefined();

      // Test student access
      const studentResponse = await request(app)
        .delete(`/api/v1/courses/${courseId}`)
        .set("Authorization", `Bearer ${studentToken}`);

      expect(studentResponse.status).toBe(403);
      expect(studentResponse.body.error).toBeDefined();
    });
  });

  describe("GET /api/v1/courses/:id/students", () => {
    it("should get course students (admin and teacher only)", async () => {
      // Create a test course
      const courseData = {
        name: "Students Course",
        code: "PHM110",
        description: "Students course description",
        credits: 3,
        department: "Pharmacy",
      };

      const createResponse = await request(app)
        .post("/api/v1/courses")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(courseData);

      const courseId = createResponse.body.data.id;

      // Create some test students
      await createTestUser({
        email: "course-student1@example.com",
        role: ROLES.STUDENT,
      });
      await createTestUser({
        email: "course-student2@example.com",
        role: ROLES.STUDENT,
      });

      // Test admin access
      const adminResponse = await request(app)
        .get(`/api/v1/courses/${courseId}/students`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(adminResponse.status).toBe(200);
      expect(adminResponse.body.success).toBe(true);
      expect(Array.isArray(adminResponse.body.data)).toBe(true);

      // Test teacher access
      const teacherResponse = await request(app)
        .get(`/api/v1/courses/${courseId}/students`)
        .set("Authorization", `Bearer ${teacherToken}`);

      expect(teacherResponse.status).toBe(200);
      expect(teacherResponse.body.success).toBe(true);
      expect(Array.isArray(teacherResponse.body.data)).toBe(true);

      // Test student access (should be denied)
      const studentResponse = await request(app)
        .get(`/api/v1/courses/${courseId}/students`)
        .set("Authorization", `Bearer ${studentToken}`);

      expect(studentResponse.status).toBe(403);
      expect(studentResponse.body.error).toBeDefined();
    });
  });

  describe("GET /api/v1/courses/:id/assignments", () => {
    it("should get course assignments (all users)", async () => {
      // Create a test course
      const courseData = {
        name: "Assignments Course",
        code: "PHM111",
        description: "Assignments course description",
        credits: 3,
        department: "Pharmacy",
      };

      const createResponse = await request(app)
        .post("/api/v1/courses")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(courseData);

      const courseId = createResponse.body.data.id;

      // Test admin access
      const adminResponse = await request(app)
        .get(`/api/v1/courses/${courseId}/assignments`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(adminResponse.status).toBe(200);
      expect(adminResponse.body.success).toBe(true);
      expect(Array.isArray(adminResponse.body.data)).toBe(true);

      // Test teacher access
      const teacherResponse = await request(app)
        .get(`/api/v1/courses/${courseId}/assignments`)
        .set("Authorization", `Bearer ${teacherToken}`);

      expect(teacherResponse.status).toBe(200);
      expect(teacherResponse.body.success).toBe(true);
      expect(Array.isArray(teacherResponse.body.data)).toBe(true);

      // Test student access
      const studentResponse = await request(app)
        .get(`/api/v1/courses/${courseId}/assignments`)
        .set("Authorization", `Bearer ${studentToken}`);

      expect(studentResponse.status).toBe(200);
      expect(studentResponse.body.success).toBe(true);
      expect(Array.isArray(studentResponse.body.data)).toBe(true);
    });
  });
});
