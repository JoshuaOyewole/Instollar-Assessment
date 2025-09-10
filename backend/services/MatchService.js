const MatchRepository = require('../repositories/MatchRepository');
const JobRepository = require('../repositories/JobRepository');
const UserRepository = require('../repositories/UserRepository');
const { matchValidator } = require('../validators/MatchValidator');
const StatusCodes = require('http-status-codes');

class MatchService {
  constructor() {
    this.matchRepository = new MatchRepository();
    this.jobRepository = new JobRepository();
    this.userRepository = new UserRepository();
  }

  async getAllMatches() {
    try {
      const matches = await this.matchRepository.findAll();
      
      return {
        statusCode: StatusCodes.OK,
        data: {
          count: matches.length,
          matches: matches
        }
      };
    } catch (error) {
      return {
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
        error: { message: 'Failed to fetch matches' }
      };
    }
  }

  async getMatchesByJob(jobId) {
    try {
      // Check if job exists
      const job = await this.jobRepository.findById(jobId);
      if (!job) {
        return {
          statusCode: StatusCodes.NOT_FOUND,
          error: { message: 'Job not found' }
        };
      }

      const matches = await this.matchRepository.findByJobId(jobId);
      
      return {
        statusCode: StatusCodes.OK,
        data: {
          count: matches.length,
          matches: matches
        }
      };
    } catch (error) {
      if (error.name === 'CastError') {
        return {
          statusCode: StatusCodes.NOT_FOUND,
          error: { message: 'Job not found' }
        };
      }
      
      return {
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
        error: { message: 'Failed to fetch job matches' }
      };
    }
  }

  async getMatchesByUser(userId) {
    try {
      // Check if user exists
      const user = await this.userRepository.findById(userId);
      if (!user) {
        return {
          statusCode: StatusCodes.NOT_FOUND,
          error: { message: 'User not found' }
        };
      }

      const matches = await this.matchRepository.findByUserId(userId);
    

      return {
        statusCode: StatusCodes.OK,
        data: {
          count: matches.length,
          matches: matches
        }
      };
    } catch (error) {
      if (error.name === 'CastError') {
        return {
          statusCode: StatusCodes.NOT_FOUND,
          error: { message: 'User not found' }
        };
      }
      
      return {
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
        error: { message: 'Failed to fetch user matches' }
      };
    }
  }

  async createMatch(matchData) {
    try {
    
      // Validate input
      const { error, value } = matchValidator.validate(matchData);
      if (error) {
        return {
          statusCode: StatusCodes.BAD_REQUEST,
          error: {
            message: error.details[0].message,
            details: error.details.map(detail => detail.message)
          }
        };
      }
 
      
      const { user: userId, job: jobId } = value;

      // Check if user exists and is a talent
      const user = await this.userRepository.findById(userId);
      if (!user) {
        return {
          statusCode: StatusCodes.NOT_FOUND,
          error: { message: 'User not found' }
        };
      }

      if (user.role !== 'talent') {
        return {
          statusCode: StatusCodes.BAD_REQUEST,
          error: { message: 'Only talent users can be matched to jobs' }
        };
      }

      // Check if job exists and is active
      const job = await this.jobRepository.findById(jobId);
      if (!job) {
        return {
          statusCode: StatusCodes.NOT_FOUND,
          error: { message: 'Job not found' }
        };
      }

      if (!job.isActive) {
        return {
          statusCode: StatusCodes.BAD_REQUEST,
          error: { message: 'Cannot match to inactive job' }
        };
      }

      // Check if match already exists
      const existingMatch = await this.matchRepository.exists(userId, jobId);
      if (existingMatch) {
        return {
          statusCode: StatusCodes.CONFLICT,
          error: { message: 'User is already matched to this job' }
        };
      }

      // Create the match with correct field names for the model
      const matchCreateData = {
        userId: userId,
        jobId: jobId,
        matchedBy: value.matchedBy,
        status: value.status
      };
    
      const match = await this.matchRepository.create(matchCreateData);
  
      
      // Populate the created match
      const populatedMatch = await this.matchRepository.findByUserAndJob(userId, jobId);
      
      return {
        statusCode: StatusCodes.CREATED,
        data: { match: populatedMatch }
      };
    } catch (error) {
      console.error("Error in createMatch service:", error);
      
      // Handle duplicate key error (user already matched to job)
      if (error.code === 11000) {
        return {
          statusCode: StatusCodes.CONFLICT,
          error: { message: 'User is already matched to this job' }
        };
      }
      
      // Handle validation errors
      if (error.name === 'ValidationError') {
        return {
          statusCode: StatusCodes.BAD_REQUEST,
          error: { message: error.message }
        };
      }
      
      return {
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
        error: { message: 'Failed to create match', details: error.message }
      };
    }
  }

}

module.exports = new MatchService();
