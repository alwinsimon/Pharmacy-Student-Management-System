const request = require("supertest");
const app = require("../../src/app");
const { createTestUser, generateTestToken } = require("../utils/test.utils");
const { ROLES } = require("../../src/constants/roles.constants");
const { USER_STATUS } = require("../../src/constants/status.constants");

describe("Assignment Management API", () => {
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

  describe("GET /api/v1/assignments", () => {
    it("should get all assignments (all users)", async () => {
      // Create a test assignment
      const assignmentData = {
        title: "Test Assignment",
        description: "Test assignment description",
        courseId: testCourse.id,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        maxScore: 100,
        type: "QUIZ",
      };

      await request(app)
        .post("/api/v1/assignments")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(assignmentData);

      // Test admin access
      const adminResponse = await request(app)
        .get("/api/v1/assignments")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(adminResponse.status).toBe(200);
      expect(adminResponse.body.success).toBe(true);
      expect(Array.isArray(adminResponse.body.data)).toBe(true);

      // Test teacher access
      const teacherResponse = await request(app)
        .get("/api/v1/assignments")
        .set("Authorization", `Bearer ${teacherToken}`);

      expect(teacherResponse.status).toBe(200);
      expect(teacherResponse.body.success).toBe(true);
      expect(Array.isArray(teacherResponse.body.data)).toBe(true);

      // Test student access
      const studentResponse = await request(app)
        .get("/api/v1/assignments")
        .set("Authorization", `Bearer ${studentToken}`);

      expect(studentResponse.status).toBe(200);
      expect(studentResponse.body.success).toBe(true);
      expect(Array.isArray(studentResponse.body.data)).toBe(true);
    });
  });

  describe("GET /api/v1/assignments/:id", () => {
    it("should get assignment by ID (all users)", async () => {
      // Create a test assignment
      const assignmentData = {
        title: "Test Assignment",
        description: "Test assignment description",
        courseId: testCourse.id,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        maxScore: 100,
        type: "QUIZ",
      };

      const createResponse = await request(app)
        .post("/api/v1/assignments")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(assignmentData);

      const assignmentId = createResponse.body.data.id;

      // Test admin access
      const adminResponse = await request(app)
        .get(`/api/v1/assignments/${assignmentId}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(adminResponse.status).toBe(200);
      expect(adminResponse.body.success).toBe(true);
      expect(adminResponse.body.data.id).toBe(assignmentId);

      // Test teacher access
      const teacherResponse = await request(app)
        .get(`/api/v1/assignments/${assignmentId}`)
        .set("Authorization", `Bearer ${teacherToken}`);

      expect(teacherResponse.status).toBe(200);
      expect(teacherResponse.body.success).toBe(true);
      expect(teacherResponse.body.data.id).toBe(assignmentId);

      // Test student access
      const studentResponse = await request(app)
        .get(`/api/v1/assignments/${assignmentId}`)
        .set("Authorization", `Bearer ${studentToken}`);

      expect(studentResponse.status).toBe(200);
      expect(studentResponse.body.success).toBe(true);
      expect(studentResponse.body.data.id).toBe(assignmentId);
    });

    it("should return 404 for non-existent assignment", async () => {
      const response = await request(app)
        .get("/api/v1/assignments/507f1f77bcf86cd799439011")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
      expect(response.body.error).toBeDefined();
    });
  });

  describe("POST /api/v1/assignments", () => {
    it("should create new assignment (admin and teacher only)", async () => {
      const assignmentData = {
        title: "New Assignment",
        description: "New assignment description",
        courseId: testCourse.id,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        maxScore: 100,
        type: "QUIZ",
        instructions: "Assignment instructions",
        rubric: {
          criteria: ["Criterion 1", "Criterion 2"],
          points: [50, 50],
        },
      };

      // Test admin access
      const adminResponse = await request(app)
        .post("/api/v1/assignments")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(assignmentData);

      expect(adminResponse.status).toBe(201);
      expect(adminResponse.body.success).toBe(true);
      expect(adminResponse.body.data.title).toBe(assignmentData.title);
      expect(adminResponse.body.data.courseId).toBe(assignmentData.courseId);
      expect(adminResponse.body.data.maxScore).toBe(assignmentData.maxScore);

      // Test teacher access
      const teacherResponse = await request(app)
        .post("/api/v1/assignments")
        .set("Authorization", `Bearer ${teacherToken}`)
        .send({
          ...assignmentData,
          title: "Teacher Assignment",
        });

      expect(teacherResponse.status).toBe(201);
      expect(teacherResponse.body.success).toBe(true);
      expect(teacherResponse.body.data.title).toBe("Teacher Assignment");

      // Test student access (should be denied)
      const studentResponse = await request(app)
        .post("/api/v1/assignments")
        .set("Authorization", `Bearer ${studentToken}`)
        .send(assignmentData);

      expect(studentResponse.status).toBe(403);
      expect(studentResponse.body.error).toBeDefined();
    });

    it("should return 400 for invalid assignment data", async () => {
      const invalidAssignmentData = {
        title: "", // Invalid empty title
        courseId: testCourse.id,
        dueDate: new Date(Date.now() - 24 * 60 * 60 * 1000), // Invalid past date
        maxScore: -1, // Invalid negative score
      };

      const response = await request(app)
        .post("/api/v1/assignments")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(invalidAssignmentData);

      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
    });
  });

  describe("PUT /api/v1/assignments/:id", () => {
    it("should update assignment (admin and teacher only)", async () => {
      // Create a test assignment
      const assignmentData = {
        title: "Update Assignment",
        description: "Update assignment description",
        courseId: testCourse.id,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        maxScore: 100,
        type: "QUIZ",
      };

      const createResponse = await request(app)
        .post("/api/v1/assignments")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(assignmentData);

      const assignmentId = createResponse.body.data.id;

      const updateData = {
        title: "Updated Assignment",
        description: "Updated assignment description",
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        maxScore: 150,
        instructions: "Updated instructions",
      };

      // Test admin access
      const adminResponse = await request(app)
        .put(`/api/v1/assignments/${assignmentId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send(updateData);

      expect(adminResponse.status).toBe(200);
      expect(adminResponse.body.success).toBe(true);
      expect(adminResponse.body.data.title).toBe(updateData.title);
      expect(adminResponse.body.data.description).toBe(updateData.description);
      expect(adminResponse.body.data.maxScore).toBe(updateData.maxScore);

      // Test teacher access
      const teacherResponse = await request(app)
        .put(`/api/v1/assignments/${assignmentId}`)
        .set("Authorization", `Bearer ${teacherToken}`)
        .send({
          ...updateData,
          title: "Teacher Updated Assignment",
        });

      expect(teacherResponse.status).toBe(200);
      expect(teacherResponse.body.success).toBe(true);
      expect(teacherResponse.body.data.title).toBe(
        "Teacher Updated Assignment"
      );

      // Test student access (should be denied)
      const studentResponse = await request(app)
        .put(`/api/v1/assignments/${assignmentId}`)
        .set("Authorization", `Bearer ${studentToken}`)
        .send(updateData);

      expect(studentResponse.status).toBe(403);
      expect(studentResponse.body.error).toBeDefined();
    });
  });

  describe("DELETE /api/v1/assignments/:id", () => {
    it("should delete assignment (admin and teacher only)", async () => {
      // Create a test assignment
      const assignmentData = {
        title: "Delete Assignment",
        description: "Delete assignment description",
        courseId: testCourse.id,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        maxScore: 100,
        type: "QUIZ",
      };

      const createResponse = await request(app)
        .post("/api/v1/assignments")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(assignmentData);

      const assignmentId = createResponse.body.data.id;

      // Test admin access
      const adminResponse = await request(app)
        .delete(`/api/v1/assignments/${assignmentId}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(adminResponse.status).toBe(200);
      expect(adminResponse.body.success).toBe(true);

      // Create another test assignment for teacher test
      const createResponse2 = await request(app)
        .post("/api/v1/assignments")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          ...assignmentData,
          title: "Teacher Delete Assignment",
        });

      const assignmentId2 = createResponse2.body.data.id;

      // Test teacher access
      const teacherResponse = await request(app)
        .delete(`/api/v1/assignments/${assignmentId2}`)
        .set("Authorization", `Bearer ${teacherToken}`);

      expect(teacherResponse.status).toBe(200);
      expect(teacherResponse.body.success).toBe(true);

      // Test student access (should be denied)
      const studentResponse = await request(app)
        .delete(`/api/v1/assignments/${assignmentId}`)
        .set("Authorization", `Bearer ${studentToken}`);

      expect(studentResponse.status).toBe(403);
      expect(studentResponse.body.error).toBeDefined();
    });
  });

  describe("GET /api/v1/assignments/:id/submissions", () => {
    it("should get assignment submissions (admin and teacher only)", async () => {
      // Create a test assignment
      const assignmentData = {
        title: "Submissions Assignment",
        description: "Submissions assignment description",
        courseId: testCourse.id,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        maxScore: 100,
        type: "QUIZ",
      };

      const createResponse = await request(app)
        .post("/api/v1/assignments")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(assignmentData);

      const assignmentId = createResponse.body.data.id;

      // Test admin access
      const adminResponse = await request(app)
        .get(`/api/v1/assignments/${assignmentId}/submissions`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(adminResponse.status).toBe(200);
      expect(adminResponse.body.success).toBe(true);
      expect(Array.isArray(adminResponse.body.data)).toBe(true);

      // Test teacher access
      const teacherResponse = await request(app)
        .get(`/api/v1/assignments/${assignmentId}/submissions`)
        .set("Authorization", `Bearer ${teacherToken}`);

      expect(teacherResponse.status).toBe(200);
      expect(teacherResponse.body.success).toBe(true);
      expect(Array.isArray(teacherResponse.body.data)).toBe(true);

      // Test student access (should be denied)
      const studentResponse = await request(app)
        .get(`/api/v1/assignments/${assignmentId}/submissions`)
        .set("Authorization", `Bearer ${studentToken}`);

      expect(studentResponse.status).toBe(403);
      expect(studentResponse.body.error).toBeDefined();
    });
  });

  describe("POST /api/v1/assignments/:id/submit", () => {
    it("should submit assignment (student only)", async () => {
      // Create a test assignment
      const assignmentData = {
        title: "Submit Assignment",
        description: "Submit assignment description",
        courseId: testCourse.id,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        maxScore: 100,
        type: "QUIZ",
      };

      const createResponse = await request(app)
        .post("/api/v1/assignments")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(assignmentData);

      const assignmentId = createResponse.body.data.id;

      const submissionData = {
        answers: ["Answer 1", "Answer 2"],
        attachments: ["file1.pdf", "file2.pdf"],
      };

      // Test student access
      const studentResponse = await request(app)
        .post(`/api/v1/assignments/${assignmentId}/submit`)
        .set("Authorization", `Bearer ${studentToken}`)
        .send(submissionData);

      expect(studentResponse.status).toBe(200);
      expect(studentResponse.body.success).toBe(true);
      expect(studentResponse.body.data.answers).toEqual(submissionData.answers);
      expect(studentResponse.body.data.attachments).toEqual(
        submissionData.attachments
      );

      // Test admin access (should be denied)
      const adminResponse = await request(app)
        .post(`/api/v1/assignments/${assignmentId}/submit`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send(submissionData);

      expect(adminResponse.status).toBe(403);
      expect(adminResponse.body.error).toBeDefined();

      // Test teacher access (should be denied)
      const teacherResponse = await request(app)
        .post(`/api/v1/assignments/${assignmentId}/submit`)
        .set("Authorization", `Bearer ${teacherToken}`)
        .send(submissionData);

      expect(teacherResponse.status).toBe(403);
      expect(teacherResponse.body.error).toBeDefined();
    });
  });
});
