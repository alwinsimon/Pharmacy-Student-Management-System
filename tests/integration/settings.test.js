const request = require("supertest");
const app = require("../../src/app");
const { createTestUser, generateTestToken } = require("../utils/test.utils");
const { ROLES } = require("../../src/constants/roles.constants");
const { USER_STATUS } = require("../../src/constants/status.constants");

describe("Settings Management API", () => {
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

  describe("GET /api/v1/settings", () => {
    it("should get system settings (admin only)", async () => {
      // Test admin access
      const adminResponse = await request(app)
        .get("/api/v1/settings")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(adminResponse.status).toBe(200);
      expect(adminResponse.body.success).toBe(true);
      expect(adminResponse.body.data).toHaveProperty("systemSettings");
      expect(adminResponse.body.data).toHaveProperty("emailSettings");
      expect(adminResponse.body.data).toHaveProperty("notificationSettings");
      expect(adminResponse.body.data).toHaveProperty("securitySettings");

      // Test teacher access (should be denied)
      const teacherResponse = await request(app)
        .get("/api/v1/settings")
        .set("Authorization", `Bearer ${teacherToken}`);

      expect(teacherResponse.status).toBe(403);
      expect(teacherResponse.body.error).toBeDefined();

      // Test student access (should be denied)
      const studentResponse = await request(app)
        .get("/api/v1/settings")
        .set("Authorization", `Bearer ${studentToken}`);

      expect(studentResponse.status).toBe(403);
      expect(studentResponse.body.error).toBeDefined();
    });
  });

  describe("PUT /api/v1/settings", () => {
    it("should update system settings (admin only)", async () => {
      const settingsData = {
        systemSettings: {
          siteName: "Updated Site Name",
          siteDescription: "Updated Site Description",
          timezone: "UTC",
          dateFormat: "YYYY-MM-DD",
          language: "en",
        },
        emailSettings: {
          smtpHost: "smtp.example.com",
          smtpPort: 587,
          smtpUser: "user@example.com",
          smtpPass: "password123",
          fromEmail: "noreply@example.com",
          fromName: "System Admin",
        },
        notificationSettings: {
          emailNotifications: true,
          pushNotifications: true,
          smsNotifications: false,
          notificationFrequency: "DAILY",
        },
        securitySettings: {
          passwordMinLength: 8,
          requireSpecialChars: true,
          requireNumbers: true,
          sessionTimeout: 3600,
          maxLoginAttempts: 5,
        },
      };

      // Test admin access
      const adminResponse = await request(app)
        .put("/api/v1/settings")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(settingsData);

      expect(adminResponse.status).toBe(200);
      expect(adminResponse.body.success).toBe(true);
      expect(adminResponse.body.data.systemSettings).toEqual(
        settingsData.systemSettings
      );
      expect(adminResponse.body.data.emailSettings).toEqual(
        settingsData.emailSettings
      );
      expect(adminResponse.body.data.notificationSettings).toEqual(
        settingsData.notificationSettings
      );
      expect(adminResponse.body.data.securitySettings).toEqual(
        settingsData.securitySettings
      );

      // Test teacher access (should be denied)
      const teacherResponse = await request(app)
        .put("/api/v1/settings")
        .set("Authorization", `Bearer ${teacherToken}`)
        .send(settingsData);

      expect(teacherResponse.status).toBe(403);
      expect(teacherResponse.body.error).toBeDefined();

      // Test student access (should be denied)
      const studentResponse = await request(app)
        .put("/api/v1/settings")
        .set("Authorization", `Bearer ${studentToken}`)
        .send(settingsData);

      expect(studentResponse.status).toBe(403);
      expect(studentResponse.body.error).toBeDefined();
    });

    it("should return 400 for invalid settings data", async () => {
      const invalidSettingsData = {
        systemSettings: {
          siteName: "", // Invalid empty site name
          timezone: "INVALID_TIMEZONE", // Invalid timezone
        },
        emailSettings: {
          smtpPort: "invalid_port", // Invalid port type
        },
      };

      const response = await request(app)
        .put("/api/v1/settings")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(invalidSettingsData);

      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
    });
  });

  describe("GET /api/v1/settings/user", () => {
    it("should get user settings (all roles)", async () => {
      // Test admin access
      const adminResponse = await request(app)
        .get("/api/v1/settings/user")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(adminResponse.status).toBe(200);
      expect(adminResponse.body.success).toBe(true);
      expect(adminResponse.body.data).toHaveProperty("preferences");
      expect(adminResponse.body.data).toHaveProperty("notifications");
      expect(adminResponse.body.data).toHaveProperty("theme");

      // Test teacher access
      const teacherResponse = await request(app)
        .get("/api/v1/settings/user")
        .set("Authorization", `Bearer ${teacherToken}`);

      expect(teacherResponse.status).toBe(200);
      expect(teacherResponse.body.success).toBe(true);
      expect(teacherResponse.body.data).toHaveProperty("preferences");

      // Test student access
      const studentResponse = await request(app)
        .get("/api/v1/settings/user")
        .set("Authorization", `Bearer ${studentToken}`);

      expect(studentResponse.status).toBe(200);
      expect(studentResponse.body.success).toBe(true);
      expect(studentResponse.body.data).toHaveProperty("preferences");
    });
  });

  describe("PUT /api/v1/settings/user", () => {
    it("should update user settings (all roles)", async () => {
      const userSettingsData = {
        preferences: {
          language: "en",
          timezone: "UTC",
          dateFormat: "YYYY-MM-DD",
          theme: "light",
        },
        notifications: {
          email: true,
          push: true,
          sms: false,
          frequency: "DAILY",
        },
      };

      // Test admin access
      const adminResponse = await request(app)
        .put("/api/v1/settings/user")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(userSettingsData);

      expect(adminResponse.status).toBe(200);
      expect(adminResponse.body.success).toBe(true);
      expect(adminResponse.body.data.preferences).toEqual(
        userSettingsData.preferences
      );
      expect(adminResponse.body.data.notifications).toEqual(
        userSettingsData.notifications
      );

      // Test teacher access
      const teacherResponse = await request(app)
        .put("/api/v1/settings/user")
        .set("Authorization", `Bearer ${teacherToken}`)
        .send(userSettingsData);

      expect(teacherResponse.status).toBe(200);
      expect(teacherResponse.body.success).toBe(true);
      expect(teacherResponse.body.data.preferences).toEqual(
        userSettingsData.preferences
      );

      // Test student access
      const studentResponse = await request(app)
        .put("/api/v1/settings/user")
        .set("Authorization", `Bearer ${studentToken}`)
        .send(userSettingsData);

      expect(studentResponse.status).toBe(200);
      expect(studentResponse.body.success).toBe(true);
      expect(studentResponse.body.data.preferences).toEqual(
        userSettingsData.preferences
      );
    });

    it("should return 400 for invalid user settings data", async () => {
      const invalidUserSettingsData = {
        preferences: {
          language: "INVALID_LANGUAGE", // Invalid language
          timezone: "INVALID_TIMEZONE", // Invalid timezone
        },
      };

      const response = await request(app)
        .put("/api/v1/settings/user")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(invalidUserSettingsData);

      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
    });
  });

  describe("GET /api/v1/settings/email", () => {
    it("should get email settings (admin only)", async () => {
      // Test admin access
      const adminResponse = await request(app)
        .get("/api/v1/settings/email")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(adminResponse.status).toBe(200);
      expect(adminResponse.body.success).toBe(true);
      expect(adminResponse.body.data).toHaveProperty("smtpHost");
      expect(adminResponse.body.data).toHaveProperty("smtpPort");
      expect(adminResponse.body.data).toHaveProperty("fromEmail");
      expect(adminResponse.body.data).toHaveProperty("fromName");

      // Test teacher access (should be denied)
      const teacherResponse = await request(app)
        .get("/api/v1/settings/email")
        .set("Authorization", `Bearer ${teacherToken}`);

      expect(teacherResponse.status).toBe(403);
      expect(teacherResponse.body.error).toBeDefined();

      // Test student access (should be denied)
      const studentResponse = await request(app)
        .get("/api/v1/settings/email")
        .set("Authorization", `Bearer ${studentToken}`);

      expect(studentResponse.status).toBe(403);
      expect(studentResponse.body.error).toBeDefined();
    });
  });

  describe("PUT /api/v1/settings/email", () => {
    it("should update email settings (admin only)", async () => {
      const emailSettingsData = {
        smtpHost: "smtp.example.com",
        smtpPort: 587,
        smtpUser: "user@example.com",
        smtpPass: "password123",
        fromEmail: "noreply@example.com",
        fromName: "System Admin",
        templates: {
          welcome: "Welcome to our system!",
          resetPassword: "Reset your password here.",
          notification: "New notification received.",
        },
      };

      // Test admin access
      const adminResponse = await request(app)
        .put("/api/v1/settings/email")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(emailSettingsData);

      expect(adminResponse.status).toBe(200);
      expect(adminResponse.body.success).toBe(true);
      expect(adminResponse.body.data).toEqual(emailSettingsData);

      // Test teacher access (should be denied)
      const teacherResponse = await request(app)
        .put("/api/v1/settings/email")
        .set("Authorization", `Bearer ${teacherToken}`)
        .send(emailSettingsData);

      expect(teacherResponse.status).toBe(403);
      expect(teacherResponse.body.error).toBeDefined();

      // Test student access (should be denied)
      const studentResponse = await request(app)
        .put("/api/v1/settings/email")
        .set("Authorization", `Bearer ${studentToken}`)
        .send(emailSettingsData);

      expect(studentResponse.status).toBe(403);
      expect(studentResponse.body.error).toBeDefined();
    });

    it("should return 400 for invalid email settings data", async () => {
      const invalidEmailSettingsData = {
        smtpHost: "", // Invalid empty host
        smtpPort: "invalid_port", // Invalid port type
        fromEmail: "invalid_email", // Invalid email format
      };

      const response = await request(app)
        .put("/api/v1/settings/email")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(invalidEmailSettingsData);

      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
    });
  });

  describe("GET /api/v1/settings/security", () => {
    it("should get security settings (admin only)", async () => {
      // Test admin access
      const adminResponse = await request(app)
        .get("/api/v1/settings/security")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(adminResponse.status).toBe(200);
      expect(adminResponse.body.success).toBe(true);
      expect(adminResponse.body.data).toHaveProperty("passwordPolicy");
      expect(adminResponse.body.data).toHaveProperty("sessionSettings");
      expect(adminResponse.body.data).toHaveProperty("authenticationSettings");
      expect(adminResponse.body.data).toHaveProperty("accessControl");

      // Test teacher access (should be denied)
      const teacherResponse = await request(app)
        .get("/api/v1/settings/security")
        .set("Authorization", `Bearer ${teacherToken}`);

      expect(teacherResponse.status).toBe(403);
      expect(teacherResponse.body.error).toBeDefined();

      // Test student access (should be denied)
      const studentResponse = await request(app)
        .get("/api/v1/settings/security")
        .set("Authorization", `Bearer ${studentToken}`);

      expect(studentResponse.status).toBe(403);
      expect(studentResponse.body.error).toBeDefined();
    });
  });

  describe("PUT /api/v1/settings/security", () => {
    it("should update security settings (admin only)", async () => {
      const securitySettingsData = {
        passwordPolicy: {
          minLength: 8,
          requireSpecialChars: true,
          requireNumbers: true,
          requireUppercase: true,
          requireLowercase: true,
          maxAge: 90,
        },
        sessionSettings: {
          timeout: 3600,
          maxConcurrent: 3,
          rememberMe: true,
        },
        authenticationSettings: {
          twoFactor: true,
          socialLogin: true,
          allowedProviders: ["google", "facebook"],
        },
        accessControl: {
          ipWhitelist: ["192.168.1.1"],
          allowedDomains: ["example.com"],
          maxLoginAttempts: 5,
          lockoutDuration: 30,
        },
      };

      // Test admin access
      const adminResponse = await request(app)
        .put("/api/v1/settings/security")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(securitySettingsData);

      expect(adminResponse.status).toBe(200);
      expect(adminResponse.body.success).toBe(true);
      expect(adminResponse.body.data).toEqual(securitySettingsData);

      // Test teacher access (should be denied)
      const teacherResponse = await request(app)
        .put("/api/v1/settings/security")
        .set("Authorization", `Bearer ${teacherToken}`)
        .send(securitySettingsData);

      expect(teacherResponse.status).toBe(403);
      expect(teacherResponse.body.error).toBeDefined();

      // Test student access (should be denied)
      const studentResponse = await request(app)
        .put("/api/v1/settings/security")
        .set("Authorization", `Bearer ${studentToken}`)
        .send(securitySettingsData);

      expect(studentResponse.status).toBe(403);
      expect(studentResponse.body.error).toBeDefined();
    });

    it("should return 400 for invalid security settings data", async () => {
      const invalidSecuritySettingsData = {
        passwordPolicy: {
          minLength: -1, // Invalid negative length
          maxAge: "invalid_age", // Invalid age type
        },
        sessionSettings: {
          timeout: "invalid_timeout", // Invalid timeout type
        },
      };

      const response = await request(app)
        .put("/api/v1/settings/security")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(invalidSecuritySettingsData);

      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
    });
  });
});
