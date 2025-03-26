const request = require("supertest");
const app = require("../../src/app");
const { createTestUser, generateTestToken } = require("../utils/test.utils");
const { ROLES } = require("../../src/constants/roles.constants");
const { USER_STATUS } = require("../../src/constants/status.constants");

describe("Documents Management API", () => {
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

  describe("GET /api/v1/documents", () => {
    it("should get all documents (admin and teacher only)", async () => {
      // Create a test document
      const documentData = {
        title: "Test Document",
        description: "Test document description",
        type: "PDF",
        category: "ACADEMIC",
        uploadedBy: adminUser.id,
        fileUrl: "https://example.com/test.pdf",
        metadata: {
          courseId: "123",
          semester: 1,
        },
      };

      await request(app)
        .post("/api/v1/documents")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(documentData);

      // Test admin access
      const adminResponse = await request(app)
        .get("/api/v1/documents")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(adminResponse.status).toBe(200);
      expect(adminResponse.body.success).toBe(true);
      expect(Array.isArray(adminResponse.body.data)).toBe(true);

      // Test teacher access
      const teacherResponse = await request(app)
        .get("/api/v1/documents")
        .set("Authorization", `Bearer ${teacherToken}`);

      expect(teacherResponse.status).toBe(200);
      expect(teacherResponse.body.success).toBe(true);
      expect(Array.isArray(teacherResponse.body.data)).toBe(true);

      // Test student access (should be denied)
      const studentResponse = await request(app)
        .get("/api/v1/documents")
        .set("Authorization", `Bearer ${studentToken}`);

      expect(studentResponse.status).toBe(403);
      expect(studentResponse.body.error).toBeDefined();
    });
  });

  describe("GET /api/v1/documents/:id", () => {
    it("should get document by ID (admin, teacher, and student)", async () => {
      // Create a test document
      const documentData = {
        title: "Test Document",
        description: "Test document description",
        type: "PDF",
        category: "ACADEMIC",
        uploadedBy: adminUser.id,
        fileUrl: "https://example.com/test.pdf",
        metadata: {
          courseId: "123",
          semester: 1,
        },
      };

      const createResponse = await request(app)
        .post("/api/v1/documents")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(documentData);

      const documentId = createResponse.body.data.id;

      // Test admin access
      const adminResponse = await request(app)
        .get(`/api/v1/documents/${documentId}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(adminResponse.status).toBe(200);
      expect(adminResponse.body.success).toBe(true);
      expect(adminResponse.body.data.id).toBe(documentId);

      // Test teacher access
      const teacherResponse = await request(app)
        .get(`/api/v1/documents/${documentId}`)
        .set("Authorization", `Bearer ${teacherToken}`);

      expect(teacherResponse.status).toBe(200);
      expect(teacherResponse.body.success).toBe(true);
      expect(teacherResponse.body.data.id).toBe(documentId);

      // Test student access
      const studentResponse = await request(app)
        .get(`/api/v1/documents/${documentId}`)
        .set("Authorization", `Bearer ${studentToken}`);

      expect(studentResponse.status).toBe(200);
      expect(studentResponse.body.success).toBe(true);
      expect(studentResponse.body.data.id).toBe(documentId);
    });

    it("should return 404 for non-existent document", async () => {
      const response = await request(app)
        .get("/api/v1/documents/507f1f77bcf86cd799439011")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
      expect(response.body.error).toBeDefined();
    });
  });

  describe("POST /api/v1/documents", () => {
    it("should create new document (admin and teacher only)", async () => {
      const documentData = {
        title: "New Document",
        description: "New document description",
        type: "PDF",
        category: "ACADEMIC",
        fileUrl: "https://example.com/new.pdf",
        metadata: {
          courseId: "123",
          semester: 1,
        },
      };

      // Test admin access
      const adminResponse = await request(app)
        .post("/api/v1/documents")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(documentData);

      expect(adminResponse.status).toBe(201);
      expect(adminResponse.body.success).toBe(true);
      expect(adminResponse.body.data.title).toBe(documentData.title);
      expect(adminResponse.body.data.type).toBe(documentData.type);
      expect(adminResponse.body.data.category).toBe(documentData.category);

      // Test teacher access
      const teacherResponse = await request(app)
        .post("/api/v1/documents")
        .set("Authorization", `Bearer ${teacherToken}`)
        .send({
          ...documentData,
          title: "Teacher Document",
        });

      expect(teacherResponse.status).toBe(201);
      expect(teacherResponse.body.success).toBe(true);
      expect(teacherResponse.body.data.title).toBe("Teacher Document");

      // Test student access (should be denied)
      const studentResponse = await request(app)
        .post("/api/v1/documents")
        .set("Authorization", `Bearer ${studentToken}`)
        .send(documentData);

      expect(studentResponse.status).toBe(403);
      expect(studentResponse.body.error).toBeDefined();
    });

    it("should return 400 for invalid document data", async () => {
      const invalidDocumentData = {
        title: "", // Invalid empty title
        type: "INVALID_TYPE", // Invalid type
        category: "INVALID_CATEGORY", // Invalid category
        fileUrl: "invalid-url", // Invalid URL
      };

      const response = await request(app)
        .post("/api/v1/documents")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(invalidDocumentData);

      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
    });
  });

  describe("PUT /api/v1/documents/:id", () => {
    it("should update document (admin and teacher only)", async () => {
      // Create a test document
      const documentData = {
        title: "Update Document",
        description: "Update document description",
        type: "PDF",
        category: "ACADEMIC",
        uploadedBy: adminUser.id,
        fileUrl: "https://example.com/update.pdf",
        metadata: {
          courseId: "123",
          semester: 1,
        },
      };

      const createResponse = await request(app)
        .post("/api/v1/documents")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(documentData);

      const documentId = createResponse.body.data.id;

      const updateData = {
        title: "Updated Document",
        description: "Updated document description",
        category: "RESEARCH",
        metadata: {
          courseId: "456",
          semester: 2,
        },
      };

      // Test admin access
      const adminResponse = await request(app)
        .put(`/api/v1/documents/${documentId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send(updateData);

      expect(adminResponse.status).toBe(200);
      expect(adminResponse.body.success).toBe(true);
      expect(adminResponse.body.data.title).toBe(updateData.title);
      expect(adminResponse.body.data.category).toBe(updateData.category);
      expect(adminResponse.body.data.metadata).toEqual(updateData.metadata);

      // Test teacher access
      const teacherResponse = await request(app)
        .put(`/api/v1/documents/${documentId}`)
        .set("Authorization", `Bearer ${teacherToken}`)
        .send({
          ...updateData,
          title: "Teacher Updated Document",
        });

      expect(teacherResponse.status).toBe(200);
      expect(teacherResponse.body.success).toBe(true);
      expect(teacherResponse.body.data.title).toBe("Teacher Updated Document");

      // Test student access (should be denied)
      const studentResponse = await request(app)
        .put(`/api/v1/documents/${documentId}`)
        .set("Authorization", `Bearer ${studentToken}`)
        .send(updateData);

      expect(studentResponse.status).toBe(403);
      expect(studentResponse.body.error).toBeDefined();
    });
  });

  describe("DELETE /api/v1/documents/:id", () => {
    it("should delete document (admin and teacher only)", async () => {
      // Create a test document
      const documentData = {
        title: "Delete Document",
        description: "Delete document description",
        type: "PDF",
        category: "ACADEMIC",
        uploadedBy: adminUser.id,
        fileUrl: "https://example.com/delete.pdf",
        metadata: {
          courseId: "123",
          semester: 1,
        },
      };

      const createResponse = await request(app)
        .post("/api/v1/documents")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(documentData);

      const documentId = createResponse.body.data.id;

      // Test admin access
      const adminResponse = await request(app)
        .delete(`/api/v1/documents/${documentId}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(adminResponse.status).toBe(200);
      expect(adminResponse.body.success).toBe(true);

      // Create another test document for teacher test
      const createResponse2 = await request(app)
        .post("/api/v1/documents")
        .set("Authorization", `Bearer ${teacherToken}`)
        .send({
          ...documentData,
          title: "Teacher Delete Document",
        });

      const documentId2 = createResponse2.body.data.id;

      // Test teacher access
      const teacherResponse = await request(app)
        .delete(`/api/v1/documents/${documentId2}`)
        .set("Authorization", `Bearer ${teacherToken}`);

      expect(teacherResponse.status).toBe(200);
      expect(teacherResponse.body.success).toBe(true);

      // Test student access (should be denied)
      const studentResponse = await request(app)
        .delete(`/api/v1/documents/${documentId}`)
        .set("Authorization", `Bearer ${studentToken}`);

      expect(studentResponse.status).toBe(403);
      expect(studentResponse.body.error).toBeDefined();
    });
  });

  describe("GET /api/v1/documents/category/:category", () => {
    it("should get documents by category (admin, teacher, and student)", async () => {
      const category = "ACADEMIC";

      // Create test documents
      const documentData = {
        title: "Category Document",
        description: "Category document description",
        type: "PDF",
        category: category,
        uploadedBy: adminUser.id,
        fileUrl: "https://example.com/category.pdf",
        metadata: {
          courseId: "123",
          semester: 1,
        },
      };

      await request(app)
        .post("/api/v1/documents")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(documentData);

      // Test admin access
      const adminResponse = await request(app)
        .get(`/api/v1/documents/category/${category}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(adminResponse.status).toBe(200);
      expect(adminResponse.body.success).toBe(true);
      expect(Array.isArray(adminResponse.body.data)).toBe(true);
      expect(adminResponse.body.data[0].category).toBe(category);

      // Test teacher access
      const teacherResponse = await request(app)
        .get(`/api/v1/documents/category/${category}`)
        .set("Authorization", `Bearer ${teacherToken}`);

      expect(teacherResponse.status).toBe(200);
      expect(teacherResponse.body.success).toBe(true);
      expect(Array.isArray(teacherResponse.body.data)).toBe(true);

      // Test student access
      const studentResponse = await request(app)
        .get(`/api/v1/documents/category/${category}`)
        .set("Authorization", `Bearer ${studentToken}`);

      expect(studentResponse.status).toBe(200);
      expect(studentResponse.body.success).toBe(true);
      expect(Array.isArray(studentResponse.body.data)).toBe(true);
    });
  });

  describe("GET /api/v1/documents/search", () => {
    it("should search documents (admin, teacher, and student)", async () => {
      const searchQuery = "test";

      // Create test documents
      const documentData = {
        title: "Test Search Document",
        description: "Test search document description",
        type: "PDF",
        category: "ACADEMIC",
        uploadedBy: adminUser.id,
        fileUrl: "https://example.com/search.pdf",
        metadata: {
          courseId: "123",
          semester: 1,
        },
      };

      await request(app)
        .post("/api/v1/documents")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(documentData);

      // Test admin access
      const adminResponse = await request(app)
        .get(`/api/v1/documents/search?q=${searchQuery}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(adminResponse.status).toBe(200);
      expect(adminResponse.body.success).toBe(true);
      expect(Array.isArray(adminResponse.body.data)).toBe(true);
      expect(adminResponse.body.data[0].title).toContain(searchQuery);

      // Test teacher access
      const teacherResponse = await request(app)
        .get(`/api/v1/documents/search?q=${searchQuery}`)
        .set("Authorization", `Bearer ${teacherToken}`);

      expect(teacherResponse.status).toBe(200);
      expect(teacherResponse.body.success).toBe(true);
      expect(Array.isArray(teacherResponse.body.data)).toBe(true);

      // Test student access
      const studentResponse = await request(app)
        .get(`/api/v1/documents/search?q=${searchQuery}`)
        .set("Authorization", `Bearer ${studentToken}`);

      expect(studentResponse.status).toBe(200);
      expect(studentResponse.body.success).toBe(true);
      expect(Array.isArray(studentResponse.body.data)).toBe(true);
    });
  });
});
