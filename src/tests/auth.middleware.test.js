const { authenticate, authorize, checkPermission } = require('../api/v1/middleware/auth.middleware');
const { AuthenticationError, AuthorizationError } = require('../api/v1/middleware/error.middleware');
const { testUtils } = require('./setup');
const User = require('../models/user.model');

describe('Authentication Middleware', () => {
  let user;
  let token;
  let req;
  let res;
  let next;

  beforeEach(() => {
    req = testUtils.mockRequest();
    res = testUtils.mockResponse();
    next = testUtils.mockNext();
  });

  describe('authenticate', () => {
    it('should throw error if no token provided', async () => {
      await authenticate(req, res, next);

      expect(next).toHaveBeenCalledWith(
        expect.any(AuthenticationError)
      );
    });

    it('should throw error if token is invalid', async () => {
      req.headers.authorization = 'Bearer invalid-token';
      await authenticate(req, res, next);

      expect(next).toHaveBeenCalledWith(
        expect.any(AuthenticationError)
      );
    });

    it('should attach user to request if token is valid', async () => {
      user = await testUtils.createTestUser(User);
      token = testUtils.createTestToken(user._id, user.role);
      req.headers.authorization = `Bearer ${token}`;

      await authenticate(req, res, next);

      expect(req.user).toBeDefined();
      expect(req.user._id.toString()).toBe(user._id.toString());
      expect(next).toHaveBeenCalledWith();
    });
  });

  describe('authorize', () => {
    it('should throw error if user is not authenticated', () => {
      const middleware = authorize('admin');
      middleware(req, res, next);

      expect(next).toHaveBeenCalledWith(
        expect.any(AuthenticationError)
      );
    });

    it('should throw error if user role is not authorized', () => {
      req.user = { role: 'student' };
      const middleware = authorize('admin');
      middleware(req, res, next);

      expect(next).toHaveBeenCalledWith(
        expect.any(AuthorizationError)
      );
    });

    it('should allow access if user role is authorized', () => {
      req.user = { role: 'admin' };
      const middleware = authorize('admin');
      middleware(req, res, next);

      expect(next).toHaveBeenCalledWith();
    });
  });

  describe('checkPermission', () => {
    it('should throw error if user is not authenticated', () => {
      const middleware = checkPermission('read:users');
      middleware(req, res, next);

      expect(next).toHaveBeenCalledWith(
        expect.any(AuthenticationError)
      );
    });

    it('should throw error if user does not have permission', () => {
      req.user = { role: 'student' };
      const middleware = checkPermission('write:users');
      middleware(req, res, next);

      expect(next).toHaveBeenCalledWith(
        expect.any(AuthorizationError)
      );
    });

    it('should allow access if user has permission', () => {
      req.user = { role: 'admin' };
      const middleware = checkPermission('read:users');
      middleware(req, res, next);

      expect(next).toHaveBeenCalledWith();
    });
  });
}); 