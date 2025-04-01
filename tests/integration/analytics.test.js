const request = require("supertest");
const app = require("../../src/app");
const { createTestUser, generateTestToken } = require("../utils/test.utils");
const { ROLES } = require("../../src/constants/roles.constants");
const { USER_STATUS } = require("../../src/constants/status.constants");

describe("Analytics Management API", () => {
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

  describe("GET /api/v1/analytics/overview", () => {
    it("should get system overview analytics (admin only)", async () => {
      // Test admin access
      const adminResponse = await request(app)
        .get("/api/v1/analytics/overview")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(adminResponse.status).toBe(200);
      expect(adminResponse.body.success).toBe(true);
      expect(adminResponse.body.data).toHaveProperty("totalStudents");
      expect(adminResponse.body.data).toHaveProperty("totalTeachers");
      expect(adminResponse.body.data).toHaveProperty("totalCourses");
      expect(adminResponse.body.data).toHaveProperty("averageAttendance");
      expect(adminResponse.body.data).toHaveProperty("averageGrades");

      // Test teacher access (should be denied)
      const teacherResponse = await request(app)
        .get("/api/v1/analytics/overview")
        .set("Authorization", `Bearer ${teacherToken}`);

      expect(teacherResponse.status).toBe(403);
      expect(teacherResponse.body.error).toBeDefined();

      // Test student access (should be denied)
      const studentResponse = await request(app)
        .get("/api/v1/analytics/overview")
        .set("Authorization", `Bearer ${studentToken}`);

      expect(studentResponse.status).toBe(403);
      expect(studentResponse.body.error).toBeDefined();
    });
  });

  describe("GET /api/v1/analytics/course/:courseId", () => {
    it("should get course analytics (admin and teacher only)", async () => {
      // Test admin access
      const adminResponse = await request(app)
        .get(`/api/v1/analytics/course/${testCourse.id}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(adminResponse.status).toBe(200);
      expect(adminResponse.body.success).toBe(true);
      expect(adminResponse.body.data).toHaveProperty("courseId", testCourse.id);
      expect(adminResponse.body.data).toHaveProperty("enrollmentStats");
      expect(adminResponse.body.data).toHaveProperty("performanceStats");
      expect(adminResponse.body.data).toHaveProperty("attendanceStats");

      // Test teacher access
      const teacherResponse = await request(app)
        .get(`/api/v1/analytics/course/${testCourse.id}`)
        .set("Authorization", `Bearer ${teacherToken}`);

      expect(teacherResponse.status).toBe(200);
      expect(teacherResponse.body.success).toBe(true);
      expect(teacherResponse.body.data).toHaveProperty(
        "courseId",
        testCourse.id
      );

      // Test student access (should be denied)
      const studentResponse = await request(app)
        .get(`/api/v1/analytics/course/${testCourse.id}`)
        .set("Authorization", `Bearer ${studentToken}`);

      expect(studentResponse.status).toBe(403);
      expect(studentResponse.body.error).toBeDefined();
    });
  });

  describe("GET /api/v1/analytics/student/:studentId", () => {
    it("should get student analytics (admin, teacher, and student)", async () => {
      // Test admin access
      const adminResponse = await request(app)
        .get(`/api/v1/analytics/student/${studentUser.id}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(adminResponse.status).toBe(200);
      expect(adminResponse.body.success).toBe(true);
      expect(adminResponse.body.data).toHaveProperty(
        "studentId",
        studentUser.id
      );
      expect(adminResponse.body.data).toHaveProperty("academicPerformance");
      expect(adminResponse.body.data).toHaveProperty("attendance");
      expect(adminResponse.body.data).toHaveProperty("courseProgress");

      // Test teacher access
      const teacherResponse = await request(app)
        .get(`/api/v1/analytics/student/${studentUser.id}`)
        .set("Authorization", `Bearer ${teacherToken}`);

      expect(teacherResponse.status).toBe(200);
      expect(teacherResponse.body.success).toBe(true);
      expect(teacherResponse.body.data).toHaveProperty(
        "studentId",
        studentUser.id
      );

      // Test student access (own analytics)
      const studentResponse = await request(app)
        .get(`/api/v1/analytics/student/${studentUser.id}`)
        .set("Authorization", `Bearer ${studentToken}`);

      expect(studentResponse.status).toBe(200);
      expect(studentResponse.body.success).toBe(true);
      expect(studentResponse.body.data).toHaveProperty(
        "studentId",
        studentUser.id
      );

      // Test student access (other student's analytics - should be denied)
      const otherStudentResponse = await request(app)
        .get(`/api/v1/analytics/student/${adminUser.id}`)
        .set("Authorization", `Bearer ${studentToken}`);

      expect(otherStudentResponse.status).toBe(403);
      expect(otherStudentResponse.body.error).toBeDefined();
    });
  });

  describe("GET /api/v1/analytics/teacher/:teacherId", () => {
    it("should get teacher analytics (admin and teacher only)", async () => {
      // Test admin access
      const adminResponse = await request(app)
        .get(`/api/v1/analytics/teacher/${teacherUser.id}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(adminResponse.status).toBe(200);
      expect(adminResponse.body.success).toBe(true);
      expect(adminResponse.body.data).toHaveProperty(
        "teacherId",
        teacherUser.id
      );
      expect(adminResponse.body.data).toHaveProperty("coursePerformance");
      expect(adminResponse.body.data).toHaveProperty("studentProgress");
      expect(adminResponse.body.data).toHaveProperty("teachingMetrics");

      // Test teacher access (own analytics)
      const teacherResponse = await request(app)
        .get(`/api/v1/analytics/teacher/${teacherUser.id}`)
        .set("Authorization", `Bearer ${teacherToken}`);

      expect(teacherResponse.status).toBe(200);
      expect(teacherResponse.body.success).toBe(true);
      expect(teacherResponse.body.data).toHaveProperty(
        "teacherId",
        teacherUser.id
      );

      // Test teacher access (other teacher's analytics - should be denied)
      const otherTeacherResponse = await request(app)
        .get(`/api/v1/analytics/teacher/${adminUser.id}`)
        .set("Authorization", `Bearer ${teacherToken}`);

      expect(otherTeacherResponse.status).toBe(403);
      expect(otherTeacherResponse.body.error).toBeDefined();

      // Test student access (should be denied)
      const studentResponse = await request(app)
        .get(`/api/v1/analytics/teacher/${teacherUser.id}`)
        .set("Authorization", `Bearer ${studentToken}`);

      expect(studentResponse.status).toBe(403);
      expect(studentResponse.body.error).toBeDefined();
    });
  });

  describe("GET /api/v1/analytics/department/:department", () => {
    it("should get department analytics (admin only)", async () => {
      const department = "Pharmacy";

      // Test admin access
      const adminResponse = await request(app)
        .get(`/api/v1/analytics/department/${department}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(adminResponse.status).toBe(200);
      expect(adminResponse.body.success).toBe(true);
      expect(adminResponse.body.data).toHaveProperty("department", department);
      expect(adminResponse.body.data).toHaveProperty("courseStats");
      expect(adminResponse.body.data).toHaveProperty("studentStats");
      expect(adminResponse.body.data).toHaveProperty("performanceMetrics");

      // Test teacher access (should be denied)
      const teacherResponse = await request(app)
        .get(`/api/v1/analytics/department/${department}`)
        .set("Authorization", `Bearer ${teacherToken}`);

      expect(teacherResponse.status).toBe(403);
      expect(teacherResponse.body.error).toBeDefined();

      // Test student access (should be denied)
      const studentResponse = await request(app)
        .get(`/api/v1/analytics/department/${department}`)
        .set("Authorization", `Bearer ${studentToken}`);

      expect(studentResponse.status).toBe(403);
      expect(studentResponse.body.error).toBeDefined();
    });
  });

  describe("GET /api/v1/analytics/performance", () => {
    it("should get performance analytics (admin and teacher only)", async () => {
      // Test admin access
      const adminResponse = await request(app)
        .get("/api/v1/analytics/performance")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(adminResponse.status).toBe(200);
      expect(adminResponse.body.success).toBe(true);
      expect(adminResponse.body.data).toHaveProperty("overallPerformance");
      expect(adminResponse.body.data).toHaveProperty("coursePerformance");
      expect(adminResponse.body.data).toHaveProperty("studentPerformance");
      expect(adminResponse.body.data).toHaveProperty("trends");

      // Test teacher access
      const teacherResponse = await request(app)
        .get("/api/v1/analytics/performance")
        .set("Authorization", `Bearer ${teacherToken}`);

      expect(teacherResponse.status).toBe(200);
      expect(teacherResponse.body.success).toBe(true);
      expect(teacherResponse.body.data).toHaveProperty("overallPerformance");

      // Test student access (should be denied)
      const studentResponse = await request(app)
        .get("/api/v1/analytics/performance")
        .set("Authorization", `Bearer ${studentToken}`);

      expect(studentResponse.status).toBe(403);
      expect(studentResponse.body.error).toBeDefined();
    });
  });

  describe("GET /api/v1/analytics/attendance", () => {
    it("should get attendance analytics (admin and teacher only)", async () => {
      // Test admin access
      const adminResponse = await request(app)
        .get("/api/v1/analytics/attendance")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(adminResponse.status).toBe(200);
      expect(adminResponse.body.success).toBe(true);
      expect(adminResponse.body.data).toHaveProperty("overallAttendance");
      expect(adminResponse.body.data).toHaveProperty("courseAttendance");
      expect(adminResponse.body.data).toHaveProperty("studentAttendance");
      expect(adminResponse.body.data).toHaveProperty("trends");

      // Test teacher access
      const teacherResponse = await request(app)
        .get("/api/v1/analytics/attendance")
        .set("Authorization", `Bearer ${teacherToken}`);

      expect(teacherResponse.status).toBe(200);
      expect(teacherResponse.body.success).toBe(true);
      expect(teacherResponse.body.data).toHaveProperty("overallAttendance");

      // Test student access (should be denied)
      const studentResponse = await request(app)
        .get("/api/v1/analytics/attendance")
        .set("Authorization", `Bearer ${studentToken}`);

      expect(studentResponse.status).toBe(403);
      expect(studentResponse.body.error).toBeDefined();
    });
  });
});
