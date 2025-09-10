/**
 * Unit Tests for UserRepository
 * Tests all user-related database operations
 */

const { describe, test, expect, beforeEach, jest } = require('@jest/globals');

// Mock the User model
jest.mock('../models/User');
const User = require('../models/User');

const UserRepository = require('../repositories/UserRepository');

describe('UserRepository', () => {
  let userRepository;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Create fresh instance
    userRepository = new UserRepository();
  });

  describe('create', () => {
    test('should successfully create a new user', async () => {
      // Arrange
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'hashedpassword',
        role: 'talent'
      };

      const mockCreatedUser = { ...userData, _id: global.testUtils.generateObjectId() };
      User.create.mockResolvedValue(mockCreatedUser);

      // Act
      const result = await userRepository.create(userData);

      // Assert
      expect(User.create).toHaveBeenCalledWith(userData);
      expect(result).toEqual(mockCreatedUser);
    });

    test('should handle creation error', async () => {
      // Arrange
      const userData = { name: 'John', email: 'john@example.com' };
      User.create.mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(userRepository.create(userData)).rejects.toThrow('Database error');
    });
  });

  describe('findById', () => {
    test('should successfully find user by ID', async () => {
      // Arrange
      const userId = global.testUtils.mockUser._id;
      User.findById.mockResolvedValue(global.testUtils.mockUser);

      // Act
      const result = await userRepository.findById(userId);

      // Assert
      expect(User.findById).toHaveBeenCalledWith(userId);
      expect(result).toEqual(global.testUtils.mockUser);
    });

    test('should return null when user not found', async () => {
      // Arrange
      const userId = 'nonexistent_id';
      User.findById.mockResolvedValue(null);

      // Act
      const result = await userRepository.findById(userId);

      // Assert
      expect(User.findById).toHaveBeenCalledWith(userId);
      expect(result).toBeNull();
    });

    test('should handle database error', async () => {
      // Arrange
      const userId = global.testUtils.mockUser._id;
      User.findById.mockRejectedValue(new Error('Database connection failed'));

      // Act & Assert
      await expect(userRepository.findById(userId)).rejects.toThrow('Database connection failed');
    });
  });

  describe('findOne', () => {
    test('should successfully find user by criteria', async () => {
      // Arrange
      const criteria = { email: 'john@example.com' };
      User.findOne.mockResolvedValue(global.testUtils.mockUser);

      // Act
      const result = await userRepository.findOne(criteria);

      // Assert
      expect(User.findOne).toHaveBeenCalledWith(criteria);
      expect(result).toEqual(global.testUtils.mockUser);
    });

    test('should return null when no user matches criteria', async () => {
      // Arrange
      const criteria = { email: 'nonexistent@example.com' };
      User.findOne.mockResolvedValue(null);

      // Act
      const result = await userRepository.findOne(criteria);

      // Assert
      expect(User.findOne).toHaveBeenCalledWith(criteria);
      expect(result).toBeNull();
    });

    test('should handle complex criteria', async () => {
      // Arrange
      const complexCriteria = { 
        $and: [
          { role: 'talent' },
          { createdAt: { $gte: new Date('2024-01-01') } }
        ]
      };
      
      User.findOne.mockResolvedValue(global.testUtils.mockUser);

      // Act
      const result = await userRepository.findOne(complexCriteria);

      // Assert
      expect(User.findOne).toHaveBeenCalledWith(complexCriteria);
      expect(result).toEqual(global.testUtils.mockUser);
    });
  });

  describe('findTalents', () => {
    test('should successfully find all talents', async () => {
      // Arrange
      const mockTalents = [
        { ...global.testUtils.mockUser, role: 'talent' },
        { ...global.testUtils.mockUser, _id: '507f1f77bcf86cd799439014', email: 'jane@example.com', name: 'Jane Doe', role: 'talent' }
      ];

      const mockChain = {
        select: jest.fn().mockReturnThis(),
        sort: jest.fn().mockResolvedValue(mockTalents)
      };

      User.find.mockReturnValue(mockChain);

      // Act
      const result = await userRepository.findTalents();

      // Assert
      expect(User.find).toHaveBeenCalledWith({ role: 'talent' });
      expect(mockChain.select).toHaveBeenCalledWith('name email createdAt');
      expect(mockChain.sort).toHaveBeenCalledWith('-createdAt');
      expect(result).toEqual(mockTalents);
    });

    test('should handle findTalents with custom options', async () => {
      // Arrange
      const options = { select: 'name email role', sort: 'name' };
      const mockTalents = [global.testUtils.mockUser];

      const mockChain = {
        select: jest.fn().mockReturnThis(),
        sort: jest.fn().mockResolvedValue(mockTalents)
      };

      User.find.mockReturnValue(mockChain);

      // Act
      const result = await userRepository.findTalents(options);

      // Assert
      expect(User.find).toHaveBeenCalledWith({ role: 'talent' });
      expect(mockChain.select).toHaveBeenCalledWith('name email role');
      expect(mockChain.sort).toHaveBeenCalledWith('name');
      expect(result).toEqual(mockTalents);
    });

    test('should return empty array when no talents found', async () => {
      // Arrange
      const mockChain = {
        select: jest.fn().mockReturnThis(),
        sort: jest.fn().mockResolvedValue([])
      };

      User.find.mockReturnValue(mockChain);

      // Act
      const result = await userRepository.findTalents();

      // Assert
      expect(result).toEqual([]);
    });

    test('should handle database error in findTalents', async () => {
      // Arrange
      const mockChain = {
        select: jest.fn().mockReturnThis(),
        sort: jest.fn().mockRejectedValue(new Error('Database error'))
      };

      User.find.mockReturnValue(mockChain);

      // Act & Assert
      await expect(userRepository.findTalents()).rejects.toThrow('Database error');
    });
  });


  describe('delete', () => {
    test('should successfully delete user', async () => {
      // Arrange
      const userId = global.testUtils.mockUser._id;
      User.findByIdAndDelete.mockResolvedValue(global.testUtils.mockUser);

      // Act
      const result = await userRepository.delete(userId);

      // Assert
      expect(User.findByIdAndDelete).toHaveBeenCalledWith(userId);
      expect(result).toEqual(global.testUtils.mockUser);
    });

    test('should return null when user to delete not found', async () => {
      // Arrange
      const userId = 'nonexistent_id';
      User.findByIdAndDelete.mockResolvedValue(null);

      // Act
      const result = await userRepository.delete(userId);

      // Assert
      expect(User.findByIdAndDelete).toHaveBeenCalledWith(userId);
      expect(result).toBeNull();
    });

    test('should handle deletion error', async () => {
      // Arrange
      const userId = global.testUtils.mockUser._id;
      User.findByIdAndDelete.mockRejectedValue(new Error('Cannot delete user'));

      // Act & Assert
      await expect(userRepository.delete(userId)).rejects.toThrow('Cannot delete user');
    });
  });
});
