/**
 * Unit Tests for Auth Middleware
 * Tests authentication and authorization middleware functions
 */

const { describe, test, expect, beforeEach, jest } = require('@jest/globals');
const { StatusCodes } = require('http-status-codes');
const jwt = require('jsonwebtoken');

// Import middleware
const { protect, authorize } = require('../middleware/auth');

// Mock jwt
jest.mock('jsonwebtoken');

describe('Auth Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Setup mock request, response, and next
    req = {
      headers: {},
      user: null
    };
    
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    
    next = jest.fn();
  });

  describe('protect middleware', () => {
    test('should successfully authenticate user with valid token', async () => {
      // Arrange
      const token = 'valid_jwt_token';
      const payload = {
        id: global.testUtils.mockUser._id,
        role: global.testUtils.mockUser.role,
        email: global.testUtils.mockUser.email,
        name: global.testUtils.mockUser.name
      };

      req.headers.authorization = `Bearer ${token}`;
      jwt.verify.mockReturnValue(payload);

      // Act
      await protect(req, res, next);

      // Assert
      expect(jwt.verify).toHaveBeenCalledWith(token, process.env.JWT_SECRET);
      expect(req.user).toEqual({
        id: payload.id,
        _id: payload.id,
        role: payload.role,
        email: payload.email,
        name: payload.name
      });
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    test('should return error when no token provided', async () => {
      // Arrange
      req.headers.authorization = undefined;

      // Act
      await protect(req, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        status: false,
        message: "Access token is required. Please provide a valid Bearer token in the Authorization header"
      });
      expect(next).not.toHaveBeenCalled();
    });

    test('should return error when token does not start with Bearer', async () => {
      // Arrange
      req.headers.authorization = 'InvalidTokenFormat';

      // Act
      await protect(req, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        status: false,
        message: "Access token is required. Please provide a valid Bearer token in the Authorization header"
      });
      expect(next).not.toHaveBeenCalled();
    });

    test('should return error when token payload is missing id', async () => {
      // Arrange
      const token = 'valid_jwt_token';
      const invalidPayload = { role: 'talent' }; // Missing id

      req.headers.authorization = `Bearer ${token}`;
      jwt.verify.mockReturnValue(invalidPayload);

      // Act
      await protect(req, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(StatusCodes.UNAUTHORIZED);
      expect(res.json).toHaveBeenCalledWith({
        status: false,
        message: "Invalid Token: Missing required fields in token payload"
      });
      expect(next).not.toHaveBeenCalled();
    });

    test('should return error when token payload is missing role', async () => {
      // Arrange
      const token = 'valid_jwt_token';
      const invalidPayload = { id: 'user_id' }; // Missing role

      req.headers.authorization = `Bearer ${token}`;
      jwt.verify.mockReturnValue(invalidPayload);

      // Act
      await protect(req, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(StatusCodes.UNAUTHORIZED);
      expect(res.json).toHaveBeenCalledWith({
        status: false,
        message: "Invalid Token: Missing required fields in token payload"
      });
      expect(next).not.toHaveBeenCalled();
    });

    test('should handle JsonWebTokenError', async () => {
      // Arrange
      const token = 'invalid_jwt_token';
      req.headers.authorization = `Bearer ${token}`;
      
      const jwtError = new Error('Invalid token');
      jwtError.name = 'JsonWebTokenError';
      jwt.verify.mockImplementation(() => {
        throw jwtError;
      });

      // Act
      await protect(req, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        status: false,
        message: "Invalid token format"
      });
      expect(next).not.toHaveBeenCalled();
    });

    test('should handle TokenExpiredError', async () => {
      // Arrange
      const token = 'expired_jwt_token';
      req.headers.authorization = `Bearer ${token}`;
      
      const jwtError = new Error('Token expired');
      jwtError.name = 'TokenExpiredError';
      jwt.verify.mockImplementation(() => {
        throw jwtError;
      });

      // Act
      await protect(req, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        status: false,
        message: "Token has expired"
      });
      expect(next).not.toHaveBeenCalled();
    });

    test('should handle NotBeforeError', async () => {
      // Arrange
      const token = 'not_active_jwt_token';
      req.headers.authorization = `Bearer ${token}`;
      
      const jwtError = new Error('Token not active');
      jwtError.name = 'NotBeforeError';
      jwt.verify.mockImplementation(() => {
        throw jwtError;
      });

      // Act
      await protect(req, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        status: false,
        message: "Token is not active yet"
      });
      expect(next).not.toHaveBeenCalled();
    });

    test('should handle unknown JWT error', async () => {
      // Arrange
      const token = 'invalid_jwt_token';
      req.headers.authorization = `Bearer ${token}`;
      
      const jwtError = new Error('Unknown error');
      jwtError.name = 'UnknownError';
      jwt.verify.mockImplementation(() => {
        throw jwtError;
      });

      // Act
      await protect(req, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        status: false,
        message: "Not authorized to access this route"
      });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('authorize middleware', () => {
    test('should allow access when user has required role', () => {
      // Arrange
      req.user = { ...global.testUtils.mockUser, role: 'admin' };
      const authorizeAdmin = authorize('admin');

      // Act
      authorizeAdmin(req, res, next);

      // Assert
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    test('should allow access when user has one of multiple required roles', () => {
      // Arrange
      req.user = { ...global.testUtils.mockUser, role: 'talent' };
      const authorizeMultiple = authorize('admin', 'talent');

      // Act
      authorizeMultiple(req, res, next);

      // Assert
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    test('should deny access when user lacks required role', () => {
      // Arrange
      req.user = { ...global.testUtils.mockUser, role: 'talent' };
      const authorizeAdmin = authorize('admin');

      // Act
      authorizeAdmin(req, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        status: false,
        message: "Access forbidden. Required role(s): admin. Your role: talent"
      });
      expect(next).not.toHaveBeenCalled();
    });

    test('should deny access when user lacks any of multiple required roles', () => {
      // Arrange
      req.user = { ...global.testUtils.mockUser, role: 'talent' };
      const authorizeSuperUsers = authorize('admin', 'superuser');

      // Act
      authorizeSuperUsers(req, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        status: false,
        message: "Access forbidden. Required role(s): admin, superuser. Your role: talent"
      });
      expect(next).not.toHaveBeenCalled();
    });

    test('should return error when no user in request', () => {
      // Arrange
      req.user = null;
      const authorizeAdmin = authorize('admin');

      // Act
      authorizeAdmin(req, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        status: false,
        message: "Authentication required. Please log in first"
      });
      expect(next).not.toHaveBeenCalled();
    });

    test('should return error when user is undefined', () => {
      // Arrange
      req.user = undefined;
      const authorizeAdmin = authorize('admin');

      // Act
      authorizeAdmin(req, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        status: false,
        message: "Authentication required. Please log in first"
      });
      expect(next).not.toHaveBeenCalled();
    });
  });
});
