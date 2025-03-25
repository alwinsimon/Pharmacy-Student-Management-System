const request = require("supertest");
const app = require("../../src/app");
const { createTestUser, generateTestToken } = require("../utils/test.utils");
const { ROLES } = require("../../src/constants/roles.constants");
const { USER_STATUS } = require("../../src/constants/status.constants");

describe("Notification Management API", () => {
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

  describe("GET /api/v1/notifications", () => {
    it("should get user notifications", async () => {
      // Create a test notification
      const notificationData = {
        title: "Test Notification",
        message: "Test notification message",
        type: "INFO",
        recipients: [studentUser.id],
        priority: "MEDIUM",
      };

      await request(app)
        .post("/api/v1/notifications")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(notificationData);

      // Test student access (recipient)
      const studentResponse = await request(app)
        .get("/api/v1/notifications")
        .set("Authorization", `Bearer ${studentToken}`);

      expect(studentResponse.status).toBe(200);
      expect(studentResponse.body.success).toBe(true);
      expect(Array.isArray(studentResponse.body.data)).toBe(true);
      expect(studentResponse.body.data.length).toBeGreaterThan(0);
      expect(studentResponse.body.data[0].recipients).toContain(studentUser.id);

      // Test admin access
      const adminResponse = await request(app)
        .get("/api/v1/notifications")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(adminResponse.status).toBe(200);
      expect(adminResponse.body.success).toBe(true);
      expect(Array.isArray(adminResponse.body.data)).toBe(true);

      // Test teacher access
      const teacherResponse = await request(app)
        .get("/api/v1/notifications")
        .set("Authorization", `Bearer ${teacherToken}`);

      expect(teacherResponse.status).toBe(200);
      expect(teacherResponse.body.success).toBe(true);
      expect(Array.isArray(teacherResponse.body.data)).toBe(true);
    });
  });

  describe("GET /api/v1/notifications/:id", () => {
    it("should get notification by ID", async () => {
      // Create a test notification
      const notificationData = {
        title: "Test Notification",
        message: "Test notification message",
        type: "INFO",
        recipients: [studentUser.id],
        priority: "MEDIUM",
      };

      const createResponse = await request(app)
        .post("/api/v1/notifications")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(notificationData);

      const notificationId = createResponse.body.data.id;

      // Test student access (recipient)
      const studentResponse = await request(app)
        .get(`/api/v1/notifications/${notificationId}`)
        .set("Authorization", `Bearer ${studentToken}`);

      expect(studentResponse.status).toBe(200);
      expect(studentResponse.body.success).toBe(true);
      expect(studentResponse.body.data.id).toBe(notificationId);
      expect(studentResponse.body.data.recipients).toContain(studentUser.id);

      // Test admin access
      const adminResponse = await request(app)
        .get(`/api/v1/notifications/${notificationId}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(adminResponse.status).toBe(200);
      expect(adminResponse.body.success).toBe(true);
      expect(adminResponse.body.data.id).toBe(notificationId);

      // Test teacher access
      const teacherResponse = await request(app)
        .get(`/api/v1/notifications/${notificationId}`)
        .set("Authorization", `Bearer ${teacherToken}`);

      expect(teacherResponse.status).toBe(200);
      expect(teacherResponse.body.success).toBe(true);
      expect(teacherResponse.body.data.id).toBe(notificationId);
    });

    it("should return 404 for non-existent notification", async () => {
      const response = await request(app)
        .get("/api/v1/notifications/507f1f77bcf86cd799439011")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
      expect(response.body.error).toBeDefined();
    });
  });

  describe("POST /api/v1/notifications", () => {
    it("should create new notification (admin and teacher only)", async () => {
      const notificationData = {
        title: "New Notification",
        message: "New notification message",
        type: "INFO",
        recipients: [studentUser.id],
        priority: "MEDIUM",
        metadata: {
          courseId: "123",
          examId: "456",
        },
      };

      // Test admin access
      const adminResponse = await request(app)
        .post("/api/v1/notifications")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(notificationData);

      expect(adminResponse.status).toBe(201);
      expect(adminResponse.body.success).toBe(true);
      expect(adminResponse.body.data.title).toBe(notificationData.title);
      expect(adminResponse.body.data.recipients).toEqual(
        notificationData.recipients
      );
      expect(adminResponse.body.data.metadata).toEqual(
        notificationData.metadata
      );

      // Test teacher access
      const teacherResponse = await request(app)
        .post("/api/v1/notifications")
        .set("Authorization", `Bearer ${teacherToken}`)
        .send({
          ...notificationData,
          title: "Teacher Notification",
        });

      expect(teacherResponse.status).toBe(201);
      expect(teacherResponse.body.success).toBe(true);
      expect(teacherResponse.body.data.title).toBe("Teacher Notification");

      // Test student access (should be denied)
      const studentResponse = await request(app)
        .post("/api/v1/notifications")
        .set("Authorization", `Bearer ${studentToken}`)
        .send(notificationData);

      expect(studentResponse.status).toBe(403);
      expect(studentResponse.body.error).toBeDefined();
    });

    it("should return 400 for invalid notification data", async () => {
      const invalidNotificationData = {
        title: "", // Invalid empty title
        message: "", // Invalid empty message
        type: "INVALID_TYPE", // Invalid type
        recipients: [], // Invalid empty recipients
        priority: "INVALID_PRIORITY", // Invalid priority
      };

      const response = await request(app)
        .post("/api/v1/notifications")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(invalidNotificationData);

      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
    });
  });

  describe("PUT /api/v1/notifications/:id", () => {
    it("should update notification (admin and teacher only)", async () => {
      // Create a test notification
      const notificationData = {
        title: "Update Notification",
        message: "Update notification message",
        type: "INFO",
        recipients: [studentUser.id],
        priority: "MEDIUM",
      };

      const createResponse = await request(app)
        .post("/api/v1/notifications")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(notificationData);

      const notificationId = createResponse.body.data.id;

      const updateData = {
        title: "Updated Notification",
        message: "Updated notification message",
        type: "WARNING",
        priority: "HIGH",
        metadata: {
          courseId: "789",
          examId: "012",
        },
      };

      // Test admin access
      const adminResponse = await request(app)
        .put(`/api/v1/notifications/${notificationId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send(updateData);

      expect(adminResponse.status).toBe(200);
      expect(adminResponse.body.success).toBe(true);
      expect(adminResponse.body.data.title).toBe(updateData.title);
      expect(adminResponse.body.data.type).toBe(updateData.type);
      expect(adminResponse.body.data.priority).toBe(updateData.priority);

      // Test teacher access
      const teacherResponse = await request(app)
        .put(`/api/v1/notifications/${notificationId}`)
        .set("Authorization", `Bearer ${teacherToken}`)
        .send({
          ...updateData,
          title: "Teacher Updated Notification",
        });

      expect(teacherResponse.status).toBe(200);
      expect(teacherResponse.body.success).toBe(true);
      expect(teacherResponse.body.data.title).toBe(
        "Teacher Updated Notification"
      );

      // Test student access (should be denied)
      const studentResponse = await request(app)
        .put(`/api/v1/notifications/${notificationId}`)
        .set("Authorization", `Bearer ${studentToken}`)
        .send(updateData);

      expect(studentResponse.status).toBe(403);
      expect(studentResponse.body.error).toBeDefined();
    });
  });

  describe("DELETE /api/v1/notifications/:id", () => {
    it("should delete notification (admin and teacher only)", async () => {
      // Create a test notification
      const notificationData = {
        title: "Delete Notification",
        message: "Delete notification message",
        type: "INFO",
        recipients: [studentUser.id],
        priority: "MEDIUM",
      };

      const createResponse = await request(app)
        .post("/api/v1/notifications")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(notificationData);

      const notificationId = createResponse.body.data.id;

      // Test admin access
      const adminResponse = await request(app)
        .delete(`/api/v1/notifications/${notificationId}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(adminResponse.status).toBe(200);
      expect(adminResponse.body.success).toBe(true);

      // Create another test notification for teacher test
      const createResponse2 = await request(app)
        .post("/api/v1/notifications")
        .set("Authorization", `Bearer ${teacherToken}`)
        .send({
          ...notificationData,
          title: "Teacher Delete Notification",
        });

      const notificationId2 = createResponse2.body.data.id;

      // Test teacher access
      const teacherResponse = await request(app)
        .delete(`/api/v1/notifications/${notificationId2}`)
        .set("Authorization", `Bearer ${teacherToken}`);

      expect(teacherResponse.status).toBe(200);
      expect(teacherResponse.body.success).toBe(true);

      // Test student access (should be denied)
      const studentResponse = await request(app)
        .delete(`/api/v1/notifications/${notificationId}`)
        .set("Authorization", `Bearer ${studentToken}`);

      expect(studentResponse.status).toBe(403);
      expect(studentResponse.body.error).toBeDefined();
    });
  });

  describe("PUT /api/v1/notifications/:id/read", () => {
    it("should mark notification as read", async () => {
      // Create a test notification
      const notificationData = {
        title: "Read Notification",
        message: "Read notification message",
        type: "INFO",
        recipients: [studentUser.id],
        priority: "MEDIUM",
      };

      const createResponse = await request(app)
        .post("/api/v1/notifications")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(notificationData);

      const notificationId = createResponse.body.data.id;

      // Test student access (recipient)
      const studentResponse = await request(app)
        .put(`/api/v1/notifications/${notificationId}/read`)
        .set("Authorization", `Bearer ${studentToken}`);

      expect(studentResponse.status).toBe(200);
      expect(studentResponse.body.success).toBe(true);
      expect(studentResponse.body.data.read).toBe(true);
      expect(studentResponse.body.data.readAt).toBeDefined();

      // Test admin access
      const adminResponse = await request(app)
        .put(`/api/v1/notifications/${notificationId}/read`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(adminResponse.status).toBe(200);
      expect(adminResponse.body.success).toBe(true);
      expect(adminResponse.body.data.read).toBe(true);

      // Test teacher access
      const teacherResponse = await request(app)
        .put(`/api/v1/notifications/${notificationId}/read`)
        .set("Authorization", `Bearer ${teacherToken}`);

      expect(teacherResponse.status).toBe(200);
      expect(teacherResponse.body.success).toBe(true);
      expect(teacherResponse.body.data.read).toBe(true);
    });
  });

  describe("GET /api/v1/notifications/unread", () => {
    it("should get unread notifications", async () => {
      // Create test notifications
      const notificationData = {
        title: "Unread Notification",
        message: "Unread notification message",
        type: "INFO",
        recipients: [studentUser.id],
        priority: "MEDIUM",
      };

      await request(app)
        .post("/api/v1/notifications")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(notificationData);

      // Test student access (recipient)
      const studentResponse = await request(app)
        .get("/api/v1/notifications/unread")
        .set("Authorization", `Bearer ${studentToken}`);

      expect(studentResponse.status).toBe(200);
      expect(studentResponse.body.success).toBe(true);
      expect(Array.isArray(studentResponse.body.data)).toBe(true);
      expect(studentResponse.body.data.length).toBeGreaterThan(0);
      expect(studentResponse.body.data[0].read).toBe(false);

      // Test admin access
      const adminResponse = await request(app)
        .get("/api/v1/notifications/unread")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(adminResponse.status).toBe(200);
      expect(adminResponse.body.success).toBe(true);
      expect(Array.isArray(adminResponse.body.data)).toBe(true);

      // Test teacher access
      const teacherResponse = await request(app)
        .get("/api/v1/notifications/unread")
        .set("Authorization", `Bearer ${teacherToken}`);

      expect(teacherResponse.status).toBe(200);
      expect(teacherResponse.body.success).toBe(true);
      expect(Array.isArray(teacherResponse.body.data)).toBe(true);
    });
  });
});
