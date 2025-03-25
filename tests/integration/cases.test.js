const request = require("supertest");
const app = require("../../src/app");
const { createTestUser, generateTestToken } = require("../utils/test.utils");
const { ROLES } = require("../../src/constants/roles.constants");
const { USER_STATUS } = require("../../src/constants/status.constants");

describe("Cases Management API", () => {
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

  describe("GET /api/v1/cases", () => {
    it("should get all cases (admin and teacher only)", async () => {
      // Create a test case
      const caseData = {
        title: "Test Case",
        description: "Test case description",
        type: "ACADEMIC",
        priority: "MEDIUM",
        status: "OPEN",
        assignedTo: teacherUser.id,
        createdBy: adminUser.id,
        studentId: studentUser.id,
        metadata: {
          courseId: "123",
          semester: 1,
        },
      };

      await request(app)
        .post("/api/v1/cases")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(caseData);

      // Test admin access
      const adminResponse = await request(app)
        .get("/api/v1/cases")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(adminResponse.status).toBe(200);
      expect(adminResponse.body.success).toBe(true);
      expect(Array.isArray(adminResponse.body.data)).toBe(true);

      // Test teacher access
      const teacherResponse = await request(app)
        .get("/api/v1/cases")
        .set("Authorization", `Bearer ${teacherToken}`);

      expect(teacherResponse.status).toBe(200);
      expect(teacherResponse.body.success).toBe(true);
      expect(Array.isArray(teacherResponse.body.data)).toBe(true);

      // Test student access (should be denied)
      const studentResponse = await request(app)
        .get("/api/v1/cases")
        .set("Authorization", `Bearer ${studentToken}`);

      expect(studentResponse.status).toBe(403);
      expect(studentResponse.body.error).toBeDefined();
    });
  });

  describe("GET /api/v1/cases/:id", () => {
    it("should get case by ID (admin, teacher, and student)", async () => {
      // Create a test case
      const caseData = {
        title: "Test Case",
        description: "Test case description",
        type: "ACADEMIC",
        priority: "MEDIUM",
        status: "OPEN",
        assignedTo: teacherUser.id,
        createdBy: adminUser.id,
        studentId: studentUser.id,
        metadata: {
          courseId: "123",
          semester: 1,
        },
      };

      const createResponse = await request(app)
        .post("/api/v1/cases")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(caseData);

      const caseId = createResponse.body.data.id;

      // Test admin access
      const adminResponse = await request(app)
        .get(`/api/v1/cases/${caseId}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(adminResponse.status).toBe(200);
      expect(adminResponse.body.success).toBe(true);
      expect(adminResponse.body.data.id).toBe(caseId);

      // Test teacher access
      const teacherResponse = await request(app)
        .get(`/api/v1/cases/${caseId}`)
        .set("Authorization", `Bearer ${teacherToken}`);

      expect(teacherResponse.status).toBe(200);
      expect(teacherResponse.body.success).toBe(true);
      expect(teacherResponse.body.data.id).toBe(caseId);

      // Test student access (should only see their own cases)
      const studentResponse = await request(app)
        .get(`/api/v1/cases/${caseId}`)
        .set("Authorization", `Bearer ${studentToken}`);

      expect(studentResponse.status).toBe(200);
      expect(studentResponse.body.success).toBe(true);
      expect(studentResponse.body.data.id).toBe(caseId);
      expect(studentResponse.body.data.studentId).toBe(studentUser.id);
    });

    it("should return 404 for non-existent case", async () => {
      const response = await request(app)
        .get("/api/v1/cases/507f1f77bcf86cd799439011")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
      expect(response.body.error).toBeDefined();
    });
  });

  describe("POST /api/v1/cases", () => {
    it("should create new case (admin and teacher only)", async () => {
      const caseData = {
        title: "New Case",
        description: "New case description",
        type: "ACADEMIC",
        priority: "MEDIUM",
        status: "OPEN",
        assignedTo: teacherUser.id,
        studentId: studentUser.id,
        metadata: {
          courseId: "123",
          semester: 1,
        },
      };

      // Test admin access
      const adminResponse = await request(app)
        .post("/api/v1/cases")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(caseData);

      expect(adminResponse.status).toBe(201);
      expect(adminResponse.body.success).toBe(true);
      expect(adminResponse.body.data.title).toBe(caseData.title);
      expect(adminResponse.body.data.type).toBe(caseData.type);
      expect(adminResponse.body.data.priority).toBe(caseData.priority);

      // Test teacher access
      const teacherResponse = await request(app)
        .post("/api/v1/cases")
        .set("Authorization", `Bearer ${teacherToken}`)
        .send({
          ...caseData,
          title: "Teacher Case",
        });

      expect(teacherResponse.status).toBe(201);
      expect(teacherResponse.body.success).toBe(true);
      expect(teacherResponse.body.data.title).toBe("Teacher Case");

      // Test student access (should be denied)
      const studentResponse = await request(app)
        .post("/api/v1/cases")
        .set("Authorization", `Bearer ${studentToken}`)
        .send(caseData);

      expect(studentResponse.status).toBe(403);
      expect(studentResponse.body.error).toBeDefined();
    });

    it("should return 400 for invalid case data", async () => {
      const invalidCaseData = {
        title: "", // Invalid empty title
        type: "INVALID_TYPE", // Invalid type
        priority: "INVALID_PRIORITY", // Invalid priority
        status: "INVALID_STATUS", // Invalid status
      };

      const response = await request(app)
        .post("/api/v1/cases")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(invalidCaseData);

      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
    });
  });

  describe("PUT /api/v1/cases/:id", () => {
    it("should update case (admin and teacher only)", async () => {
      // Create a test case
      const caseData = {
        title: "Update Case",
        description: "Update case description",
        type: "ACADEMIC",
        priority: "MEDIUM",
        status: "OPEN",
        assignedTo: teacherUser.id,
        createdBy: adminUser.id,
        studentId: studentUser.id,
        metadata: {
          courseId: "123",
          semester: 1,
        },
      };

      const createResponse = await request(app)
        .post("/api/v1/cases")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(caseData);

      const caseId = createResponse.body.data.id;

      const updateData = {
        title: "Updated Case",
        description: "Updated case description",
        priority: "HIGH",
        status: "IN_PROGRESS",
        metadata: {
          courseId: "456",
          semester: 2,
        },
      };

      // Test admin access
      const adminResponse = await request(app)
        .put(`/api/v1/cases/${caseId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send(updateData);

      expect(adminResponse.status).toBe(200);
      expect(adminResponse.body.success).toBe(true);
      expect(adminResponse.body.data.title).toBe(updateData.title);
      expect(adminResponse.body.data.priority).toBe(updateData.priority);
      expect(adminResponse.body.data.status).toBe(updateData.status);
      expect(adminResponse.body.data.metadata).toEqual(updateData.metadata);

      // Test teacher access
      const teacherResponse = await request(app)
        .put(`/api/v1/cases/${caseId}`)
        .set("Authorization", `Bearer ${teacherToken}`)
        .send({
          ...updateData,
          title: "Teacher Updated Case",
        });

      expect(teacherResponse.status).toBe(200);
      expect(teacherResponse.body.success).toBe(true);
      expect(teacherResponse.body.data.title).toBe("Teacher Updated Case");

      // Test student access (should be denied)
      const studentResponse = await request(app)
        .put(`/api/v1/cases/${caseId}`)
        .set("Authorization", `Bearer ${studentToken}`)
        .send(updateData);

      expect(studentResponse.status).toBe(403);
      expect(studentResponse.body.error).toBeDefined();
    });
  });

  describe("DELETE /api/v1/cases/:id", () => {
    it("should delete case (admin and teacher only)", async () => {
      // Create a test case
      const caseData = {
        title: "Delete Case",
        description: "Delete case description",
        type: "ACADEMIC",
        priority: "MEDIUM",
        status: "OPEN",
        assignedTo: teacherUser.id,
        createdBy: adminUser.id,
        studentId: studentUser.id,
        metadata: {
          courseId: "123",
          semester: 1,
        },
      };

      const createResponse = await request(app)
        .post("/api/v1/cases")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(caseData);

      const caseId = createResponse.body.data.id;

      // Test admin access
      const adminResponse = await request(app)
        .delete(`/api/v1/cases/${caseId}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(adminResponse.status).toBe(200);
      expect(adminResponse.body.success).toBe(true);

      // Create another test case for teacher test
      const createResponse2 = await request(app)
        .post("/api/v1/cases")
        .set("Authorization", `Bearer ${teacherToken}`)
        .send({
          ...caseData,
          title: "Teacher Delete Case",
        });

      const caseId2 = createResponse2.body.data.id;

      // Test teacher access
      const teacherResponse = await request(app)
        .delete(`/api/v1/cases/${caseId2}`)
        .set("Authorization", `Bearer ${teacherToken}`);

      expect(teacherResponse.status).toBe(200);
      expect(teacherResponse.body.success).toBe(true);

      // Test student access (should be denied)
      const studentResponse = await request(app)
        .delete(`/api/v1/cases/${caseId}`)
        .set("Authorization", `Bearer ${studentToken}`);

      expect(studentResponse.status).toBe(403);
      expect(studentResponse.body.error).toBeDefined();
    });
  });

  describe("GET /api/v1/cases/student/:studentId", () => {
    it("should get student cases (admin, teacher, and student)", async () => {
      // Create test cases
      const caseData = {
        title: "Student Case",
        description: "Student case description",
        type: "ACADEMIC",
        priority: "MEDIUM",
        status: "OPEN",
        assignedTo: teacherUser.id,
        createdBy: adminUser.id,
        studentId: studentUser.id,
        metadata: {
          courseId: "123",
          semester: 1,
        },
      };

      await request(app)
        .post("/api/v1/cases")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(caseData);

      // Test admin access
      const adminResponse = await request(app)
        .get(`/api/v1/cases/student/${studentUser.id}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(adminResponse.status).toBe(200);
      expect(adminResponse.body.success).toBe(true);
      expect(Array.isArray(adminResponse.body.data)).toBe(true);
      expect(adminResponse.body.data[0].studentId).toBe(studentUser.id);

      // Test teacher access
      const teacherResponse = await request(app)
        .get(`/api/v1/cases/student/${studentUser.id}`)
        .set("Authorization", `Bearer ${teacherToken}`);

      expect(teacherResponse.status).toBe(200);
      expect(teacherResponse.body.success).toBe(true);
      expect(Array.isArray(teacherResponse.body.data)).toBe(true);

      // Test student access (own cases)
      const studentResponse = await request(app)
        .get(`/api/v1/cases/student/${studentUser.id}`)
        .set("Authorization", `Bearer ${studentToken}`);

      expect(studentResponse.status).toBe(200);
      expect(studentResponse.body.success).toBe(true);
      expect(Array.isArray(studentResponse.body.data)).toBe(true);
      expect(
        studentResponse.body.data.every((c) => c.studentId === studentUser.id)
      ).toBe(true);

      // Test student access (other student's cases - should be denied)
      const otherStudentResponse = await request(app)
        .get(`/api/v1/cases/student/${adminUser.id}`)
        .set("Authorization", `Bearer ${studentToken}`);

      expect(otherStudentResponse.status).toBe(403);
      expect(otherStudentResponse.body.error).toBeDefined();
    });
  });

  describe("GET /api/v1/cases/status/:status", () => {
    it("should get cases by status (admin and teacher only)", async () => {
      const status = "OPEN";

      // Create test cases
      const caseData = {
        title: "Status Case",
        description: "Status case description",
        type: "ACADEMIC",
        priority: "MEDIUM",
        status: status,
        assignedTo: teacherUser.id,
        createdBy: adminUser.id,
        studentId: studentUser.id,
        metadata: {
          courseId: "123",
          semester: 1,
        },
      };

      await request(app)
        .post("/api/v1/cases")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(caseData);

      // Test admin access
      const adminResponse = await request(app)
        .get(`/api/v1/cases/status/${status}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(adminResponse.status).toBe(200);
      expect(adminResponse.body.success).toBe(true);
      expect(Array.isArray(adminResponse.body.data)).toBe(true);
      expect(adminResponse.body.data[0].status).toBe(status);

      // Test teacher access
      const teacherResponse = await request(app)
        .get(`/api/v1/cases/status/${status}`)
        .set("Authorization", `Bearer ${teacherToken}`);

      expect(teacherResponse.status).toBe(200);
      expect(teacherResponse.body.success).toBe(true);
      expect(Array.isArray(teacherResponse.body.data)).toBe(true);

      // Test student access (should be denied)
      const studentResponse = await request(app)
        .get(`/api/v1/cases/status/${status}`)
        .set("Authorization", `Bearer ${studentToken}`);

      expect(studentResponse.status).toBe(403);
      expect(studentResponse.body.error).toBeDefined();
    });
  });

  describe("PUT /api/v1/cases/:id/status", () => {
    it("should update case status (admin and teacher only)", async () => {
      // Create a test case
      const caseData = {
        title: "Status Update Case",
        description: "Status update case description",
        type: "ACADEMIC",
        priority: "MEDIUM",
        status: "OPEN",
        assignedTo: teacherUser.id,
        createdBy: adminUser.id,
        studentId: studentUser.id,
        metadata: {
          courseId: "123",
          semester: 1,
        },
      };

      const createResponse = await request(app)
        .post("/api/v1/cases")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(caseData);

      const caseId = createResponse.body.data.id;

      const statusUpdate = {
        status: "IN_PROGRESS",
        notes: "Case is being worked on",
      };

      // Test admin access
      const adminResponse = await request(app)
        .put(`/api/v1/cases/${caseId}/status`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send(statusUpdate);

      expect(adminResponse.status).toBe(200);
      expect(adminResponse.body.success).toBe(true);
      expect(adminResponse.body.data.status).toBe(statusUpdate.status);
      expect(adminResponse.body.data.notes).toBe(statusUpdate.notes);

      // Test teacher access
      const teacherResponse = await request(app)
        .put(`/api/v1/cases/${caseId}/status`)
        .set("Authorization", `Bearer ${teacherToken}`)
        .send({
          ...statusUpdate,
          status: "RESOLVED",
          notes: "Case has been resolved",
        });

      expect(teacherResponse.status).toBe(200);
      expect(teacherResponse.body.success).toBe(true);
      expect(teacherResponse.body.data.status).toBe("RESOLVED");
      expect(teacherResponse.body.data.notes).toBe("Case has been resolved");

      // Test student access (should be denied)
      const studentResponse = await request(app)
        .put(`/api/v1/cases/${caseId}/status`)
        .set("Authorization", `Bearer ${studentToken}`)
        .send(statusUpdate);

      expect(studentResponse.status).toBe(403);
      expect(studentResponse.body.error).toBeDefined();
    });
  });
});
