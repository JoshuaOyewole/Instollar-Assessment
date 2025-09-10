/**
 * Unit Tests for MatchService
 * Tests all match-related business logic operations
 */

const { describe, test, expect, beforeEach, jest } = require('@jest/globals');
const { StatusCodes } = require('http-status-codes');

// Mock dependencies
jest.mock('../repositories/MatchRepository');
jest.mock('../repositories/UserRepository');
jest.mock('../repositories/JobRepository');
jest.mock('../validators/MatchValidator');

const MatchRepository = require('../repositories/MatchRepository');
const UserRepository = require('../repositories/UserRepository');
const JobRepository = require('../repositories/JobRepository');
const matchValidator = require('../validators/MatchValidator');

describe('MatchService', () => {
  let MatchService;
  let matchService;
  let mockMatchRepository;
  let mockUserRepository;
  let mockJobRepository;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Import MatchService fresh for each test
    MatchService = require('../services/MatchService.js').constructor || 
      class MatchService {
        constructor() {
          this.matchRepository = new MatchRepository();
          this.userRepository = new UserRepository();
          this.jobRepository = new JobRepository();
        }
      };
    
    matchService = new MatchService();
    
    // Setup repository mocks
    mockMatchRepository = {
      create: jest.fn(),
      findByUser: jest.fn(),
      findByJob: jest.fn(),
      findById: jest.fn(),
      delete: jest.fn(),
      findExisting: jest.fn()
    };
    
    mockUserRepository = {
      findById: jest.fn()
    };
    
    mockJobRepository = {
      findById: jest.fn()
    };
    
    MatchRepository.mockImplementation(() => mockMatchRepository);
    UserRepository.mockImplementation(() => mockUserRepository);
    JobRepository.mockImplementation(() => mockJobRepository);
    
    matchService.matchRepository = mockMatchRepository;
    matchService.userRepository = mockUserRepository;
    matchService.jobRepository = mockJobRepository;
  });

  describe('createMatch', () => {
    test('should successfully create a match', async () => {
      // Arrange
      const matchData = {
        user: global.testUtils.mockUser._id,
        job: global.testUtils.mockJob._id
      };

      const mockUser = { ...global.testUtils.mockUser, role: 'talent' };
      const mockJob = global.testUtils.mockJob;
      const mockCreatedMatch = {
        ...global.testUtils.mockMatch,
        userId: matchData.user,
        jobId: matchData.job
      };

      matchValidator.validate = jest.fn().mockReturnValue({
        error: null,
        value: matchData
      });

      mockUserRepository.findById.mockResolvedValue(mockUser);
      mockJobRepository.findById.mockResolvedValue(mockJob);
      mockMatchRepository.findExisting.mockResolvedValue(null);
      mockMatchRepository.create.mockResolvedValue(mockCreatedMatch);

      // Act
      const result = await matchService.createMatch(matchData);

      // Assert
      expect(result.statusCode).toBe(StatusCodes.CREATED);
      expect(result.data.match.userId).toBe(matchData.user);
      expect(result.data.match.jobId).toBe(matchData.job);
      expect(mockMatchRepository.create).toHaveBeenCalledWith({
        userId: matchData.user,
        jobId: matchData.job
      });
    });

    test('should return validation error for invalid match data', async () => {
      // Arrange
      const invalidMatchData = { user: 'invalid_id' };

      matchValidator.validate = jest.fn().mockReturnValue({
        error: {
          details: [{ message: 'Job ID is required' }]
        },
        value: null
      });

      // Act
      const result = await matchService.createMatch(invalidMatchData);

      // Assert
      expect(result.statusCode).toBe(StatusCodes.BAD_REQUEST);
      expect(result.error.message).toBe('Job ID is required');
    });

    test('should return error when user not found', async () => {
      // Arrange
      const matchData = {
        user: 'nonexistent_user_id',
        job: global.testUtils.mockJob._id
      };

      matchValidator.validate = jest.fn().mockReturnValue({
        error: null,
        value: matchData
      });

      mockUserRepository.findById.mockResolvedValue(null);

      // Act
      const result = await matchService.createMatch(matchData);

      // Assert
      expect(result.statusCode).toBe(StatusCodes.NOT_FOUND);
      expect(result.error.message).toBe('User not found');
    });

    test('should return error when job not found', async () => {
      // Arrange
      const matchData = {
        user: global.testUtils.mockUser._id,
        job: 'nonexistent_job_id'
      };

      const mockUser = { ...global.testUtils.mockUser, role: 'talent' };

      matchValidator.validate = jest.fn().mockReturnValue({
        error: null,
        value: matchData
      });

      mockUserRepository.findById.mockResolvedValue(mockUser);
      mockJobRepository.findById.mockResolvedValue(null);

      // Act
      const result = await matchService.createMatch(matchData);

      // Assert
      expect(result.statusCode).toBe(StatusCodes.NOT_FOUND);
      expect(result.error.message).toBe('Job not found');
    });

    test('should return error when user is not a talent', async () => {
      // Arrange
      const matchData = {
        user: global.testUtils.mockUser._id,
        job: global.testUtils.mockJob._id
      };

      const mockUser = { ...global.testUtils.mockUser, role: 'admin' };

      matchValidator.validate = jest.fn().mockReturnValue({
        error: null,
        value: matchData
      });

      mockUserRepository.findById.mockResolvedValue(mockUser);

      // Act
      const result = await matchService.createMatch(matchData);

      // Assert
      expect(result.statusCode).toBe(StatusCodes.BAD_REQUEST);
      expect(result.error.message).toBe('Only talents can apply for jobs');
    });

    test('should return error when match already exists', async () => {
      // Arrange
      const matchData = {
        user: global.testUtils.mockUser._id,
        job: global.testUtils.mockJob._id
      };

      const mockUser = { ...global.testUtils.mockUser, role: 'talent' };
      const mockJob = global.testUtils.mockJob;
      const existingMatch = global.testUtils.mockMatch;

      matchValidator.validate = jest.fn().mockReturnValue({
        error: null,
        value: matchData
      });

      mockUserRepository.findById.mockResolvedValue(mockUser);
      mockJobRepository.findById.mockResolvedValue(mockJob);
      mockMatchRepository.findExisting.mockResolvedValue(existingMatch);

      // Act
      const result = await matchService.createMatch(matchData);

      // Assert
      expect(result.statusCode).toBe(StatusCodes.CONFLICT);
      expect(result.error.message).toBe('User has already applied for this job');
    });

    test('should handle internal server error', async () => {
      // Arrange
      const matchData = {
        user: global.testUtils.mockUser._id,
        job: global.testUtils.mockJob._id
      };

      matchValidator.validate = jest.fn().mockImplementation(() => {
        throw new Error('Validation service error');
      });

      // Act
      const result = await matchService.createMatch(matchData);

      // Assert
      expect(result.statusCode).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
      expect(result.error.message).toBe('Internal server error occurred while creating match');
    });
  });

  describe('getMatchesByUser', () => {
    test('should successfully get matches by user', async () => {
      // Arrange
      const userId = global.testUtils.mockUser._id;
      const userMatches = [
        global.testUtils.mockMatch,
        { 
          ...global.testUtils.mockMatch, 
          _id: '507f1f77bcf86cd799439017',
          jobId: '507f1f77bcf86cd799439018'
        }
      ];

      mockMatchRepository.findByUser.mockResolvedValue(userMatches);

      // Act
      const result = await matchService.getMatchesByUser(userId);

      // Assert
      expect(result.statusCode).toBe(StatusCodes.OK);
      expect(result.data.matches).toHaveLength(2);
      expect(result.data.count).toBe(2);
      expect(mockMatchRepository.findByUser).toHaveBeenCalledWith(userId);
    });

    test('should handle user with no matches', async () => {
      // Arrange
      const userId = global.testUtils.mockUser._id;
      mockMatchRepository.findByUser.mockResolvedValue([]);

      // Act
      const result = await matchService.getMatchesByUser(userId);

      // Assert
      expect(result.statusCode).toBe(StatusCodes.OK);
      expect(result.data.matches).toHaveLength(0);
      expect(result.data.count).toBe(0);
    });

    test('should handle internal server error', async () => {
      // Arrange
      const userId = global.testUtils.mockUser._id;
      mockMatchRepository.findByUser.mockRejectedValue(new Error('Database error'));

      // Act
      const result = await matchService.getMatchesByUser(userId);

      // Assert
      expect(result.statusCode).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
      expect(result.error.message).toBe('Internal server error occurred while fetching user matches');
    });
  });

  describe('getMatchesByJob', () => {
    test('should successfully get matches by job', async () => {
      // Arrange
      const jobId = global.testUtils.mockJob._id;
      const jobMatches = [
        global.testUtils.mockMatch,
        { 
          ...global.testUtils.mockMatch, 
          _id: '507f1f77bcf86cd799439019',
          userId: '507f1f77bcf86cd799439020'
        }
      ];

      mockJobRepository.findById.mockResolvedValue(global.testUtils.mockJob);
      mockMatchRepository.findByJob.mockResolvedValue(jobMatches);

      // Act
      const result = await matchService.getMatchesByJob(jobId);

      // Assert
      expect(result.statusCode).toBe(StatusCodes.OK);
      expect(result.data.matches).toHaveLength(2);
      expect(result.data.count).toBe(2);
      expect(mockMatchRepository.findByJob).toHaveBeenCalledWith(jobId);
    });

    test('should return error when job not found', async () => {
      // Arrange
      const jobId = 'nonexistent_job_id';
      mockJobRepository.findById.mockResolvedValue(null);

      // Act
      const result = await matchService.getMatchesByJob(jobId);

      // Assert
      expect(result.statusCode).toBe(StatusCodes.NOT_FOUND);
      expect(result.error.message).toBe('Job not found');
    });
  });


  describe('deleteMatch', () => {
    test('should successfully delete match', async () => {
      // Arrange
      const matchId = global.testUtils.mockMatch._id;

      mockMatchRepository.findById.mockResolvedValue(global.testUtils.mockMatch);
      mockMatchRepository.delete.mockResolvedValue(global.testUtils.mockMatch);

      // Act
      const result = await matchService.deleteMatch(matchId);

      // Assert
      expect(result.statusCode).toBe(StatusCodes.OK);
      expect(result.data.message).toBe('Match deleted successfully');
      expect(mockMatchRepository.delete).toHaveBeenCalledWith(matchId);
    });

    test('should return error when match not found', async () => {
      // Arrange
      const matchId = 'nonexistent_match_id';

      mockMatchRepository.findById.mockResolvedValue(null);

      // Act
      const result = await matchService.deleteMatch(matchId);

      // Assert
      expect(result.statusCode).toBe(StatusCodes.NOT_FOUND);
      expect(result.error.message).toBe('Match not found');
    });
  });
});
