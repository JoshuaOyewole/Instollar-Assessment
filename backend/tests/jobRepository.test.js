/**
 * Unit Tests for JobRepository
 * Tests all job-related database operations
 */

const { describe, test, expect, beforeEach, jest } = require('@jest/globals');

// Mock the Job model
jest.mock('../models/Job');
const Job = require('../models/Job');

const JobRepository = require('../repositories/JobRepository');

describe('JobRepository', () => {
  let jobRepository;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Create fresh instance
    jobRepository = new JobRepository();
  });

  describe('create', () => {
    test('should successfully create a new job', async () => {
      // Arrange
      const jobData = {
        title: 'Software Engineer',
        description: 'Full-stack developer position',
        requirements: ['JavaScript', 'React', 'Node.js'],
        createdBy: global.testUtils.mockUser._id
      };

      const mockCreatedJob = { ...jobData, _id: global.testUtils.generateObjectId(), isActive: true };
      Job.create.mockResolvedValue(mockCreatedJob);

      // Act
      const result = await jobRepository.create(jobData);

      // Assert
      expect(Job.create).toHaveBeenCalledWith(jobData);
      expect(result).toEqual(mockCreatedJob);
    });

    test('should handle creation error', async () => {
      // Arrange
      const jobData = { title: 'Test Job' };
      Job.create.mockRejectedValue(new Error('Validation error'));

      // Act & Assert
      await expect(jobRepository.create(jobData)).rejects.toThrow('Validation error');
    });
  });

  describe('findById', () => {
    test('should successfully find job by ID with populated createdBy', async () => {
      // Arrange
      const jobId = global.testUtils.mockJob._id;
      const mockJobWithPopulation = {
        ...global.testUtils.mockJob,
        createdBy: { name: 'John Doe', email: 'john@example.com' }
      };

      const mockChain = {
        populate: jest.fn().mockResolvedValue(mockJobWithPopulation)
      };

      Job.findById.mockReturnValue(mockChain);

      // Act
      const result = await jobRepository.findById(jobId);

      // Assert
      expect(Job.findById).toHaveBeenCalledWith(jobId);
      expect(mockChain.populate).toHaveBeenCalledWith('createdBy', 'name email');
      expect(result).toEqual(mockJobWithPopulation);
    });

    test('should return null when job not found', async () => {
      // Arrange
      const jobId = 'nonexistent_id';
      const mockChain = {
        populate: jest.fn().mockResolvedValue(null)
      };

      Job.findById.mockReturnValue(mockChain);

      // Act
      const result = await jobRepository.findById(jobId);

      // Assert
      expect(Job.findById).toHaveBeenCalledWith(jobId);
      expect(result).toBeNull();
    });

    test('should handle database error', async () => {
      // Arrange
      const jobId = global.testUtils.mockJob._id;
      const mockChain = {
        populate: jest.fn().mockRejectedValue(new Error('Database connection failed'))
      };

      Job.findById.mockReturnValue(mockChain);

      // Act & Assert
      await expect(jobRepository.findById(jobId)).rejects.toThrow('Database connection failed');
    });
  });

  describe('findAllActive', () => {
    test('should successfully find all active jobs', async () => {
      // Arrange
      const mockActiveJobs = [
        global.testUtils.mockJob,
        { ...global.testUtils.mockJob, _id: '507f1f77bcf86cd799439015', title: 'Frontend Developer' }
      ];

      const mockChain = {
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockResolvedValue(mockActiveJobs)
      };

      Job.find.mockReturnValue(mockChain);

      // Act
      const result = await jobRepository.findAllActive();

      // Assert
      expect(Job.find).toHaveBeenCalledWith({ isActive: true });
      expect(mockChain.populate).toHaveBeenCalledWith('createdBy', 'name email');
      expect(mockChain.sort).toHaveBeenCalledWith('-createdAt');
      expect(result).toEqual(mockActiveJobs);
    });

    test('should return empty array when no active jobs found', async () => {
      // Arrange
      const mockChain = {
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockResolvedValue([])
      };

      Job.find.mockReturnValue(mockChain);

      // Act
      const result = await jobRepository.findAllActive();

      // Assert
      expect(result).toEqual([]);
    });

    test('should handle database error in findAllActive', async () => {
      // Arrange
      const mockChain = {
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockRejectedValue(new Error('Database error'))
      };

      Job.find.mockReturnValue(mockChain);

      // Act & Assert
      await expect(jobRepository.findAllActive()).rejects.toThrow('Database error');
    });
  });



  describe('delete', () => {
    test('should successfully delete job', async () => {
      // Arrange
      const jobId = global.testUtils.mockJob._id;
      Job.findByIdAndDelete.mockResolvedValue(global.testUtils.mockJob);

      // Act
      const result = await jobRepository.delete(jobId);

      // Assert
      expect(Job.findByIdAndDelete).toHaveBeenCalledWith(jobId);
      expect(result).toEqual(global.testUtils.mockJob);
    });

    test('should return null when job to delete not found', async () => {
      // Arrange
      const jobId = 'nonexistent_id';
      Job.findByIdAndDelete.mockResolvedValue(null);

      // Act
      const result = await jobRepository.delete(jobId);

      // Assert
      expect(Job.findByIdAndDelete).toHaveBeenCalledWith(jobId);
      expect(result).toBeNull();
    });

    test('should handle deletion error', async () => {
      // Arrange
      const jobId = global.testUtils.mockJob._id;
      Job.findByIdAndDelete.mockRejectedValue(new Error('Cannot delete job'));

      // Act & Assert
      await expect(jobRepository.delete(jobId)).rejects.toThrow('Cannot delete job');
    });
  });

  describe('findByUserId', () => {
    test('should successfully find jobs by user ID', async () => {
      // Arrange
      const userId = global.testUtils.mockUser._id;
      const userJobs = [
        global.testUtils.mockJob,
        { ...global.testUtils.mockJob, _id: '507f1f77bcf86cd799439016', title: 'Another Job' }
      ];

      const mockChain = {
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockResolvedValue(userJobs)
      };

      Job.find.mockReturnValue(mockChain);

      // Act
      const result = await jobRepository.findByUserId(userId);

      // Assert
      expect(Job.find).toHaveBeenCalledWith({ createdBy: userId });
      expect(mockChain.populate).toHaveBeenCalledWith('createdBy', 'name email');
      expect(mockChain.sort).toHaveBeenCalledWith('-createdAt');
      expect(result).toEqual(userJobs);
    });

    test('should return empty array when user has no jobs', async () => {
      // Arrange
      const userId = global.testUtils.mockUser._id;

      const mockChain = {
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockResolvedValue([])
      };

      Job.find.mockReturnValue(mockChain);

      // Act
      const result = await jobRepository.findByUserId(userId);

      // Assert
      expect(result).toEqual([]);
    });

    test('should handle database error in findByUserId', async () => {
      // Arrange
      const userId = global.testUtils.mockUser._id;

      const mockChain = {
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockRejectedValue(new Error('Database error'))
      };

      Job.find.mockReturnValue(mockChain);

      // Act & Assert
      await expect(jobRepository.findByUserId(userId)).rejects.toThrow('Database error');
    });
  });

 
});
