const request = require("supertest");
const app = require("../../src/app");
const { createTestUser, generateTestToken } = require("../utils/test.utils");
const { ROLES } = require("../../src/constants/roles.constants");
const { USER_STATUS } = require("../../src/constants/status.constants");

describe("Attendance Management API", () => {
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

  describe("GET /api/v1/attendance", () => {
    it("should get all attendance records (admin and teacher only)", async () => {
      // Create a test attendance record
      const attendanceData = {
        studentId: studentUser.id,
        courseId: testCourse.id,
        date: new Date(),
        status: "PRESENT",
        markedBy: teacherUser.id,
      };

      await request(app)
        .post("/api/v1/attendance")
        .set("Authorization", `Bearer ${teacherToken}`)
        .send(attendanceData);

      // Test admin access
      const adminResponse = await request(app)
        .get("/api/v1/attendance")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(adminResponse.status).toBe(200);
      expect(adminResponse.body.success).toBe(true);
      expect(Array.isArray(adminResponse.body.data)).toBe(true);

      // Test teacher access
      const teacherResponse = await request(app)
        .get("/api/v1/attendance")
        .set("Authorization", `Bearer ${teacherToken}`);

      expect(teacherResponse.status).toBe(200);
      expect(teacherResponse.body.success).toBe(true);
      expect(Array.isArray(teacherResponse.body.data)).toBe(true);

      // Test student access (should be denied)
      const studentResponse = await request(app)
        .get("/api/v1/attendance")
        .set("Authorization", `Bearer ${studentToken}`);

      expect(studentResponse.status).toBe(403);
      expect(studentResponse.body.error).toBeDefined();
    });
  });

  describe("GET /api/v1/attendance/:id", () => {
    it("should get attendance record by ID (admin, teacher, and student)", async () => {
      // Create a test attendance record
      const attendanceData = {
        studentId: studentUser.id,
        courseId: testCourse.id,
        date: new Date(),
        status: "PRESENT",
        markedBy: teacherUser.id,
      };

      const createResponse = await request(app)
        .post("/api/v1/attendance")
        .set("Authorization", `Bearer ${teacherToken}`)
        .send(attendanceData);

      const attendanceId = createResponse.body.data.id;

      // Test admin access
      const adminResponse = await request(app)
        .get(`/api/v1/attendance/${attendanceId}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(adminResponse.status).toBe(200);
      expect(adminResponse.body.success).toBe(true);
      expect(adminResponse.body.data.id).toBe(attendanceId);

      // Test teacher access
      const teacherResponse = await request(app)
        .get(`/api/v1/attendance/${attendanceId}`)
        .set("Authorization", `Bearer ${teacherToken}`);

      expect(teacherResponse.status).toBe(200);
      expect(teacherResponse.body.success).toBe(true);
      expect(teacherResponse.body.data.id).toBe(attendanceId);

      // Test student access (should only see their own attendance)
      const studentResponse = await request(app)
        .get(`/api/v1/attendance/${attendanceId}`)
        .set("Authorization", `Bearer ${studentToken}`);

      expect(studentResponse.status).toBe(200);
      expect(studentResponse.body.success).toBe(true);
      expect(studentResponse.body.data.id).toBe(attendanceId);
      expect(studentResponse.body.data.studentId).toBe(studentUser.id);
    });

    it("should return 404 for non-existent attendance record", async () => {
      const response = await request(app)
        .get("/api/v1/attendance/507f1f77bcf86cd799439011")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
      expect(response.body.error).toBeDefined();
    });
  });

  describe("POST /api/v1/attendance", () => {
    it("should create new attendance record (admin and teacher only)", async () => {
      const attendanceData = {
        studentId: studentUser.id,
        courseId: testCourse.id,
        date: new Date(),
        status: "PRESENT",
        notes: "Student was on time",
      };

      // Test admin access
      const adminResponse = await request(app)
        .post("/api/v1/attendance")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(attendanceData);

      expect(adminResponse.status).toBe(201);
      expect(adminResponse.body.success).toBe(true);
      expect(adminResponse.body.data.status).toBe(attendanceData.status);
      expect(adminResponse.body.data.notes).toBe(attendanceData.notes);

      // Test teacher access
      const teacherResponse = await request(app)
        .post("/api/v1/attendance")
        .set("Authorization", `Bearer ${teacherToken}`)
        .send({
          ...attendanceData,
          status: "ABSENT",
          notes: "Student was absent",
        });

      expect(teacherResponse.status).toBe(201);
      expect(teacherResponse.body.success).toBe(true);
      expect(teacherResponse.body.data.status).toBe("ABSENT");
      expect(teacherResponse.body.data.notes).toBe("Student was absent");

      // Test student access (should be denied)
      const studentResponse = await request(app)
        .post("/api/v1/attendance")
        .set("Authorization", `Bearer ${studentToken}`)
        .send(attendanceData);

      expect(studentResponse.status).toBe(403);
      expect(studentResponse.body.error).toBeDefined();
    });

    it("should return 400 for invalid attendance data", async () => {
      const invalidAttendanceData = {
        studentId: studentUser.id,
        courseId: testCourse.id,
        date: new Date(),
        status: "INVALID_STATUS", // Invalid status
        notes: "Invalid attendance record",
      };

      const response = await request(app)
        .post("/api/v1/attendance")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(invalidAttendanceData);

      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
    });
  });

  describe("PUT /api/v1/attendance/:id", () => {
    it("should update attendance record (admin and teacher only)", async () => {
      // Create a test attendance record
      const attendanceData = {
        studentId: studentUser.id,
        courseId: testCourse.id,
        date: new Date(),
        status: "PRESENT",
        markedBy: teacherUser.id,
      };

      const createResponse = await request(app)
        .post("/api/v1/attendance")
        .set("Authorization", `Bearer ${teacherToken}`)
        .send(attendanceData);

      const attendanceId = createResponse.body.data.id;

      const updateData = {
        status: "LATE",
        notes: "Updated notes",
        markedBy: teacherUser.id,
      };

      // Test admin access
      const adminResponse = await request(app)
        .put(`/api/v1/attendance/${attendanceId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send(updateData);

      expect(adminResponse.status).toBe(200);
      expect(adminResponse.body.success).toBe(true);
      expect(adminResponse.body.data.status).toBe(updateData.status);
      expect(adminResponse.body.data.notes).toBe(updateData.notes);

      // Test teacher access
      const teacherResponse = await request(app)
        .put(`/api/v1/attendance/${attendanceId}`)
        .set("Authorization", `Bearer ${teacherToken}`)
        .send({
          ...updateData,
          status: "EXCUSED",
          notes: "Teacher updated notes",
        });

      expect(teacherResponse.status).toBe(200);
      expect(teacherResponse.body.success).toBe(true);
      expect(teacherResponse.body.data.status).toBe("EXCUSED");
      expect(teacherResponse.body.data.notes).toBe("Teacher updated notes");

      // Test student access (should be denied)
      const studentResponse = await request(app)
        .put(`/api/v1/attendance/${attendanceId}`)
        .set("Authorization", `Bearer ${studentToken}`)
        .send(updateData);

      expect(studentResponse.status).toBe(403);
      expect(studentResponse.body.error).toBeDefined();
    });
  });

  describe("DELETE /api/v1/attendance/:id", () => {
    it("should delete attendance record (admin and teacher only)", async () => {
      // Create a test attendance record
      const attendanceData = {
        studentId: studentUser.id,
        courseId: testCourse.id,
        date: new Date(),
        status: "PRESENT",
        markedBy: teacherUser.id,
      };

      const createResponse = await request(app)
        .post("/api/v1/attendance")
        .set("Authorization", `Bearer ${teacherToken}`)
        .send(attendanceData);

      const attendanceId = createResponse.body.data.id;

      // Test admin access
      const adminResponse = await request(app)
        .delete(`/api/v1/attendance/${attendanceId}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(adminResponse.status).toBe(200);
      expect(adminResponse.body.success).toBe(true);

      // Create another test attendance record for teacher test
      const createResponse2 = await request(app)
        .post("/api/v1/attendance")
        .set("Authorization", `Bearer ${teacherToken}`)
        .send({
          ...attendanceData,
          status: "ABSENT",
        });

      const attendanceId2 = createResponse2.body.data.id;

      // Test teacher access
      const teacherResponse = await request(app)
        .delete(`/api/v1/attendance/${attendanceId2}`)
        .set("Authorization", `Bearer ${teacherToken}`);

      expect(teacherResponse.status).toBe(200);
      expect(teacherResponse.body.success).toBe(true);

      // Test student access (should be denied)
      const studentResponse = await request(app)
        .delete(`/api/v1/attendance/${attendanceId}`)
        .set("Authorization", `Bearer ${studentToken}`);

      expect(studentResponse.status).toBe(403);
      expect(studentResponse.body.error).toBeDefined();
    });
  });

  describe("GET /api/v1/attendance/student/:studentId", () => {
    it("should get student attendance records (admin, teacher, and student)", async () => {
      // Create test attendance records
      const attendanceData = {
        studentId: studentUser.id,
        courseId: testCourse.id,
        date: new Date(),
        status: "PRESENT",
        markedBy: teacherUser.id,
      };

      await request(app)
        .post("/api/v1/attendance")
        .set("Authorization", `Bearer ${teacherToken}`)
        .send(attendanceData);

      // Test admin access
      const adminResponse = await request(app)
        .get(`/api/v1/attendance/student/${studentUser.id}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(adminResponse.status).toBe(200);
      expect(adminResponse.body.success).toBe(true);
      expect(Array.isArray(adminResponse.body.data)).toBe(true);

      // Test teacher access
      const teacherResponse = await request(app)
        .get(`/api/v1/attendance/student/${studentUser.id}`)
        .set("Authorization", `Bearer ${teacherToken}`);

      expect(teacherResponse.status).toBe(200);
      expect(teacherResponse.body.success).toBe(true);
      expect(Array.isArray(teacherResponse.body.data)).toBe(true);

      // Test student access (should only see their own attendance)
      const studentResponse = await request(app)
        .get(`/api/v1/attendance/student/${studentUser.id}`)
        .set("Authorization", `Bearer ${studentToken}`);

      expect(studentResponse.status).toBe(200);
      expect(studentResponse.body.success).toBe(true);
      expect(Array.isArray(studentResponse.body.data)).toBe(true);
      expect(
        studentResponse.body.data.every(
          (record) => record.studentId === studentUser.id
        )
      ).toBe(true);
    });
  });

  describe("GET /api/v1/attendance/course/:courseId", () => {
    it("should get course attendance records (admin and teacher only)", async () => {
      // Create test attendance records
      const attendanceData = {
        studentId: studentUser.id,
        courseId: testCourse.id,
        date: new Date(),
        status: "PRESENT",
        markedBy: teacherUser.id,
      };

      await request(app)
        .post("/api/v1/attendance")
        .set("Authorization", `Bearer ${teacherToken}`)
        .send(attendanceData);

      // Test admin access
      const adminResponse = await request(app)
        .get(`/api/v1/attendance/course/${testCourse.id}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(adminResponse.status).toBe(200);
      expect(adminResponse.body.success).toBe(true);
      expect(Array.isArray(adminResponse.body.data)).toBe(true);

      // Test teacher access
      const teacherResponse = await request(app)
        .get(`/api/v1/attendance/course/${testCourse.id}`)
        .set("Authorization", `Bearer ${teacherToken}`);

      expect(teacherResponse.status).toBe(200);
      expect(teacherResponse.body.success).toBe(true);
      expect(Array.isArray(teacherResponse.body.data)).toBe(true);

      // Test student access (should be denied)
      const studentResponse = await request(app)
        .get(`/api/v1/attendance/course/${testCourse.id}`)
        .set("Authorization", `Bearer ${studentToken}`);

      expect(studentResponse.status).toBe(403);
      expect(studentResponse.body.error).toBeDefined();
    });
  });
});
