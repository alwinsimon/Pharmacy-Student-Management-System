const request = require("supertest");
const app = require("../../src/app");
const { createTestUser, generateTestToken } = require("../utils/test.utils");
const { ROLES } = require("../../src/constants/roles.constants");
const { USER_STATUS } = require("../../src/constants/status.constants");

describe("Report Management API", () => {
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

  describe("GET /api/v1/reports", () => {
    it("should get all reports (admin and teacher only)", async () => {
      // Create a test report
      const reportData = {
        title: "Test Report",
        description: "Test report description",
        type: "ACADEMIC",
        courseId: testCourse.id,
        data: {
          attendance: 85,
          grades: 78,
          participation: 90,
        },
        generatedBy: adminUser.id,
      };

      await request(app)
        .post("/api/v1/reports")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(reportData);

      // Test admin access
      const adminResponse = await request(app)
        .get("/api/v1/reports")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(adminResponse.status).toBe(200);
      expect(adminResponse.body.success).toBe(true);
      expect(Array.isArray(adminResponse.body.data)).toBe(true);

      // Test teacher access
      const teacherResponse = await request(app)
        .get("/api/v1/reports")
        .set("Authorization", `Bearer ${teacherToken}`);

      expect(teacherResponse.status).toBe(200);
      expect(teacherResponse.body.success).toBe(true);
      expect(Array.isArray(teacherResponse.body.data)).toBe(true);

      // Test student access (should be denied)
      const studentResponse = await request(app)
        .get("/api/v1/reports")
        .set("Authorization", `Bearer ${studentToken}`);

      expect(studentResponse.status).toBe(403);
      expect(studentResponse.body.error).toBeDefined();
    });
  });

  describe("GET /api/v1/reports/:id", () => {
    it("should get report by ID (admin, teacher, and student)", async () => {
      // Create a test report
      const reportData = {
        title: "Test Report",
        description: "Test report description",
        type: "ACADEMIC",
        courseId: testCourse.id,
        data: {
          attendance: 85,
          grades: 78,
          participation: 90,
        },
        generatedBy: adminUser.id,
      };

      const createResponse = await request(app)
        .post("/api/v1/reports")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(reportData);

      const reportId = createResponse.body.data.id;

      // Test admin access
      const adminResponse = await request(app)
        .get(`/api/v1/reports/${reportId}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(adminResponse.status).toBe(200);
      expect(adminResponse.body.success).toBe(true);
      expect(adminResponse.body.data.id).toBe(reportId);

      // Test teacher access
      const teacherResponse = await request(app)
        .get(`/api/v1/reports/${reportId}`)
        .set("Authorization", `Bearer ${teacherToken}`);

      expect(teacherResponse.status).toBe(200);
      expect(teacherResponse.body.success).toBe(true);
      expect(teacherResponse.body.data.id).toBe(reportId);

      // Test student access
      const studentResponse = await request(app)
        .get(`/api/v1/reports/${reportId}`)
        .set("Authorization", `Bearer ${studentToken}`);

      expect(studentResponse.status).toBe(200);
      expect(studentResponse.body.success).toBe(true);
      expect(studentResponse.body.data.id).toBe(reportId);
    });

    it("should return 404 for non-existent report", async () => {
      const response = await request(app)
        .get("/api/v1/reports/507f1f77bcf86cd799439011")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
      expect(response.body.error).toBeDefined();
    });
  });

  describe("POST /api/v1/reports", () => {
    it("should create new report (admin and teacher only)", async () => {
      const reportData = {
        title: "New Report",
        description: "New report description",
        type: "ACADEMIC",
        courseId: testCourse.id,
        data: {
          attendance: 85,
          grades: 78,
          participation: 90,
        },
        generatedBy: adminUser.id,
        metadata: {
          semester: "2024-1",
          academicYear: "2024",
        },
      };

      // Test admin access
      const adminResponse = await request(app)
        .post("/api/v1/reports")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(reportData);

      expect(adminResponse.status).toBe(201);
      expect(adminResponse.body.success).toBe(true);
      expect(adminResponse.body.data.title).toBe(reportData.title);
      expect(adminResponse.body.data.courseId).toBe(reportData.courseId);
      expect(adminResponse.body.data.type).toBe(reportData.type);

      // Test teacher access
      const teacherResponse = await request(app)
        .post("/api/v1/reports")
        .set("Authorization", `Bearer ${teacherToken}`)
        .send({
          ...reportData,
          title: "Teacher Report",
          generatedBy: teacherUser.id,
        });

      expect(teacherResponse.status).toBe(201);
      expect(teacherResponse.body.success).toBe(true);
      expect(teacherResponse.body.data.title).toBe("Teacher Report");
      expect(teacherResponse.body.data.generatedBy).toBe(teacherUser.id);

      // Test student access (should be denied)
      const studentResponse = await request(app)
        .post("/api/v1/reports")
        .set("Authorization", `Bearer ${studentToken}`)
        .send(reportData);

      expect(studentResponse.status).toBe(403);
      expect(studentResponse.body.error).toBeDefined();
    });

    it("should return 400 for invalid report data", async () => {
      const invalidReportData = {
        title: "", // Invalid empty title
        type: "INVALID_TYPE", // Invalid type
        courseId: testCourse.id,
        data: {}, // Invalid empty data
      };

      const response = await request(app)
        .post("/api/v1/reports")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(invalidReportData);

      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
    });
  });

  describe("PUT /api/v1/reports/:id", () => {
    it("should update report (admin and teacher only)", async () => {
      // Create a test report
      const reportData = {
        title: "Update Report",
        description: "Update report description",
        type: "ACADEMIC",
        courseId: testCourse.id,
        data: {
          attendance: 85,
          grades: 78,
          participation: 90,
        },
        generatedBy: adminUser.id,
      };

      const createResponse = await request(app)
        .post("/api/v1/reports")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(reportData);

      const reportId = createResponse.body.data.id;

      const updateData = {
        title: "Updated Report",
        description: "Updated report description",
        type: "PERFORMANCE",
        data: {
          attendance: 90,
          grades: 85,
          participation: 95,
        },
        metadata: {
          semester: "2024-2",
          academicYear: "2024",
        },
      };

      // Test admin access
      const adminResponse = await request(app)
        .put(`/api/v1/reports/${reportId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send(updateData);

      expect(adminResponse.status).toBe(200);
      expect(adminResponse.body.success).toBe(true);
      expect(adminResponse.body.data.title).toBe(updateData.title);
      expect(adminResponse.body.data.type).toBe(updateData.type);
      expect(adminResponse.body.data.data).toEqual(updateData.data);

      // Test teacher access
      const teacherResponse = await request(app)
        .put(`/api/v1/reports/${reportId}`)
        .set("Authorization", `Bearer ${teacherToken}`)
        .send({
          ...updateData,
          title: "Teacher Updated Report",
        });

      expect(teacherResponse.status).toBe(200);
      expect(teacherResponse.body.success).toBe(true);
      expect(teacherResponse.body.data.title).toBe("Teacher Updated Report");

      // Test student access (should be denied)
      const studentResponse = await request(app)
        .put(`/api/v1/reports/${reportId}`)
        .set("Authorization", `Bearer ${studentToken}`)
        .send(updateData);

      expect(studentResponse.status).toBe(403);
      expect(studentResponse.body.error).toBeDefined();
    });
  });

  describe("DELETE /api/v1/reports/:id", () => {
    it("should delete report (admin and teacher only)", async () => {
      // Create a test report
      const reportData = {
        title: "Delete Report",
        description: "Delete report description",
        type: "ACADEMIC",
        courseId: testCourse.id,
        data: {
          attendance: 85,
          grades: 78,
          participation: 90,
        },
        generatedBy: adminUser.id,
      };

      const createResponse = await request(app)
        .post("/api/v1/reports")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(reportData);

      const reportId = createResponse.body.data.id;

      // Test admin access
      const adminResponse = await request(app)
        .delete(`/api/v1/reports/${reportId}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(adminResponse.status).toBe(200);
      expect(adminResponse.body.success).toBe(true);

      // Create another test report for teacher test
      const createResponse2 = await request(app)
        .post("/api/v1/reports")
        .set("Authorization", `Bearer ${teacherToken}`)
        .send({
          ...reportData,
          title: "Teacher Delete Report",
          generatedBy: teacherUser.id,
        });

      const reportId2 = createResponse2.body.data.id;

      // Test teacher access
      const teacherResponse = await request(app)
        .delete(`/api/v1/reports/${reportId2}`)
        .set("Authorization", `Bearer ${teacherToken}`);

      expect(teacherResponse.status).toBe(200);
      expect(teacherResponse.body.success).toBe(true);

      // Test student access (should be denied)
      const studentResponse = await request(app)
        .delete(`/api/v1/reports/${reportId}`)
        .set("Authorization", `Bearer ${studentToken}`);

      expect(studentResponse.status).toBe(403);
      expect(studentResponse.body.error).toBeDefined();
    });
  });

  describe("GET /api/v1/reports/course/:courseId", () => {
    it("should get course reports (admin, teacher, and student)", async () => {
      // Create test reports
      const reportData = {
        title: "Course Report",
        description: "Course report description",
        type: "ACADEMIC",
        courseId: testCourse.id,
        data: {
          attendance: 85,
          grades: 78,
          participation: 90,
        },
        generatedBy: adminUser.id,
      };

      await request(app)
        .post("/api/v1/reports")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(reportData);

      // Test admin access
      const adminResponse = await request(app)
        .get(`/api/v1/reports/course/${testCourse.id}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(adminResponse.status).toBe(200);
      expect(adminResponse.body.success).toBe(true);
      expect(Array.isArray(adminResponse.body.data)).toBe(true);

      // Test teacher access
      const teacherResponse = await request(app)
        .get(`/api/v1/reports/course/${testCourse.id}`)
        .set("Authorization", `Bearer ${teacherToken}`);

      expect(teacherResponse.status).toBe(200);
      expect(teacherResponse.body.success).toBe(true);
      expect(Array.isArray(teacherResponse.body.data)).toBe(true);

      // Test student access
      const studentResponse = await request(app)
        .get(`/api/v1/reports/course/${testCourse.id}`)
        .set("Authorization", `Bearer ${studentToken}`);

      expect(studentResponse.status).toBe(200);
      expect(studentResponse.body.success).toBe(true);
      expect(Array.isArray(studentResponse.body.data)).toBe(true);
    });
  });

  describe("GET /api/v1/reports/student/:studentId", () => {
    it("should get student reports (admin, teacher, and student)", async () => {
      // Create test reports
      const reportData = {
        title: "Student Report",
        description: "Student report description",
        type: "ACADEMIC",
        courseId: testCourse.id,
        data: {
          attendance: 85,
          grades: 78,
          participation: 90,
        },
        generatedBy: adminUser.id,
        studentId: studentUser.id,
      };

      await request(app)
        .post("/api/v1/reports")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(reportData);

      // Test admin access
      const adminResponse = await request(app)
        .get(`/api/v1/reports/student/${studentUser.id}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(adminResponse.status).toBe(200);
      expect(adminResponse.body.success).toBe(true);
      expect(Array.isArray(adminResponse.body.data)).toBe(true);

      // Test teacher access
      const teacherResponse = await request(app)
        .get(`/api/v1/reports/student/${studentUser.id}`)
        .set("Authorization", `Bearer ${teacherToken}`);

      expect(teacherResponse.status).toBe(200);
      expect(teacherResponse.body.success).toBe(true);
      expect(Array.isArray(teacherResponse.body.data)).toBe(true);

      // Test student access (own reports)
      const studentResponse = await request(app)
        .get(`/api/v1/reports/student/${studentUser.id}`)
        .set("Authorization", `Bearer ${studentToken}`);

      expect(studentResponse.status).toBe(200);
      expect(studentResponse.body.success).toBe(true);
      expect(Array.isArray(studentResponse.body.data)).toBe(true);

      // Test student access (other student's reports - should be denied)
      const otherStudentResponse = await request(app)
        .get(`/api/v1/reports/student/${adminUser.id}`)
        .set("Authorization", `Bearer ${studentToken}`);

      expect(otherStudentResponse.status).toBe(403);
      expect(otherStudentResponse.body.error).toBeDefined();
    });
  });
});
