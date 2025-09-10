/**
 * Unit Tests for UserService
 * Tests all user-related business logic operations
 */

const { describe, test, expect, beforeEach, jest } = require('@jest/globals');
const { StatusCodes } = require('http-status-codes');
const UserService = require('../services/UserService');

// Mock dependencies
jest.mock('../repositories/UserRepository');
jest.mock('../validators/AuthValidator');
jest.mock('jsonwebtoken');

const UserRepository = require('../repositories/UserRepository');
const authValidator = require('../validators/AuthValidator');
const jwt = require('jsonwebtoken');

describe('UserService', () => {
  let userService;
  let mockUserRepository;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Create fresh instance for each test
    userService = new (require('../services/UserService.js').constructor || class {
      constructor() {
        this.userRepository = new UserRepository();
      }
      
      async createUser(body) {
        return require('../services/UserService').createUser.call(this, body);
      }
      
      async loginUser(body) {
        return require('../services/UserService').loginUser.call(this, body);
      }
      
      async getCurrentUser(userId) {
        return require('../services/UserService').getCurrentUser.call(this, userId);
      }
      
      async getAllTalents(options) {
        return require('../services/UserService').getAllTalents.call(this, options);
      }
      
      generateToken(user) {
        return require('../services/UserService').generateToken.call(this, user);
      }
    })();
    
    // Setup repository mock
    mockUserRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
      findById: jest.fn(),
      findTalents: jest.fn()
    };
    
    UserRepository.mockImplementation(() => mockUserRepository);
  });

  describe('createUser', () => {
    test('should successfully create a new user', async () => {
      // Arrange
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'Password123',
        role: 'talent'
      };

      const mockCreatedUser = {
        _id: global.testUtils.generateObjectId(),
        ...userData,
        createdAt: new Date()
      };

      authValidator.createUser = jest.fn().mockResolvedValue({
        isValid: true,
        data: userData,
        errors: null
      });

      mockUserRepository.findOne.mockResolvedValue(null); // User doesn't exist
      mockUserRepository.create.mockResolvedValue(mockCreatedUser);
      
      jwt.sign = jest.fn().mockReturnValue('mock_jwt_token');

      // Act
      const result = await userService.createUser(userData);

      // Assert
      expect(result.statusCode).toBe(StatusCodes.CREATED);
      expect(result.data.user.name).toBe(userData.name);
      expect(result.data.user.email).toBe(userData.email);
      expect(result.data.token).toBe('mock_jwt_token');
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({ email: userData.email });
      expect(mockUserRepository.create).toHaveBeenCalledWith(userData);
    });

    test('should return validation error when input is invalid', async () => {
      // Arrange
      const invalidData = { email: 'invalid-email' };
      
      authValidator.createUser = jest.fn().mockResolvedValue({
        isValid: false,
        errors: [{ field: 'email', message: 'Please provide a valid email address' }],
        data: null
      });

      // Act
      const result = await userService.createUser(invalidData);

      // Assert
      expect(result.statusCode).toBe(StatusCodes.BAD_REQUEST);
      expect(result.error.message).toBe('Please provide a valid email address');
      expect(result.error.details).toHaveLength(1);
    });

    test('should return conflict error when user already exists', async () => {
      // Arrange
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'Password123',
        role: 'talent'
      };

      authValidator.createUser = jest.fn().mockResolvedValue({
        isValid: true,
        data: userData,
        errors: null
      });

      mockUserRepository.findOne.mockResolvedValue(global.testUtils.mockUser);

      // Act
      const result = await userService.createUser(userData);

      // Assert
      expect(result.statusCode).toBe(StatusCodes.CONFLICT);
      expect(result.error.message).toBe('User with this email already exists');
    });

    test('should handle internal server error', async () => {
      // Arrange
      const userData = { name: 'John', email: 'john@example.com', password: 'Password123' };
      
      authValidator.createUser = jest.fn().mockRejectedValue(new Error('Database connection failed'));

      // Act
      const result = await userService.createUser(userData);

      // Assert
      expect(result.statusCode).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
      expect(result.error.message).toBe('Internal server error occurred while creating user');
    });
  });

  describe('loginUser', () => {
    test('should successfully login user with valid credentials', async () => {
      // Arrange
      const loginData = {
        email: 'john@example.com',
        password: 'Password123'
      };

      const mockUser = {
        ...global.testUtils.mockUser,
        matchPassword: jest.fn().mockResolvedValue(true)
      };

      authValidator.loginUser = jest.fn().mockResolvedValue({
        isValid: true,
        data: loginData,
        errors: null
      });

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      jwt.sign = jest.fn().mockReturnValue('mock_login_token');

      // Act
      const result = await userService.loginUser(loginData);

      // Assert
      expect(result.statusCode).toBe(StatusCodes.OK);
      expect(result.data.user.email).toBe(mockUser.email);
      expect(result.data.token).toBe('mock_login_token');
      expect(mockUser.matchPassword).toHaveBeenCalledWith(loginData.password);
    });

    test('should return error for non-existent user', async () => {
      // Arrange
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'Password123'
      };

      authValidator.loginUser = jest.fn().mockResolvedValue({
        isValid: true,
        data: loginData,
        errors: null
      });

      mockUserRepository.findOne.mockResolvedValue(null);

      // Act
      const result = await userService.loginUser(loginData);

      // Assert
      expect(result.statusCode).toBe(StatusCodes.UNAUTHORIZED);
      expect(result.error.message).toBe('Invalid credentials');
      expect(result.error.field).toBe('email');
    });

    test('should return error for invalid password', async () => {
      // Arrange
      const loginData = {
        email: 'john@example.com',
        password: 'WrongPassword'
      };

      const mockUser = {
        ...global.testUtils.mockUser,
        matchPassword: jest.fn().mockResolvedValue(false)
      };

      authValidator.loginUser = jest.fn().mockResolvedValue({
        isValid: true,
        data: loginData,
        errors: null
      });

      mockUserRepository.findOne.mockResolvedValue(mockUser);

      // Act
      const result = await userService.loginUser(loginData);

      // Assert
      expect(result.statusCode).toBe(StatusCodes.UNAUTHORIZED);
      expect(result.error.message).toBe('Invalid credentials');
      expect(result.error.field).toBe('password');
    });
  });

  describe('getCurrentUser', () => {
    test('should successfully get current user', async () => {
      // Arrange
      const userId = global.testUtils.mockUser._id;
      mockUserRepository.findById.mockResolvedValue(global.testUtils.mockUser);

      // Act
      const result = await userService.getCurrentUser(userId);

      // Assert
      expect(result.statusCode).toBe(StatusCodes.OK);
      expect(result.data.user.userId).toBe(global.testUtils.mockUser._id);
      expect(result.data.user.email).toBe(global.testUtils.mockUser.email);
    });

    test('should return error when user not found', async () => {
      // Arrange
      const userId = 'nonexistent_id';
      mockUserRepository.findById.mockResolvedValue(null);

      // Act
      const result = await userService.getCurrentUser(userId);

      // Assert
      expect(result.statusCode).toBe(StatusCodes.NOT_FOUND);
      expect(result.error.message).toBe('User not found');
    });
  });

  describe('getAllTalents', () => {
    test('should successfully get all talents', async () => {
      // Arrange
      const mockTalents = [
        { ...global.testUtils.mockUser, role: 'talent' },
        { ...global.testUtils.mockUser, _id: '507f1f77bcf86cd799439014', email: 'jane@example.com', name: 'Jane Doe' }
      ];
      
      mockUserRepository.findTalents.mockResolvedValue(mockTalents);

      // Act
      const result = await userService.getAllTalents();

      // Assert
      expect(result.statusCode).toBe(StatusCodes.OK);
      expect(result.data.talents).toHaveLength(2);
      expect(result.data.count).toBe(2);
      expect(result.data.talents[0].name).toBe('John Doe');
    });

    test('should handle empty talents list', async () => {
      // Arrange
      mockUserRepository.findTalents.mockResolvedValue([]);

      // Act
      const result = await userService.getAllTalents();

      // Assert
      expect(result.statusCode).toBe(StatusCodes.OK);
      expect(result.data.talents).toHaveLength(0);
      expect(result.data.count).toBe(0);
    });
  });

  describe('generateToken', () => {
    test('should generate JWT token with correct payload', async () => {
      // Arrange
      const mockUser = global.testUtils.mockUser;
      const expectedToken = 'generated_jwt_token';
      
      jwt.sign = jest.fn().mockReturnValue(expectedToken);

      // Act
      const token = userService.generateToken(mockUser);

      // Assert
      expect(jwt.sign).toHaveBeenCalledWith(
        {
          id: mockUser._id,
          role: mockUser.role,
          email: mockUser.email,
          name: mockUser.name
        },
        process.env.JWT_SECRET,
        {
          expiresIn: process.env.JWT_EXPIRE || '1d',
          algorithm: 'HS256'
        }
      );
      expect(token).toBe(expectedToken);
    });
  });
});
