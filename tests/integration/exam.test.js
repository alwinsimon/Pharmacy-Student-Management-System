const request = require("supertest");
const app = require("../../src/app");
const { createTestUser, generateTestToken } = require("../utils/test.utils");
const { ROLES } = require("../../src/constants/roles.constants");
const { USER_STATUS } = require("../../src/constants/status.constants");

describe("Exam Management API", () => {
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

  describe("GET /api/v1/exams", () => {
    it("should get all exams (admin and teacher only)", async () => {
      // Create a test exam
      const examData = {
        title: "Test Exam",
        description: "Test exam description",
        courseId: testCourse.id,
        startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
        duration: 120,
        maxScore: 100,
        type: "FINAL",
        instructions: "Exam instructions",
      };

      await request(app)
        .post("/api/v1/exams")
        .set("Authorization", `Bearer ${teacherToken}`)
        .send(examData);

      // Test admin access
      const adminResponse = await request(app)
        .get("/api/v1/exams")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(adminResponse.status).toBe(200);
      expect(adminResponse.body.success).toBe(true);
      expect(Array.isArray(adminResponse.body.data)).toBe(true);

      // Test teacher access
      const teacherResponse = await request(app)
        .get("/api/v1/exams")
        .set("Authorization", `Bearer ${teacherToken}`);

      expect(teacherResponse.status).toBe(200);
      expect(teacherResponse.body.success).toBe(true);
      expect(Array.isArray(teacherResponse.body.data)).toBe(true);

      // Test student access (should be denied)
      const studentResponse = await request(app)
        .get("/api/v1/exams")
        .set("Authorization", `Bearer ${studentToken}`);

      expect(studentResponse.status).toBe(403);
      expect(studentResponse.body.error).toBeDefined();
    });
  });

  describe("GET /api/v1/exams/:id", () => {
    it("should get exam by ID (admin, teacher, and student)", async () => {
      // Create a test exam
      const examData = {
        title: "Test Exam",
        description: "Test exam description",
        courseId: testCourse.id,
        startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
        duration: 120,
        maxScore: 100,
        type: "FINAL",
        instructions: "Exam instructions",
      };

      const createResponse = await request(app)
        .post("/api/v1/exams")
        .set("Authorization", `Bearer ${teacherToken}`)
        .send(examData);

      const examId = createResponse.body.data.id;

      // Test admin access
      const adminResponse = await request(app)
        .get(`/api/v1/exams/${examId}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(adminResponse.status).toBe(200);
      expect(adminResponse.body.success).toBe(true);
      expect(adminResponse.body.data.id).toBe(examId);

      // Test teacher access
      const teacherResponse = await request(app)
        .get(`/api/v1/exams/${examId}`)
        .set("Authorization", `Bearer ${teacherToken}`);

      expect(teacherResponse.status).toBe(200);
      expect(teacherResponse.body.success).toBe(true);
      expect(teacherResponse.body.data.id).toBe(examId);

      // Test student access
      const studentResponse = await request(app)
        .get(`/api/v1/exams/${examId}`)
        .set("Authorization", `Bearer ${studentToken}`);

      expect(studentResponse.status).toBe(200);
      expect(studentResponse.body.success).toBe(true);
      expect(studentResponse.body.data.id).toBe(examId);
    });

    it("should return 404 for non-existent exam", async () => {
      const response = await request(app)
        .get("/api/v1/exams/507f1f77bcf86cd799439011")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
      expect(response.body.error).toBeDefined();
    });
  });

  describe("POST /api/v1/exams", () => {
    it("should create new exam (admin and teacher only)", async () => {
      const examData = {
        title: "New Exam",
        description: "New exam description",
        courseId: testCourse.id,
        startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
        duration: 120,
        maxScore: 100,
        type: "FINAL",
        instructions: "Exam instructions",
        questions: [
          {
            type: "MULTIPLE_CHOICE",
            question: "Test question 1",
            options: ["Option 1", "Option 2", "Option 3", "Option 4"],
            correctAnswer: 0,
            points: 20,
          },
        ],
      };

      // Test admin access
      const adminResponse = await request(app)
        .post("/api/v1/exams")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(examData);

      expect(adminResponse.status).toBe(201);
      expect(adminResponse.body.success).toBe(true);
      expect(adminResponse.body.data.title).toBe(examData.title);
      expect(adminResponse.body.data.courseId).toBe(examData.courseId);
      expect(adminResponse.body.data.maxScore).toBe(examData.maxScore);

      // Test teacher access
      const teacherResponse = await request(app)
        .post("/api/v1/exams")
        .set("Authorization", `Bearer ${teacherToken}`)
        .send({
          ...examData,
          title: "Teacher Exam",
        });

      expect(teacherResponse.status).toBe(201);
      expect(teacherResponse.body.success).toBe(true);
      expect(teacherResponse.body.data.title).toBe("Teacher Exam");

      // Test student access (should be denied)
      const studentResponse = await request(app)
        .post("/api/v1/exams")
        .set("Authorization", `Bearer ${studentToken}`)
        .send(examData);

      expect(studentResponse.status).toBe(403);
      expect(studentResponse.body.error).toBeDefined();
    });

    it("should return 400 for invalid exam data", async () => {
      const invalidExamData = {
        title: "", // Invalid empty title
        courseId: testCourse.id,
        startDate: new Date(Date.now() - 24 * 60 * 60 * 1000), // Invalid past date
        endDate: new Date(Date.now() - 23 * 60 * 60 * 1000), // Invalid past date
        duration: -1, // Invalid negative duration
        maxScore: -1, // Invalid negative score
      };

      const response = await request(app)
        .post("/api/v1/exams")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(invalidExamData);

      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
    });
  });

  describe("PUT /api/v1/exams/:id", () => {
    it("should update exam (admin and teacher only)", async () => {
      // Create a test exam
      const examData = {
        title: "Update Exam",
        description: "Update exam description",
        courseId: testCourse.id,
        startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
        duration: 120,
        maxScore: 100,
        type: "FINAL",
        instructions: "Exam instructions",
      };

      const createResponse = await request(app)
        .post("/api/v1/exams")
        .set("Authorization", `Bearer ${teacherToken}`)
        .send(examData);

      const examId = createResponse.body.data.id;

      const updateData = {
        title: "Updated Exam",
        description: "Updated exam description",
        startDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        duration: 180,
        maxScore: 150,
        instructions: "Updated instructions",
      };

      // Test admin access
      const adminResponse = await request(app)
        .put(`/api/v1/exams/${examId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send(updateData);

      expect(adminResponse.status).toBe(200);
      expect(adminResponse.body.success).toBe(true);
      expect(adminResponse.body.data.title).toBe(updateData.title);
      expect(adminResponse.body.data.description).toBe(updateData.description);
      expect(adminResponse.body.data.maxScore).toBe(updateData.maxScore);

      // Test teacher access
      const teacherResponse = await request(app)
        .put(`/api/v1/exams/${examId}`)
        .set("Authorization", `Bearer ${teacherToken}`)
        .send({
          ...updateData,
          title: "Teacher Updated Exam",
        });

      expect(teacherResponse.status).toBe(200);
      expect(teacherResponse.body.success).toBe(true);
      expect(teacherResponse.body.data.title).toBe("Teacher Updated Exam");

      // Test student access (should be denied)
      const studentResponse = await request(app)
        .put(`/api/v1/exams/${examId}`)
        .set("Authorization", `Bearer ${studentToken}`)
        .send(updateData);

      expect(studentResponse.status).toBe(403);
      expect(studentResponse.body.error).toBeDefined();
    });
  });

  describe("DELETE /api/v1/exams/:id", () => {
    it("should delete exam (admin and teacher only)", async () => {
      // Create a test exam
      const examData = {
        title: "Delete Exam",
        description: "Delete exam description",
        courseId: testCourse.id,
        startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
        duration: 120,
        maxScore: 100,
        type: "FINAL",
        instructions: "Exam instructions",
      };

      const createResponse = await request(app)
        .post("/api/v1/exams")
        .set("Authorization", `Bearer ${teacherToken}`)
        .send(examData);

      const examId = createResponse.body.data.id;

      // Test admin access
      const adminResponse = await request(app)
        .delete(`/api/v1/exams/${examId}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(adminResponse.status).toBe(200);
      expect(adminResponse.body.success).toBe(true);

      // Create another test exam for teacher test
      const createResponse2 = await request(app)
        .post("/api/v1/exams")
        .set("Authorization", `Bearer ${teacherToken}`)
        .send({
          ...examData,
          title: "Teacher Delete Exam",
        });

      const examId2 = createResponse2.body.data.id;

      // Test teacher access
      const teacherResponse = await request(app)
        .delete(`/api/v1/exams/${examId2}`)
        .set("Authorization", `Bearer ${teacherToken}`);

      expect(teacherResponse.status).toBe(200);
      expect(teacherResponse.body.success).toBe(true);

      // Test student access (should be denied)
      const studentResponse = await request(app)
        .delete(`/api/v1/exams/${examId}`)
        .set("Authorization", `Bearer ${studentToken}`);

      expect(studentResponse.status).toBe(403);
      expect(studentResponse.body.error).toBeDefined();
    });
  });

  describe("GET /api/v1/exams/course/:courseId", () => {
    it("should get course exams (admin, teacher, and student)", async () => {
      // Create test exams
      const examData = {
        title: "Course Exam",
        description: "Course exam description",
        courseId: testCourse.id,
        startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
        duration: 120,
        maxScore: 100,
        type: "FINAL",
        instructions: "Exam instructions",
      };

      await request(app)
        .post("/api/v1/exams")
        .set("Authorization", `Bearer ${teacherToken}`)
        .send(examData);

      // Test admin access
      const adminResponse = await request(app)
        .get(`/api/v1/exams/course/${testCourse.id}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(adminResponse.status).toBe(200);
      expect(adminResponse.body.success).toBe(true);
      expect(Array.isArray(adminResponse.body.data)).toBe(true);

      // Test teacher access
      const teacherResponse = await request(app)
        .get(`/api/v1/exams/course/${testCourse.id}`)
        .set("Authorization", `Bearer ${teacherToken}`);

      expect(teacherResponse.status).toBe(200);
      expect(teacherResponse.body.success).toBe(true);
      expect(Array.isArray(teacherResponse.body.data)).toBe(true);

      // Test student access
      const studentResponse = await request(app)
        .get(`/api/v1/exams/course/${testCourse.id}`)
        .set("Authorization", `Bearer ${studentToken}`);

      expect(studentResponse.status).toBe(200);
      expect(studentResponse.body.success).toBe(true);
      expect(Array.isArray(studentResponse.body.data)).toBe(true);
    });
  });

  describe("POST /api/v1/exams/:id/submit", () => {
    it("should submit exam (student only)", async () => {
      // Create a test exam
      const examData = {
        title: "Submit Exam",
        description: "Submit exam description",
        courseId: testCourse.id,
        startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
        duration: 120,
        maxScore: 100,
        type: "FINAL",
        instructions: "Exam instructions",
        questions: [
          {
            type: "MULTIPLE_CHOICE",
            question: "Test question 1",
            options: ["Option 1", "Option 2", "Option 3", "Option 4"],
            correctAnswer: 0,
            points: 20,
          },
        ],
      };

      const createResponse = await request(app)
        .post("/api/v1/exams")
        .set("Authorization", `Bearer ${teacherToken}`)
        .send(examData);

      const examId = createResponse.body.data.id;

      const submissionData = {
        answers: [
          {
            questionIndex: 0,
            answer: 0,
          },
        ],
        timeSpent: 60,
      };

      // Test student access
      const studentResponse = await request(app)
        .post(`/api/v1/exams/${examId}/submit`)
        .set("Authorization", `Bearer ${studentToken}`)
        .send(submissionData);

      expect(studentResponse.status).toBe(200);
      expect(studentResponse.body.success).toBe(true);
      expect(studentResponse.body.data.answers).toEqual(submissionData.answers);
      expect(studentResponse.body.data.timeSpent).toBe(
        submissionData.timeSpent
      );

      // Test admin access (should be denied)
      const adminResponse = await request(app)
        .post(`/api/v1/exams/${examId}/submit`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send(submissionData);

      expect(adminResponse.status).toBe(403);
      expect(adminResponse.body.error).toBeDefined();

      // Test teacher access (should be denied)
      const teacherResponse = await request(app)
        .post(`/api/v1/exams/${examId}/submit`)
        .set("Authorization", `Bearer ${teacherToken}`)
        .send(submissionData);

      expect(teacherResponse.status).toBe(403);
      expect(teacherResponse.body.error).toBeDefined();
    });
  });
});
