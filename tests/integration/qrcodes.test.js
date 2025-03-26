const request = require("supertest");
const app = require("../../src/app");
const { createTestUser, generateTestToken } = require("../utils/test.utils");
const { ROLES } = require("../../src/constants/roles.constants");
const { USER_STATUS } = require("../../src/constants/status.constants");

describe("QR Codes API", () => {
  let adminToken;
  let teacherToken;
  let studentToken;
  let adminUser;
  let teacherUser;
  let studentUser;
  let qrCode;

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

    // Generate a test QR code
    const qrCodeData = {
      resourceType: "DOCUMENT",
      resourceId: "123",
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours from now
      metadata: {
        title: "Test Document",
        description: "Test document description",
      },
    };

    const generateResponse = await request(app)
      .post("/api/v1/qrcodes/generate")
      .set("Authorization", `Bearer ${adminToken}`)
      .send(qrCodeData);

    qrCode = generateResponse.body.data;
  });

  describe("GET /api/v1/qrcodes/:code", () => {
    it("should access resource via QR code (public access)", async () => {
      // Test with valid QR code
      const response = await request(app).get(`/api/v1/qrcodes/${qrCode.code}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.resourceType).toBe("DOCUMENT");
      expect(response.body.data.resourceId).toBe("123");

      // Test with invalid QR code
      const invalidResponse = await request(app).get(
        "/api/v1/qrcodes/invalid-code"
      );

      expect(invalidResponse.status).toBe(404);
      expect(invalidResponse.body.error).toBeDefined();
    });

    it("should handle expired QR codes", async () => {
      // Generate an expired QR code
      const expiredQRCodeData = {
        resourceType: "DOCUMENT",
        resourceId: "456",
        expiresAt: new Date(Date.now() - 1000).toISOString(), // Expired
        metadata: {
          title: "Expired Document",
          description: "Expired document description",
        },
      };

      const generateResponse = await request(app)
        .post("/api/v1/qrcodes/generate")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(expiredQRCodeData);

      const expiredQRCode = generateResponse.body.data;

      const response = await request(app).get(
        `/api/v1/qrcodes/${expiredQRCode.code}`
      );

      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
      expect(response.body.error.message).toContain("expired");
    });
  });

  describe("GET /api/v1/qrcodes/:code/info", () => {
    it("should get QR code information without accessing the resource (public access)", async () => {
      // Test with valid QR code
      const response = await request(app).get(
        `/api/v1/qrcodes/${qrCode.code}/info`
      );

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.code).toBe(qrCode.code);
      expect(response.body.data.resourceType).toBe("DOCUMENT");
      expect(response.body.data.resourceId).toBe("123");
      expect(response.body.data.metadata).toBeDefined();
      expect(response.body.data.metadata.title).toBe("Test Document");

      // Test with invalid QR code
      const invalidResponse = await request(app).get(
        "/api/v1/qrcodes/invalid-code/info"
      );

      expect(invalidResponse.status).toBe(404);
      expect(invalidResponse.body.error).toBeDefined();
    });
  });

  describe("POST /api/v1/qrcodes/generate", () => {
    it("should generate QR code for a resource (authenticated users only)", async () => {
      const qrCodeData = {
        resourceType: "DOCUMENT",
        resourceId: "789",
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        metadata: {
          title: "New Document",
          description: "New document description",
        },
      };

      // Test admin access
      const adminResponse = await request(app)
        .post("/api/v1/qrcodes/generate")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(qrCodeData);

      expect(adminResponse.status).toBe(201);
      expect(adminResponse.body.success).toBe(true);
      expect(adminResponse.body.data).toBeDefined();
      expect(adminResponse.body.data.code).toBeDefined();
      expect(adminResponse.body.data.resourceType).toBe(
        qrCodeData.resourceType
      );
      expect(adminResponse.body.data.resourceId).toBe(qrCodeData.resourceId);

      // Test teacher access
      const teacherResponse = await request(app)
        .post("/api/v1/qrcodes/generate")
        .set("Authorization", `Bearer ${teacherToken}`)
        .send({
          ...qrCodeData,
          resourceId: "790",
        });

      expect(teacherResponse.status).toBe(201);
      expect(teacherResponse.body.success).toBe(true);
      expect(teacherResponse.body.data).toBeDefined();

      // Test student access
      const studentResponse = await request(app)
        .post("/api/v1/qrcodes/generate")
        .set("Authorization", `Bearer ${studentToken}`)
        .send({
          ...qrCodeData,
          resourceId: "791",
        });

      expect(studentResponse.status).toBe(201);
      expect(studentResponse.body.success).toBe(true);
      expect(studentResponse.body.data).toBeDefined();

      // Test without authentication
      const unauthenticatedResponse = await request(app)
        .post("/api/v1/qrcodes/generate")
        .send(qrCodeData);

      expect(unauthenticatedResponse.status).toBe(401);
      expect(unauthenticatedResponse.body.error).toBeDefined();
    });

    it("should validate QR code generation data", async () => {
      const invalidData = {
        resourceType: "INVALID_TYPE", // Invalid resource type
        resourceId: "", // Empty resource ID
        expiresAt: "invalid-date", // Invalid date format
        metadata: {
          title: "", // Empty title
        },
      };

      const response = await request(app)
        .post("/api/v1/qrcodes/generate")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
    });
  });

  describe("GET /api/v1/qrcodes/resource/:resourceType/:resourceId", () => {
    it("should get QR code for a specific resource (authenticated users only)", async () => {
      // Test admin access
      const adminResponse = await request(app)
        .get(`/api/v1/qrcodes/resource/DOCUMENT/123`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(adminResponse.status).toBe(200);
      expect(adminResponse.body.success).toBe(true);
      expect(adminResponse.body.data).toBeDefined();
      expect(adminResponse.body.data.code).toBeDefined();
      expect(adminResponse.body.data.resourceType).toBe("DOCUMENT");
      expect(adminResponse.body.data.resourceId).toBe("123");

      // Test teacher access
      const teacherResponse = await request(app)
        .get(`/api/v1/qrcodes/resource/DOCUMENT/123`)
        .set("Authorization", `Bearer ${teacherToken}`);

      expect(teacherResponse.status).toBe(200);
      expect(teacherResponse.body.success).toBe(true);
      expect(teacherResponse.body.data).toBeDefined();

      // Test student access
      const studentResponse = await request(app)
        .get(`/api/v1/qrcodes/resource/DOCUMENT/123`)
        .set("Authorization", `Bearer ${studentToken}`);

      expect(studentResponse.status).toBe(200);
      expect(studentResponse.body.success).toBe(true);
      expect(studentResponse.body.data).toBeDefined();

      // Test without authentication
      const unauthenticatedResponse = await request(app).get(
        `/api/v1/qrcodes/resource/DOCUMENT/123`
      );

      expect(unauthenticatedResponse.status).toBe(401);
      expect(unauthenticatedResponse.body.error).toBeDefined();
    });

    it("should handle non-existent resources", async () => {
      const response = await request(app)
        .get(`/api/v1/qrcodes/resource/DOCUMENT/999999`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
      expect(response.body.error).toBeDefined();
    });

    it("should handle invalid resource types", async () => {
      const response = await request(app)
        .get(`/api/v1/qrcodes/resource/INVALID_TYPE/123`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
    });
  });
});
