/**
 * Unit Tests for JobService
 * Tests all job-related business logic operations
 */

const { describe, test, expect, beforeEach, jest } = require('@jest/globals');
const { StatusCodes } = require('http-status-codes');

// Mock dependencies
jest.mock('../repositories/JobRepository');
jest.mock('../validators/JobValidator');

const JobRepository = require('../repositories/JobRepository');
const jobValidator = require('../validators/JobValidator');

describe('JobService', () => {
  let JobService;
  let jobService;
  let mockJobRepository;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Import JobService fresh for each test
    JobService = require('../services/JobService.js').constructor || 
      class JobService {
        constructor() {
          this.jobRepository = new JobRepository();
        }
      };
    
    jobService = new JobService();
    
    // Setup repository mock
    mockJobRepository = {
      findAllActive: jest.fn(),
      create: jest.fn(),
      findById: jest.fn(),
      delete: jest.fn(),
      findByUserId: jest.fn()
    };
    
    JobRepository.mockImplementation(() => mockJobRepository);
    jobService.jobRepository = mockJobRepository;
  });

  describe('getAllJobs', () => {
    test('should successfully get all active jobs', async () => {
      // Arrange
      const mockJobs = [
        global.testUtils.mockJob,
        {
          ...global.testUtils.mockJob,
          _id: '507f1f77bcf86cd799439015',
          title: 'Frontend Developer',
        }
      ];

      mockJobRepository.findAllActive.mockResolvedValue(mockJobs);

      // Act
      const result = await jobService.getAllJobs();

      // Assert
      expect(result.statusCode).toBe(StatusCodes.OK);
      expect(result.data.jobs).toHaveLength(2);
      expect(result.data.count).toBe(2);
      expect(result.data.jobs[0].title).toBe('Software Engineer');
      expect(result.data.jobs[1].title).toBe('Frontend Developer');
      expect(mockJobRepository.findAllActive).toHaveBeenCalled();
    });

    test('should handle empty job list', async () => {
      // Arrange
      mockJobRepository.findAllActive.mockResolvedValue([]);

      // Act
      const result = await jobService.getAllJobs();

      // Assert
      expect(result.statusCode).toBe(StatusCodes.OK);
      expect(result.data.jobs).toHaveLength(0);
      expect(result.data.count).toBe(0);
    });

    test('should handle internal server error', async () => {
      // Arrange
      mockJobRepository.findAllActive.mockRejectedValue(new Error('Database error'));

      // Act
      const result = await jobService.getAllJobs();

      // Assert
      expect(result.statusCode).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
      expect(result.error.message).toBe('Internal server error occurred while fetching jobs');
    });
  });

  describe('createJob', () => {
    test('should successfully create a new job', async () => {
      // Arrange
      const jobData = {
        title: 'Backend Developer',
        description: 'Node.js developer needed',
        location: 'New York',
        requiredSkills: ['Node.js', 'MongoDB', 'Express'],
      };

      const userId = global.testUtils.mockUser._id;
      const mockCreatedJob = {
        _id: global.testUtils.generateObjectId(),
        ...jobData,
        createdBy: userId,
        isActive: true,
        createdAt: new Date()
      };

      jobValidator.createJob = jest.fn().mockResolvedValue({
        isValid: true,
        data: jobData,
        errors: null
      });

      mockJobRepository.create.mockResolvedValue(mockCreatedJob);

      // Act
      const result = await jobService.createJob(jobData, userId);

      // Assert
      expect(result.statusCode).toBe(StatusCodes.CREATED);
      expect(result.data.job.title).toBe(jobData.title);
      expect(result.data.job.createdBy).toBe(userId);
      expect(mockJobRepository.create).toHaveBeenCalledWith({
        ...jobData,
        createdBy: userId
      });
    });

    test('should return validation error for invalid job data', async () => {
      // Arrange
      const invalidJobData = { title: '' }; // Missing required fields
      const userId = global.testUtils.mockUser._id;

      jobValidator.createJob = jest.fn().mockResolvedValue({
        isValid: false,
        errors: [{ field: 'title', message: 'Title is required' }],
        data: null
      });

      // Act
      const result = await jobService.createJob(invalidJobData, userId);

      // Assert
      expect(result.statusCode).toBe(StatusCodes.BAD_REQUEST);
      expect(result.error.message).toBe('Title is required');
      expect(result.error.details).toHaveLength(1);
    });

    test('should handle internal server error during job creation', async () => {
      // Arrange
      const jobData = { title: 'Test Job' };
      const userId = global.testUtils.mockUser._id;

      jobValidator.createJob = jest.fn().mockRejectedValue(new Error('Validation service error'));

      // Act
      const result = await jobService.createJob(jobData, userId);

      // Assert
      expect(result.statusCode).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
      expect(result.error.message).toBe('Internal server error occurred while creating job');
    });
  });

  describe('getJobById', () => {
    test('should successfully get job by ID', async () => {
      // Arrange
      const jobId = global.testUtils.mockJob._id;
      mockJobRepository.findById.mockResolvedValue(global.testUtils.mockJob);

      // Act
      const result = await jobService.getJobById(jobId);

      // Assert
      expect(result.statusCode).toBe(StatusCodes.OK);
      expect(result.data.job.id).toBe(jobId);
      expect(result.data.job.title).toBe('Software Engineer');
      expect(mockJobRepository.findById).toHaveBeenCalledWith(jobId);
    });

    test('should return error when job not found', async () => {
      // Arrange
      const jobId = 'nonexistent_job_id';
      mockJobRepository.findById.mockResolvedValue(null);

      // Act
      const result = await jobService.getJobById(jobId);

      // Assert
      expect(result.statusCode).toBe(StatusCodes.NOT_FOUND);
      expect(result.error.message).toBe('Job not found');
    });

    test('should handle internal server error', async () => {
      // Arrange
      const jobId = global.testUtils.mockJob._id;
      mockJobRepository.findById.mockRejectedValue(new Error('Database connection failed'));

      // Act
      const result = await jobService.getJobById(jobId);

      // Assert
      expect(result.statusCode).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
      expect(result.error.message).toBe('Internal server error occurred while fetching job');
    });
  });


  describe('deleteJob', () => {
    test('should successfully delete job', async () => {
      // Arrange
      const jobId = global.testUtils.mockJob._id;

      mockJobRepository.findById.mockResolvedValue(global.testUtils.mockJob);
      mockJobRepository.delete.mockResolvedValue(global.testUtils.mockJob);

      // Act
      const result = await jobService.deleteJob(jobId);

      // Assert
      expect(result.statusCode).toBe(StatusCodes.OK);
      expect(result.data.message).toBe('Job deleted successfully');
      expect(mockJobRepository.delete).toHaveBeenCalledWith(jobId);
    });

    test('should return error when job to delete not found', async () => {
      // Arrange
      const jobId = 'nonexistent_job_id';

      mockJobRepository.findById.mockResolvedValue(null);

      // Act
      const result = await jobService.deleteJob(jobId);

      // Assert
      expect(result.statusCode).toBe(StatusCodes.NOT_FOUND);
      expect(result.error.message).toBe('Job not found');
    });

    test('should handle deletion failure', async () => {
      // Arrange
      const jobId = global.testUtils.mockJob._id;

      mockJobRepository.findById.mockResolvedValue(global.testUtils.mockJob);
      mockJobRepository.delete.mockResolvedValue(null);

      // Act
      const result = await jobService.deleteJob(jobId);

      // Assert
      expect(result.statusCode).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
      expect(result.error.message).toBe('Failed to delete job');
    });
  });

  describe('getJobsByUser', () => {
    test('should successfully get jobs by user', async () => {
      // Arrange
      const userId = global.testUtils.mockUser._id;
      const userJobs = [
        global.testUtils.mockJob,
        { ...global.testUtils.mockJob, _id: '507f1f77bcf86cd799439016', title: 'Another Job' }
      ];

      mockJobRepository.findByUserId.mockResolvedValue(userJobs);

      // Act
      const result = await jobService.getJobsByUser(userId);

      // Assert
      expect(result.statusCode).toBe(StatusCodes.OK);
      expect(result.data.jobs).toHaveLength(2);
      expect(result.data.count).toBe(2);
      expect(mockJobRepository.findByUserId).toHaveBeenCalledWith(userId);
    });

    test('should handle user with no jobs', async () => {
      // Arrange
      const userId = global.testUtils.mockUser._id;
      mockJobRepository.findByUserId.mockResolvedValue([]);

      // Act
      const result = await jobService.getJobsByUser(userId);

      // Assert
      expect(result.statusCode).toBe(StatusCodes.OK);
      expect(result.data.jobs).toHaveLength(0);
      expect(result.data.count).toBe(0);
    });

    test('should handle internal server error', async () => {
      // Arrange
      const userId = global.testUtils.mockUser._id;
      mockJobRepository.findByUserId.mockRejectedValue(new Error('Database error'));

      // Act
      const result = await jobService.getJobsByUser(userId);

      // Assert
      expect(result.statusCode).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
      expect(result.error.message).toBe('Internal server error occurred while fetching user jobs');
    });
  });
});
