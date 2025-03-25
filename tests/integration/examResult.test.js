const request = require("supertest");
const app = require("../../src/app");
const { createTestUser, generateTestToken } = require("../utils/test.utils");
const { ROLES } = require("../../src/constants/roles.constants");
const { USER_STATUS } = require("../../src/constants/status.constants");

describe("Exam Result Management API", () => {
  let adminToken;
  let teacherToken;
  let studentToken;
  let adminUser;
  let teacherUser;
  let studentUser;
  let testCourse;
  let testExam;

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

    const examResponse = await request(app)
      .post("/api/v1/exams")
      .set("Authorization", `Bearer ${teacherToken}`)
      .send(examData);

    testExam = examResponse.body.data;
  });

  describe("GET /api/v1/exam-results", () => {
    it("should get all exam results (admin and teacher only)", async () => {
      // Create a test exam result
      const resultData = {
        examId: testExam.id,
        studentId: studentUser.id,
        score: 80,
        answers: [
          {
            questionIndex: 0,
            answer: 0,
            isCorrect: true,
          },
        ],
        timeSpent: 60,
        submittedAt: new Date(),
      };

      await request(app)
        .post("/api/v1/exam-results")
        .set("Authorization", `Bearer ${teacherToken}`)
        .send(resultData);

      // Test admin access
      const adminResponse = await request(app)
        .get("/api/v1/exam-results")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(adminResponse.status).toBe(200);
      expect(adminResponse.body.success).toBe(true);
      expect(Array.isArray(adminResponse.body.data)).toBe(true);

      // Test teacher access
      const teacherResponse = await request(app)
        .get("/api/v1/exam-results")
        .set("Authorization", `Bearer ${teacherToken}`);

      expect(teacherResponse.status).toBe(200);
      expect(teacherResponse.body.success).toBe(true);
      expect(Array.isArray(teacherResponse.body.data)).toBe(true);

      // Test student access (should be denied)
      const studentResponse = await request(app)
        .get("/api/v1/exam-results")
        .set("Authorization", `Bearer ${studentToken}`);

      expect(studentResponse.status).toBe(403);
      expect(studentResponse.body.error).toBeDefined();
    });
  });

  describe("GET /api/v1/exam-results/:id", () => {
    it("should get exam result by ID (admin, teacher, and student)", async () => {
      // Create a test exam result
      const resultData = {
        examId: testExam.id,
        studentId: studentUser.id,
        score: 80,
        answers: [
          {
            questionIndex: 0,
            answer: 0,
            isCorrect: true,
          },
        ],
        timeSpent: 60,
        submittedAt: new Date(),
      };

      const createResponse = await request(app)
        .post("/api/v1/exam-results")
        .set("Authorization", `Bearer ${teacherToken}`)
        .send(resultData);

      const resultId = createResponse.body.data.id;

      // Test admin access
      const adminResponse = await request(app)
        .get(`/api/v1/exam-results/${resultId}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(adminResponse.status).toBe(200);
      expect(adminResponse.body.success).toBe(true);
      expect(adminResponse.body.data.id).toBe(resultId);

      // Test teacher access
      const teacherResponse = await request(app)
        .get(`/api/v1/exam-results/${resultId}`)
        .set("Authorization", `Bearer ${teacherToken}`);

      expect(teacherResponse.status).toBe(200);
      expect(teacherResponse.body.success).toBe(true);
      expect(teacherResponse.body.data.id).toBe(resultId);

      // Test student access (own result)
      const studentResponse = await request(app)
        .get(`/api/v1/exam-results/${resultId}`)
        .set("Authorization", `Bearer ${studentToken}`);

      expect(studentResponse.status).toBe(200);
      expect(studentResponse.body.success).toBe(true);
      expect(studentResponse.body.data.id).toBe(resultId);
    });

    it("should return 404 for non-existent exam result", async () => {
      const response = await request(app)
        .get("/api/v1/exam-results/507f1f77bcf86cd799439011")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
      expect(response.body.error).toBeDefined();
    });
  });

  describe("POST /api/v1/exam-results", () => {
    it("should create new exam result (admin and teacher only)", async () => {
      const resultData = {
        examId: testExam.id,
        studentId: studentUser.id,
        score: 80,
        answers: [
          {
            questionIndex: 0,
            answer: 0,
            isCorrect: true,
          },
        ],
        timeSpent: 60,
        submittedAt: new Date(),
        feedback: "Good performance",
      };

      // Test admin access
      const adminResponse = await request(app)
        .post("/api/v1/exam-results")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(resultData);

      expect(adminResponse.status).toBe(201);
      expect(adminResponse.body.success).toBe(true);
      expect(adminResponse.body.data.score).toBe(resultData.score);
      expect(adminResponse.body.data.examId).toBe(resultData.examId);
      expect(adminResponse.body.data.studentId).toBe(resultData.studentId);

      // Test teacher access
      const teacherResponse = await request(app)
        .post("/api/v1/exam-results")
        .set("Authorization", `Bearer ${teacherToken}`)
        .send({
          ...resultData,
          score: 85,
          feedback: "Excellent work",
        });

      expect(teacherResponse.status).toBe(201);
      expect(teacherResponse.body.success).toBe(true);
      expect(teacherResponse.body.data.score).toBe(85);
      expect(teacherResponse.body.data.feedback).toBe("Excellent work");

      // Test student access (should be denied)
      const studentResponse = await request(app)
        .post("/api/v1/exam-results")
        .set("Authorization", `Bearer ${studentToken}`)
        .send(resultData);

      expect(studentResponse.status).toBe(403);
      expect(studentResponse.body.error).toBeDefined();
    });

    it("should return 400 for invalid exam result data", async () => {
      const invalidResultData = {
        examId: testExam.id,
        studentId: studentUser.id,
        score: -1, // Invalid negative score
        answers: [], // Invalid empty answers
        timeSpent: -1, // Invalid negative time
      };

      const response = await request(app)
        .post("/api/v1/exam-results")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(invalidResultData);

      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
    });
  });

  describe("PUT /api/v1/exam-results/:id", () => {
    it("should update exam result (admin and teacher only)", async () => {
      // Create a test exam result
      const resultData = {
        examId: testExam.id,
        studentId: studentUser.id,
        score: 80,
        answers: [
          {
            questionIndex: 0,
            answer: 0,
            isCorrect: true,
          },
        ],
        timeSpent: 60,
        submittedAt: new Date(),
      };

      const createResponse = await request(app)
        .post("/api/v1/exam-results")
        .set("Authorization", `Bearer ${teacherToken}`)
        .send(resultData);

      const resultId = createResponse.body.data.id;

      const updateData = {
        score: 85,
        feedback: "Updated feedback",
        answers: [
          {
            questionIndex: 0,
            answer: 0,
            isCorrect: true,
            points: 20,
          },
        ],
      };

      // Test admin access
      const adminResponse = await request(app)
        .put(`/api/v1/exam-results/${resultId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send(updateData);

      expect(adminResponse.status).toBe(200);
      expect(adminResponse.body.success).toBe(true);
      expect(adminResponse.body.data.score).toBe(updateData.score);
      expect(adminResponse.body.data.feedback).toBe(updateData.feedback);

      // Test teacher access
      const teacherResponse = await request(app)
        .put(`/api/v1/exam-results/${resultId}`)
        .set("Authorization", `Bearer ${teacherToken}`)
        .send({
          ...updateData,
          score: 90,
          feedback: "Teacher updated feedback",
        });

      expect(teacherResponse.status).toBe(200);
      expect(teacherResponse.body.success).toBe(true);
      expect(teacherResponse.body.data.score).toBe(90);
      expect(teacherResponse.body.data.feedback).toBe(
        "Teacher updated feedback"
      );

      // Test student access (should be denied)
      const studentResponse = await request(app)
        .put(`/api/v1/exam-results/${resultId}`)
        .set("Authorization", `Bearer ${studentToken}`)
        .send(updateData);

      expect(studentResponse.status).toBe(403);
      expect(studentResponse.body.error).toBeDefined();
    });
  });

  describe("DELETE /api/v1/exam-results/:id", () => {
    it("should delete exam result (admin and teacher only)", async () => {
      // Create a test exam result
      const resultData = {
        examId: testExam.id,
        studentId: studentUser.id,
        score: 80,
        answers: [
          {
            questionIndex: 0,
            answer: 0,
            isCorrect: true,
          },
        ],
        timeSpent: 60,
        submittedAt: new Date(),
      };

      const createResponse = await request(app)
        .post("/api/v1/exam-results")
        .set("Authorization", `Bearer ${teacherToken}`)
        .send(resultData);

      const resultId = createResponse.body.data.id;

      // Test admin access
      const adminResponse = await request(app)
        .delete(`/api/v1/exam-results/${resultId}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(adminResponse.status).toBe(200);
      expect(adminResponse.body.success).toBe(true);

      // Create another test exam result for teacher test
      const createResponse2 = await request(app)
        .post("/api/v1/exam-results")
        .set("Authorization", `Bearer ${teacherToken}`)
        .send(resultData);

      const resultId2 = createResponse2.body.data.id;

      // Test teacher access
      const teacherResponse = await request(app)
        .delete(`/api/v1/exam-results/${resultId2}`)
        .set("Authorization", `Bearer ${teacherToken}`);

      expect(teacherResponse.status).toBe(200);
      expect(teacherResponse.body.success).toBe(true);

      // Test student access (should be denied)
      const studentResponse = await request(app)
        .delete(`/api/v1/exam-results/${resultId}`)
        .set("Authorization", `Bearer ${studentToken}`);

      expect(studentResponse.status).toBe(403);
      expect(studentResponse.body.error).toBeDefined();
    });
  });

  describe("GET /api/v1/exam-results/student/:studentId", () => {
    it("should get student exam results (admin, teacher, and student)", async () => {
      // Create test exam results
      const resultData = {
        examId: testExam.id,
        studentId: studentUser.id,
        score: 80,
        answers: [
          {
            questionIndex: 0,
            answer: 0,
            isCorrect: true,
          },
        ],
        timeSpent: 60,
        submittedAt: new Date(),
      };

      await request(app)
        .post("/api/v1/exam-results")
        .set("Authorization", `Bearer ${teacherToken}`)
        .send(resultData);

      // Test admin access
      const adminResponse = await request(app)
        .get(`/api/v1/exam-results/student/${studentUser.id}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(adminResponse.status).toBe(200);
      expect(adminResponse.body.success).toBe(true);
      expect(Array.isArray(adminResponse.body.data)).toBe(true);

      // Test teacher access
      const teacherResponse = await request(app)
        .get(`/api/v1/exam-results/student/${studentUser.id}`)
        .set("Authorization", `Bearer ${teacherToken}`);

      expect(teacherResponse.status).toBe(200);
      expect(teacherResponse.body.success).toBe(true);
      expect(Array.isArray(teacherResponse.body.data)).toBe(true);

      // Test student access (own results)
      const studentResponse = await request(app)
        .get(`/api/v1/exam-results/student/${studentUser.id}`)
        .set("Authorization", `Bearer ${studentToken}`);

      expect(studentResponse.status).toBe(200);
      expect(studentResponse.body.success).toBe(true);
      expect(Array.isArray(studentResponse.body.data)).toBe(true);

      // Test student access (other student's results - should be denied)
      const otherStudentResponse = await request(app)
        .get(`/api/v1/exam-results/student/${adminUser.id}`)
        .set("Authorization", `Bearer ${studentToken}`);

      expect(otherStudentResponse.status).toBe(403);
      expect(otherStudentResponse.body.error).toBeDefined();
    });
  });

  describe("GET /api/v1/exam-results/exam/:examId", () => {
    it("should get exam results by exam ID (admin and teacher only)", async () => {
      // Create test exam results
      const resultData = {
        examId: testExam.id,
        studentId: studentUser.id,
        score: 80,
        answers: [
          {
            questionIndex: 0,
            answer: 0,
            isCorrect: true,
          },
        ],
        timeSpent: 60,
        submittedAt: new Date(),
      };

      await request(app)
        .post("/api/v1/exam-results")
        .set("Authorization", `Bearer ${teacherToken}`)
        .send(resultData);

      // Test admin access
      const adminResponse = await request(app)
        .get(`/api/v1/exam-results/exam/${testExam.id}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(adminResponse.status).toBe(200);
      expect(adminResponse.body.success).toBe(true);
      expect(Array.isArray(adminResponse.body.data)).toBe(true);

      // Test teacher access
      const teacherResponse = await request(app)
        .get(`/api/v1/exam-results/exam/${testExam.id}`)
        .set("Authorization", `Bearer ${teacherToken}`);

      expect(teacherResponse.status).toBe(200);
      expect(teacherResponse.body.success).toBe(true);
      expect(Array.isArray(teacherResponse.body.data)).toBe(true);

      // Test student access (should be denied)
      const studentResponse = await request(app)
        .get(`/api/v1/exam-results/exam/${testExam.id}`)
        .set("Authorization", `Bearer ${studentToken}`);

      expect(studentResponse.status).toBe(403);
      expect(studentResponse.body.error).toBeDefined();
    });
  });
});
