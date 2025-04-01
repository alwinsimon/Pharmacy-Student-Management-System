const request = require("supertest");
const app = require("../../src/app");
const { createTestUser, generateTestToken } = require("../utils/test.utils");
const { ROLES } = require("../../src/constants/roles.constants");
const { USER_STATUS } = require("../../src/constants/status.constants");

describe("Grade Management API", () => {
  let adminToken;
  let teacherToken;
  let studentToken;
  let adminUser;
  let teacherUser;
  let studentUser;
  let testCourse;
  let testAssignment;

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

    // Create a test assignment
    const assignmentData = {
      title: "Test Assignment",
      description: "Test assignment description",
      courseId: testCourse.id,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      maxScore: 100,
      type: "QUIZ",
    };

    const assignmentResponse = await request(app)
      .post("/api/v1/assignments")
      .set("Authorization", `Bearer ${adminToken}`)
      .send(assignmentData);

    testAssignment = assignmentResponse.body.data;
  });

  describe("GET /api/v1/grades", () => {
    it("should get all grades (admin and teacher only)", async () => {
      // Create a test grade
      const gradeData = {
        studentId: studentUser.id,
        courseId: testCourse.id,
        assignmentId: testAssignment.id,
        score: 85,
        feedback: "Good work!",
        gradedBy: teacherUser.id,
      };

      await request(app)
        .post("/api/v1/grades")
        .set("Authorization", `Bearer ${teacherToken}`)
        .send(gradeData);

      // Test admin access
      const adminResponse = await request(app)
        .get("/api/v1/grades")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(adminResponse.status).toBe(200);
      expect(adminResponse.body.success).toBe(true);
      expect(Array.isArray(adminResponse.body.data)).toBe(true);

      // Test teacher access
      const teacherResponse = await request(app)
        .get("/api/v1/grades")
        .set("Authorization", `Bearer ${teacherToken}`);

      expect(teacherResponse.status).toBe(200);
      expect(teacherResponse.body.success).toBe(true);
      expect(Array.isArray(teacherResponse.body.data)).toBe(true);

      // Test student access (should be denied)
      const studentResponse = await request(app)
        .get("/api/v1/grades")
        .set("Authorization", `Bearer ${studentToken}`);

      expect(studentResponse.status).toBe(403);
      expect(studentResponse.body.error).toBeDefined();
    });
  });

  describe("GET /api/v1/grades/:id", () => {
    it("should get grade by ID (admin, teacher, and student)", async () => {
      // Create a test grade
      const gradeData = {
        studentId: studentUser.id,
        courseId: testCourse.id,
        assignmentId: testAssignment.id,
        score: 85,
        feedback: "Good work!",
        gradedBy: teacherUser.id,
      };

      const createResponse = await request(app)
        .post("/api/v1/grades")
        .set("Authorization", `Bearer ${teacherToken}`)
        .send(gradeData);

      const gradeId = createResponse.body.data.id;

      // Test admin access
      const adminResponse = await request(app)
        .get(`/api/v1/grades/${gradeId}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(adminResponse.status).toBe(200);
      expect(adminResponse.body.success).toBe(true);
      expect(adminResponse.body.data.id).toBe(gradeId);

      // Test teacher access
      const teacherResponse = await request(app)
        .get(`/api/v1/grades/${gradeId}`)
        .set("Authorization", `Bearer ${teacherToken}`);

      expect(teacherResponse.status).toBe(200);
      expect(teacherResponse.body.success).toBe(true);
      expect(teacherResponse.body.data.id).toBe(gradeId);

      // Test student access (should only see their own grade)
      const studentResponse = await request(app)
        .get(`/api/v1/grades/${gradeId}`)
        .set("Authorization", `Bearer ${studentToken}`);

      expect(studentResponse.status).toBe(200);
      expect(studentResponse.body.success).toBe(true);
      expect(studentResponse.body.data.id).toBe(gradeId);
      expect(studentResponse.body.data.studentId).toBe(studentUser.id);
    });

    it("should return 404 for non-existent grade", async () => {
      const response = await request(app)
        .get("/api/v1/grades/507f1f77bcf86cd799439011")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
      expect(response.body.error).toBeDefined();
    });
  });

  describe("POST /api/v1/grades", () => {
    it("should create new grade (admin and teacher only)", async () => {
      const gradeData = {
        studentId: studentUser.id,
        courseId: testCourse.id,
        assignmentId: testAssignment.id,
        score: 85,
        feedback: "Good work!",
        rubric: {
          criteria: ["Criterion 1", "Criterion 2"],
          scores: [40, 45],
        },
      };

      // Test admin access
      const adminResponse = await request(app)
        .post("/api/v1/grades")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(gradeData);

      expect(adminResponse.status).toBe(201);
      expect(adminResponse.body.success).toBe(true);
      expect(adminResponse.body.data.score).toBe(gradeData.score);
      expect(adminResponse.body.data.feedback).toBe(gradeData.feedback);

      // Test teacher access
      const teacherResponse = await request(app)
        .post("/api/v1/grades")
        .set("Authorization", `Bearer ${teacherToken}`)
        .send({
          ...gradeData,
          score: 90,
          feedback: "Excellent work!",
        });

      expect(teacherResponse.status).toBe(201);
      expect(teacherResponse.body.success).toBe(true);
      expect(teacherResponse.body.data.score).toBe(90);
      expect(teacherResponse.body.data.feedback).toBe("Excellent work!");

      // Test student access (should be denied)
      const studentResponse = await request(app)
        .post("/api/v1/grades")
        .set("Authorization", `Bearer ${studentToken}`)
        .send(gradeData);

      expect(studentResponse.status).toBe(403);
      expect(studentResponse.body.error).toBeDefined();
    });

    it("should return 400 for invalid grade data", async () => {
      const invalidGradeData = {
        studentId: studentUser.id,
        courseId: testCourse.id,
        assignmentId: testAssignment.id,
        score: 150, // Invalid score above max
        feedback: "Good work!",
      };

      const response = await request(app)
        .post("/api/v1/grades")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(invalidGradeData);

      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
    });
  });

  describe("PUT /api/v1/grades/:id", () => {
    it("should update grade (admin and teacher only)", async () => {
      // Create a test grade
      const gradeData = {
        studentId: studentUser.id,
        courseId: testCourse.id,
        assignmentId: testAssignment.id,
        score: 85,
        feedback: "Good work!",
        gradedBy: teacherUser.id,
      };

      const createResponse = await request(app)
        .post("/api/v1/grades")
        .set("Authorization", `Bearer ${teacherToken}`)
        .send(gradeData);

      const gradeId = createResponse.body.data.id;

      const updateData = {
        score: 90,
        feedback: "Updated feedback",
        rubric: {
          criteria: ["Updated Criterion 1", "Updated Criterion 2"],
          scores: [45, 45],
        },
      };

      // Test admin access
      const adminResponse = await request(app)
        .put(`/api/v1/grades/${gradeId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send(updateData);

      expect(adminResponse.status).toBe(200);
      expect(adminResponse.body.success).toBe(true);
      expect(adminResponse.body.data.score).toBe(updateData.score);
      expect(adminResponse.body.data.feedback).toBe(updateData.feedback);

      // Test teacher access
      const teacherResponse = await request(app)
        .put(`/api/v1/grades/${gradeId}`)
        .set("Authorization", `Bearer ${teacherToken}`)
        .send({
          ...updateData,
          score: 95,
          feedback: "Teacher updated feedback",
        });

      expect(teacherResponse.status).toBe(200);
      expect(teacherResponse.body.success).toBe(true);
      expect(teacherResponse.body.data.score).toBe(95);
      expect(teacherResponse.body.data.feedback).toBe(
        "Teacher updated feedback"
      );

      // Test student access (should be denied)
      const studentResponse = await request(app)
        .put(`/api/v1/grades/${gradeId}`)
        .set("Authorization", `Bearer ${studentToken}`)
        .send(updateData);

      expect(studentResponse.status).toBe(403);
      expect(studentResponse.body.error).toBeDefined();
    });
  });

  describe("DELETE /api/v1/grades/:id", () => {
    it("should delete grade (admin and teacher only)", async () => {
      // Create a test grade
      const gradeData = {
        studentId: studentUser.id,
        courseId: testCourse.id,
        assignmentId: testAssignment.id,
        score: 85,
        feedback: "Good work!",
        gradedBy: teacherUser.id,
      };

      const createResponse = await request(app)
        .post("/api/v1/grades")
        .set("Authorization", `Bearer ${teacherToken}`)
        .send(gradeData);

      const gradeId = createResponse.body.data.id;

      // Test admin access
      const adminResponse = await request(app)
        .delete(`/api/v1/grades/${gradeId}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(adminResponse.status).toBe(200);
      expect(adminResponse.body.success).toBe(true);

      // Create another test grade for teacher test
      const createResponse2 = await request(app)
        .post("/api/v1/grades")
        .set("Authorization", `Bearer ${teacherToken}`)
        .send({
          ...gradeData,
          score: 90,
          feedback: "Teacher grade",
        });

      const gradeId2 = createResponse2.body.data.id;

      // Test teacher access
      const teacherResponse = await request(app)
        .delete(`/api/v1/grades/${gradeId2}`)
        .set("Authorization", `Bearer ${teacherToken}`);

      expect(teacherResponse.status).toBe(200);
      expect(teacherResponse.body.success).toBe(true);

      // Test student access (should be denied)
      const studentResponse = await request(app)
        .delete(`/api/v1/grades/${gradeId}`)
        .set("Authorization", `Bearer ${studentToken}`);

      expect(studentResponse.status).toBe(403);
      expect(studentResponse.body.error).toBeDefined();
    });
  });

  describe("GET /api/v1/grades/student/:studentId", () => {
    it("should get student grades (admin, teacher, and student)", async () => {
      // Create test grades
      const gradeData = {
        studentId: studentUser.id,
        courseId: testCourse.id,
        assignmentId: testAssignment.id,
        score: 85,
        feedback: "Good work!",
        gradedBy: teacherUser.id,
      };

      await request(app)
        .post("/api/v1/grades")
        .set("Authorization", `Bearer ${teacherToken}`)
        .send(gradeData);

      // Test admin access
      const adminResponse = await request(app)
        .get(`/api/v1/grades/student/${studentUser.id}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(adminResponse.status).toBe(200);
      expect(adminResponse.body.success).toBe(true);
      expect(Array.isArray(adminResponse.body.data)).toBe(true);

      // Test teacher access
      const teacherResponse = await request(app)
        .get(`/api/v1/grades/student/${studentUser.id}`)
        .set("Authorization", `Bearer ${teacherToken}`);

      expect(teacherResponse.status).toBe(200);
      expect(teacherResponse.body.success).toBe(true);
      expect(Array.isArray(teacherResponse.body.data)).toBe(true);

      // Test student access (should only see their own grades)
      const studentResponse = await request(app)
        .get(`/api/v1/grades/student/${studentUser.id}`)
        .set("Authorization", `Bearer ${studentToken}`);

      expect(studentResponse.status).toBe(200);
      expect(studentResponse.body.success).toBe(true);
      expect(Array.isArray(studentResponse.body.data)).toBe(true);
      expect(
        studentResponse.body.data.every(
          (grade) => grade.studentId === studentUser.id
        )
      ).toBe(true);
    });
  });

  describe("GET /api/v1/grades/course/:courseId", () => {
    it("should get course grades (admin and teacher only)", async () => {
      // Create test grades
      const gradeData = {
        studentId: studentUser.id,
        courseId: testCourse.id,
        assignmentId: testAssignment.id,
        score: 85,
        feedback: "Good work!",
        gradedBy: teacherUser.id,
      };

      await request(app)
        .post("/api/v1/grades")
        .set("Authorization", `Bearer ${teacherToken}`)
        .send(gradeData);

      // Test admin access
      const adminResponse = await request(app)
        .get(`/api/v1/grades/course/${testCourse.id}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(adminResponse.status).toBe(200);
      expect(adminResponse.body.success).toBe(true);
      expect(Array.isArray(adminResponse.body.data)).toBe(true);

      // Test teacher access
      const teacherResponse = await request(app)
        .get(`/api/v1/grades/course/${testCourse.id}`)
        .set("Authorization", `Bearer ${teacherToken}`);

      expect(teacherResponse.status).toBe(200);
      expect(teacherResponse.body.success).toBe(true);
      expect(Array.isArray(teacherResponse.body.data)).toBe(true);

      // Test student access (should be denied)
      const studentResponse = await request(app)
        .get(`/api/v1/grades/course/${testCourse.id}`)
        .set("Authorization", `Bearer ${studentToken}`);

      expect(studentResponse.status).toBe(403);
      expect(studentResponse.body.error).toBeDefined();
    });
  });
});
