/**
 * Integration Tests for Auth Controller
 * Tests authentication endpoints with real HTTP requests
 */

const { describe, test, expect, beforeEach, jest } = require('@jest/globals');
const request = require('supertest');
const express = require('express');
const { StatusCodes } = require('http-status-codes');

// Mock the UserService
jest.mock('../services/UserService');
const userService = require('../services/UserService');

// Setup Express app for testing
const app = express();
app.use(express.json());

// Import routes
const authController = require('../controllers/auth');

// Setup routes for testing
app.post('/api/auth/register', authController.register);
app.post('/api/auth/login', authController.login);
app.get('/api/auth/me', authController.getMe);

describe('Auth Controller Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/register', () => {
    test('should successfully register a new user', async () => {
      // Arrange
      const registrationData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'Password123',
        role: 'talent'
      };

      const mockServiceResponse = {
        statusCode: StatusCodes.CREATED,
        data: {
          user: {
            userId: global.testUtils.generateObjectId(),
            name: registrationData.name,
            email: registrationData.email,
            role: registrationData.role,
            createdAt: new Date()
          },
          token: 'mock_jwt_token'
        }
      };

      userService.createUser = jest.fn().mockResolvedValue(mockServiceResponse);

      // Act
      const response = await request(app)
        .post('/api/auth/register')
        .send(registrationData);

      // Assert
      expect(response.status).toBe(201);
      expect(response.body.status).toBe(true);
      expect(response.body.token).toBe('mock_jwt_token');
      expect(response.body.data.user.name).toBe(registrationData.name);
      expect(response.body.data.user.email).toBe(registrationData.email);
      expect(userService.createUser).toHaveBeenCalledWith(registrationData);
    });

    test('should return validation error for invalid registration data', async () => {
      // Arrange
      const invalidData = {
        name: '',
        email: 'invalid-email',
        password: '123'
      };

      const mockServiceResponse = {
        statusCode: StatusCodes.BAD_REQUEST,
        error: {
          message: 'Name is required',
          details: [
            { field: 'name', message: 'Name is required' },
            { field: 'email', message: 'Please provide a valid email address' },
            { field: 'password', message: 'Password must be at least 6 characters long' }
          ]
        }
      };

      userService.createUser = jest.fn().mockResolvedValue(mockServiceResponse);

      // Act
      const response = await request(app)
        .post('/api/auth/register')
        .send(invalidData);

      // Assert
      expect(response.status).toBe(400);
      expect(response.body.status).toBe(false);
      expect(response.body.message).toBe('Name is required');
      expect(response.body.errors).toHaveLength(3);
    });

    test('should return conflict error when user already exists', async () => {
      // Arrange
      const existingUserData = {
        name: 'John Doe',
        email: 'existing@example.com',
        password: 'Password123',
        role: 'talent'
      };

      const mockServiceResponse = {
        statusCode: StatusCodes.CONFLICT,
        error: {
          message: 'User with this email already exists',
          field: 'email'
        }
      };

      userService.createUser = jest.fn().mockResolvedValue(mockServiceResponse);

      // Act
      const response = await request(app)
        .post('/api/auth/register')
        .send(existingUserData);

      // Assert
      expect(response.status).toBe(409);
      expect(response.body.status).toBe(false);
      expect(response.body.message).toBe('User with this email already exists');
    });

    test('should handle internal server error', async () => {
      // Arrange
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'Password123'
      };

      userService.createUser = jest.fn().mockRejectedValue(new Error('Database connection failed'));

      // Act
      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);

      // Assert
      expect(response.status).toBe(500);
      expect(response.body.status).toBe(false);
      expect(response.body.message).toBe('Server Error');
    });
  });

  describe('POST /api/auth/login', () => {
    test('should successfully login user with valid credentials', async () => {
      // Arrange
      const loginData = {
        email: 'john@example.com',
        password: 'Password123'
      };

      const mockServiceResponse = {
        statusCode: StatusCodes.OK,
        data: {
          user: {
            userId: global.testUtils.mockUser._id,
            name: global.testUtils.mockUser.name,
            email: global.testUtils.mockUser.email,
            role: global.testUtils.mockUser.role,
            createdAt: global.testUtils.mockUser.createdAt
          },
          token: 'mock_login_token'
        }
      };

      userService.loginUser = jest.fn().mockResolvedValue(mockServiceResponse);

      // Act
      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.status).toBe(true);
      expect(response.body.token).toBe('mock_login_token');
      expect(response.body.data.user.email).toBe(loginData.email);
      expect(userService.loginUser).toHaveBeenCalledWith(loginData);
    });

    test('should return error for invalid credentials', async () => {
      // Arrange
      const invalidLoginData = {
        email: 'wrong@example.com',
        password: 'WrongPassword'
      };

      const mockServiceResponse = {
        statusCode: StatusCodes.UNAUTHORIZED,
        error: {
          message: 'Invalid credentials',
          field: 'email'
        }
      };

      userService.loginUser = jest.fn().mockResolvedValue(mockServiceResponse);

      // Act
      const response = await request(app)
        .post('/api/auth/login')
        .send(invalidLoginData);

      // Assert
      expect(response.status).toBe(401);
      expect(response.body.status).toBe(false);
      expect(response.body.message).toBe('Invalid credentials');
    });

    test('should return validation error for missing fields', async () => {
      // Arrange
      const incompleteData = {
        email: 'john@example.com'
        // Missing password
      };

      const mockServiceResponse = {
        statusCode: StatusCodes.BAD_REQUEST,
        error: {
          message: 'Password is required',
          details: [{ field: 'password', message: 'Password is required' }]
        }
      };

      userService.loginUser = jest.fn().mockResolvedValue(mockServiceResponse);

      // Act
      const response = await request(app)
        .post('/api/auth/login')
        .send(incompleteData);

      // Assert
      expect(response.status).toBe(400);
      expect(response.body.status).toBe(false);
      expect(response.body.message).toBe('Password is required');
    });
  });

  describe('GET /api/auth/me', () => {
    test('should successfully get current user profile', async () => {
      // Arrange
      const mockUser = {
        id: global.testUtils.mockUser._id,
        role: global.testUtils.mockUser.role
      };

      // Mock req.user (normally set by auth middleware)
      const mockServiceResponse = {
        statusCode: StatusCodes.OK,
        data: {
          user: {
            userId: global.testUtils.mockUser._id,
            name: global.testUtils.mockUser.name,
            email: global.testUtils.mockUser.email,
            role: global.testUtils.mockUser.role,
            createdAt: global.testUtils.mockUser.createdAt
          }
        }
      };

      userService.getCurrentUser = jest.fn().mockResolvedValue(mockServiceResponse);

      // Create a middleware to simulate authenticated request
      app.use('/api/auth/me', (req, res, next) => {
        req.user = mockUser;
        next();
      });

      // Act
      const response = await request(app)
        .get('/api/auth/me');

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.status).toBe(true);
      expect(response.body.data.user.userId).toBe(global.testUtils.mockUser._id);
      expect(userService.getCurrentUser).toHaveBeenCalledWith(mockUser.id);
    });

    test('should return error when user not found', async () => {
      // Arrange
      const mockUser = {
        id: 'nonexistent_user_id',
        role: 'talent'
      };

      const mockServiceResponse = {
        statusCode: StatusCodes.NOT_FOUND,
        error: {
          message: 'User not found',
          field: 'userId'
        }
      };

      userService.getCurrentUser = jest.fn().mockResolvedValue(mockServiceResponse);

      // Create a middleware to simulate authenticated request
      app.use('/api/auth/me-notfound', (req, res, next) => {
        req.user = mockUser;
        next();
      });

      // Add route for this test
      app.get('/api/auth/me-notfound', authController.getMe);

      // Act
      const response = await request(app)
        .get('/api/auth/me-notfound');

      // Assert
      expect(response.status).toBe(404);
      expect(response.body.status).toBe(false);
      expect(response.body.message).toBe('User not found');
    });

    test('should handle internal server error', async () => {
      // Arrange
      const mockUser = {
        id: global.testUtils.mockUser._id,
        role: 'talent'
      };

      userService.getCurrentUser = jest.fn().mockRejectedValue(new Error('Database error'));

      // Create a middleware to simulate authenticated request
      app.use('/api/auth/me-error', (req, res, next) => {
        req.user = mockUser;
        next();
      });

      // Add route for this test
      app.get('/api/auth/me-error', authController.getMe);

      // Act
      const response = await request(app)
        .get('/api/auth/me-error');

      // Assert
      expect(response.status).toBe(500);
      expect(response.body.status).toBe(false);
      expect(response.body.message).toBe('Server Error');
    });
  });

  describe('Error handling', () => {
    test('should handle malformed JSON in request body', async () => {
      // Act
      const response = await request(app)
        .post('/api/auth/register')
        .send('{"invalid": json}')
        .set('Content-Type', 'application/json');

      // Assert
      expect(response.status).toBe(400);
    });

    test('should handle missing request body', async () => {
      // Arrange
      const mockServiceResponse = {
        statusCode: StatusCodes.BAD_REQUEST,
        error: {
          message: 'Name is required',
          details: [{ field: 'name', message: 'Name is required' }]
        }
      };

      userService.createUser = jest.fn().mockResolvedValue(mockServiceResponse);

      // Act
      const response = await request(app)
        .post('/api/auth/register')
        .send({});

      // Assert
      expect(response.status).toBe(400);
      expect(response.body.status).toBe(false);
    });
  });
});
