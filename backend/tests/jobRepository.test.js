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
        company: 'Tech Corp',
        location: 'Remote',
        salary: '$80,000 - $120,000',
        requirements: ['JavaScript', 'React', 'Node.js'],
        jobType: 'Full-time',
        experienceLevel: 'Mid-level',
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

  describe('update', () => {
    test('should successfully update job', async () => {
      // Arrange
      const jobId = global.testUtils.mockJob._id;
      const updateData = { title: 'Senior Software Engineer', salary: '$90,000 - $130,000' };
      const updatedJob = {
        ...global.testUtils.mockJob,
        ...updateData,
        createdBy: { name: 'John Doe', email: 'john@example.com' }
      };

      const mockChain = {
        populate: jest.fn().mockResolvedValue(updatedJob)
      };

      Job.findByIdAndUpdate.mockReturnValue(mockChain);

      // Act
      const result = await jobRepository.update(jobId, updateData);

      // Assert
      expect(Job.findByIdAndUpdate).toHaveBeenCalledWith(jobId, updateData, {
        new: true,
        runValidators: true
      });
      expect(mockChain.populate).toHaveBeenCalledWith('createdBy', 'name email');
      expect(result).toEqual(updatedJob);
    });

    test('should return null when job to update not found', async () => {
      // Arrange
      const jobId = 'nonexistent_id';
      const updateData = { title: 'Updated Title' };

      const mockChain = {
        populate: jest.fn().mockResolvedValue(null)
      };

      Job.findByIdAndUpdate.mockReturnValue(mockChain);

      // Act
      const result = await jobRepository.update(jobId, updateData);

      // Assert
      expect(result).toBeNull();
    });

    test('should handle update validation error', async () => {
      // Arrange
      const jobId = global.testUtils.mockJob._id;
      const updateData = { title: '' }; // Invalid data

      const mockChain = {
        populate: jest.fn().mockRejectedValue(new Error('Validation failed'))
      };

      Job.findByIdAndUpdate.mockReturnValue(mockChain);

      // Act & Assert
      await expect(jobRepository.update(jobId, updateData)).rejects.toThrow('Validation failed');
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

  describe('findByFilter', () => {
    test('should successfully find jobs by filter criteria', async () => {
      // Arrange
      const filterCriteria = { 
        jobType: 'Full-time',
        experienceLevel: 'Mid-level',
        isActive: true
      };

      const filteredJobs = [global.testUtils.mockJob];

      const mockChain = {
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockResolvedValue(filteredJobs)
      };

      Job.find.mockReturnValue(mockChain);

      // Act
      const result = await jobRepository.findByFilter(filterCriteria);

      // Assert
      expect(Job.find).toHaveBeenCalledWith(filterCriteria);
      expect(mockChain.populate).toHaveBeenCalledWith('createdBy', 'name email');
      expect(mockChain.sort).toHaveBeenCalledWith('-createdAt');
      expect(result).toEqual(filteredJobs);
    });

    test('should handle complex filter criteria', async () => {
      // Arrange
      const complexFilter = {
        $and: [
          { isActive: true },
          { salary: { $regex: /\$80,000/, $options: 'i' } },
          { requirements: { $in: ['JavaScript'] } }
        ]
      };

      const mockChain = {
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockResolvedValue([global.testUtils.mockJob])
      };

      Job.find.mockReturnValue(mockChain);

      // Act
      const result = await jobRepository.findByFilter(complexFilter);

      // Assert
      expect(Job.find).toHaveBeenCalledWith(complexFilter);
      expect(result).toHaveLength(1);
    });
  });
});
