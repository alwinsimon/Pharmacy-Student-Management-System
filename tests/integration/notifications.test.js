const request = require("supertest");
const app = require("../../src/app");
const { createTestUser, generateTestToken } = require("../utils/test.utils");
const { ROLES } = require("../../src/constants/roles.constants");
const { USER_STATUS } = require("../../src/constants/status.constants");
const { NOTIFICATION_STATUS } = require("../../src/constants/status.constants");

describe("Notifications API", () => {
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
    it("should get all notifications for the user", async () => {
      // Create a test notification
      const notificationData = {
        type: "CASE_UPDATE",
        message: "Your case has been updated",
        userId: studentUser.id,
        status: NOTIFICATION_STATUS.UNREAD,
      };

      await request(app)
        .post("/api/v1/notifications")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(notificationData);

      // Test getting notifications
      const response = await request(app)
        .get("/api/v1/notifications")
        .set("Authorization", `Bearer ${studentToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data.notifications)).toBe(true);
      expect(response.body.data.pagination).toBeDefined();
    });

    it("should filter notifications by read status", async () => {
      // Create test notifications
      const notifications = [
        {
          type: "CASE_UPDATE",
          message: "Unread notification",
          userId: studentUser.id,
          status: NOTIFICATION_STATUS.UNREAD,
        },
        {
          type: "DOCUMENT_UPDATE",
          message: "Read notification",
          userId: studentUser.id,
          status: NOTIFICATION_STATUS.READ,
        },
      ];

      await Promise.all(
        notifications.map((notification) =>
          request(app)
            .post("/api/v1/notifications")
            .set("Authorization", `Bearer ${adminToken}`)
            .send(notification)
        )
      );

      // Test getting unread notifications
      const unreadResponse = await request(app)
        .get("/api/v1/notifications?read=false")
        .set("Authorization", `Bearer ${studentToken}`);

      expect(unreadResponse.status).toBe(200);
      expect(unreadResponse.body.success).toBe(true);
      expect(
        unreadResponse.body.data.notifications.every(
          (n) => n.status === NOTIFICATION_STATUS.UNREAD
        )
      ).toBe(true);

      // Test getting read notifications
      const readResponse = await request(app)
        .get("/api/v1/notifications?read=true")
        .set("Authorization", `Bearer ${studentToken}`);

      expect(readResponse.status).toBe(200);
      expect(readResponse.body.success).toBe(true);
      expect(
        readResponse.body.data.notifications.every(
          (n) => n.status === NOTIFICATION_STATUS.READ
        )
      ).toBe(true);
    });
  });

  describe("PUT /api/v1/notifications/:id/read", () => {
    it("should mark notification as read", async () => {
      // Create a test notification
      const notificationData = {
        type: "CASE_UPDATE",
        message: "Test notification",
        userId: studentUser.id,
        status: NOTIFICATION_STATUS.UNREAD,
      };

      const createResponse = await request(app)
        .post("/api/v1/notifications")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(notificationData);

      const notificationId = createResponse.body.data.id;

      // Test marking notification as read
      const response = await request(app)
        .put(`/api/v1/notifications/${notificationId}/read`)
        .set("Authorization", `Bearer ${studentToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      // Verify notification is marked as read
      const getResponse = await request(app)
        .get(`/api/v1/notifications/${notificationId}`)
        .set("Authorization", `Bearer ${studentToken}`);

      expect(getResponse.status).toBe(200);
      expect(getResponse.body.data.status).toBe(NOTIFICATION_STATUS.READ);
    });

    it("should return 404 for non-existent notification", async () => {
      const response = await request(app)
        .put("/api/v1/notifications/507f1f77bcf86cd799439011/read")
        .set("Authorization", `Bearer ${studentToken}`);

      expect(response.status).toBe(404);
      expect(response.body.error).toBeDefined();
    });
  });

  describe("PUT /api/v1/notifications/read-all", () => {
    it("should mark all notifications as read", async () => {
      // Create multiple test notifications
      const notifications = [
        {
          type: "CASE_UPDATE",
          message: "First notification",
          userId: studentUser.id,
          status: NOTIFICATION_STATUS.UNREAD,
        },
        {
          type: "DOCUMENT_UPDATE",
          message: "Second notification",
          userId: studentUser.id,
          status: NOTIFICATION_STATUS.UNREAD,
        },
      ];

      await Promise.all(
        notifications.map((notification) =>
          request(app)
            .post("/api/v1/notifications")
            .set("Authorization", `Bearer ${adminToken}`)
            .send(notification)
        )
      );

      // Test marking all notifications as read
      const response = await request(app)
        .put("/api/v1/notifications/read-all")
        .set("Authorization", `Bearer ${studentToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      // Verify all notifications are marked as read
      const getResponse = await request(app)
        .get("/api/v1/notifications")
        .set("Authorization", `Bearer ${studentToken}`);

      expect(getResponse.status).toBe(200);
      expect(
        getResponse.body.data.notifications.every(
          (n) => n.status === NOTIFICATION_STATUS.READ
        )
      ).toBe(true);
    });
  });
}); 