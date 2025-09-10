
const ApplicationRepository = require("../repositories/ApplicationRepository");
const JobRepository = require("../repositories/JobRepository");
const UserRepository = require("../repositories/UserRepository");
const MatchRepository = require("../repositories/MatchRepository");
const ApplicationValidator = require("../validators/ApplicationValidator");
const { StatusCodes } = require("http-status-codes");

/**
 * Application Service - Business logic layer
 * Handles application-related business operations including job applications,
 * application reviews, and application statistics
 */
class ApplicationService {
  constructor() {
    this.jobRepository = new JobRepository();
    this.userRepository = new UserRepository();
    this.matchRepository = new MatchRepository();
  }
  /**
   * Apply for a job
   * @param {String} jobId - Job ID
   * @param {String} userId - User ID
   * @returns {Promise<Object>} - Service response object
   */
  async applyForJob(jobId, userId) {
    try {
      // Validate input data
      const validation = ApplicationValidator.validateApplyForJob({ jobId });
      if (validation.error) {
        return {
          error: {
            message: "Validation failed",
            details: validation.error.details.map(detail => detail.message)
          },
          statusCode: StatusCodes.BAD_REQUEST
        };
      }

      // Check if job exists and is active
      const job = await this.jobRepository.findById(jobId);
      if (!job) {
        return {
          error: {
            message: "Job not found",
          },
          statusCode: StatusCodes.NOT_FOUND,
        };
      }

      if (!job.isActive) {
        return {
          error: {
            message: "Job is no longer active",
          },
          statusCode: StatusCodes.BAD_REQUEST,
        };
      }

      // Check if user exists and is a talent
      const user = await this.userRepository.findById(userId);
      if (!user) {
        return {
          error: {
            message: "User not found",
          },
          statusCode: StatusCodes.NOT_FOUND,
        };
      }

      if (user.role !== "talent") {
        return {
          error: {
            message: "Only talents can apply for jobs",
          },
          statusCode: StatusCodes.FORBIDDEN,
        };
      }

      // Check if already applied
      const existingApplication = await ApplicationRepository.findByJobAndUser(
        jobId,
        userId
      );
      if (existingApplication) {
        return {
          error: {
            message: "You have already applied for this job",
          },
          statusCode: StatusCodes.CONFLICT,
        };
      }

      // Create application
      const applicationData = {
        jobId,
        userId,
        status: "pending",
      };

      const application = await ApplicationRepository.create(applicationData);

      return {
        data: { application },
        statusCode: StatusCodes.CREATED,
      };
    } catch (error) {
      console.error("ApplicationService.applyForJob error:", error);
      return {
        error: {
          message: "Error creating application",
          details: error.message,
        },
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      };
    }
  }

  /**
   * Get all applications (for admin)
   * @param {Object} options - Query options
   * @returns {Promise<Object>} - Service response object
   */
  async getAllApplications(options = {}) {
    try {
      // Validate query parameters
      const validation = ApplicationValidator.validateGetApplicationsQuery(options);
      if (validation.error) {
        return {
          error: {
            message: "Validation failed",
            details: validation.error.details.map(detail => detail.message)
          },
          statusCode: StatusCodes.BAD_REQUEST
        };
      }

      const validatedOptions = validation.value;
      const result = await ApplicationRepository.findAll({}, validatedOptions);

      return {
        data: {
          applications: result.applications,
          count: result.total,
          pagination: {
            page: result.page,
            pages: result.pages,
            total: result.total,
          },
        },
        statusCode: StatusCodes.OK,
      };
    } catch (error) {
      console.error("ApplicationService.getAllApplications error:", error);
      return {
        error: {
          message: "Error fetching applications",
          details: error.message,
        },
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      };
    }
  }

  /**
   * Get applications by user (for talent)
   * @param {String} userId - User ID
   * @returns {Promise<Object>} - Service response object
   */
  async getUserApplications(userId) {
    try {
      const applications = await ApplicationRepository.findByUserId(userId);

      return {
        data: {
          applications,
          count: applications.length,
        },
        statusCode: StatusCodes.OK,
      };
    } catch (error) {
      console.error("ApplicationService.getUserApplications error:", error);
      return {
        error: {
          message: "Error fetching user applications",
          details: error.message,
        },
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      };
    }
  }

  /**
   * Review application (admin can match, reject, etc.)
   * @param {String} applicationId - Application ID
   * @param {String} status - New status
   * @param {String} reviewedBy - Admin user ID
   * @returns {Promise<Object>} - Service response object
   */
  async reviewApplication(applicationId, status, reviewedBy) {
    try {
      // Validate input data
      const validation = ApplicationValidator.validateReviewApplication({ status });
      if (validation.error) {
        return {
          error: {
            message: "Validation failed",
            details: validation.error.details.map(detail => detail.message)
          },
          statusCode: StatusCodes.BAD_REQUEST
        };
      }

      const application = await ApplicationRepository.updateStatus(
        applicationId,
        status,
        reviewedBy
      );

      if (!application) {
        return {
          error: {
            message: "Application not found",
          },
          statusCode: StatusCodes.NOT_FOUND,
        };
      }

      // If status is "matched", create a Match record
      if (status === "matched") {
        try {
          // Check if match already exists
          const existingMatch = await this.matchRepository.findByUserAndJob(
            application.userId._id,
            application.jobId._id
          );
          
          if (!existingMatch) {
            const matchData = {
              jobId: application.jobId._id,
              userId: application.userId._id,
              matchedBy: reviewedBy,
              status: "matched"
            };
            await this.matchRepository.create(matchData);
          }
        } catch (matchError) {
          console.error("Error creating match record:", matchError);
        }
      }

      return {
        data: { application },
        statusCode: StatusCodes.OK,
      };
    } catch (error) {
      console.error("ApplicationService.reviewApplication error:", error);
      return {
        error: {
          message: "Error reviewing application",
          details: error.message,
        },
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      };
    }
  }

  /**
   * Check if user has applied for a specific job
   * @param {String} jobId - Job ID
   * @param {String} userId - User ID
   * @returns {Promise<Object>} - Service response object
   */
  async checkApplicationStatus(jobId, userId) {
    try {
      const application = await ApplicationRepository.findByJobAndUser(
        jobId,
        userId
      );

      return {
        data: {
          hasApplied: !!application,
          application: application || null,
        },
        statusCode: StatusCodes.OK,
      };
    } catch (error) {
      console.error("ApplicationService.checkApplicationStatus error:", error);
      return {
        error: {
          message: "Error checking application status",
          details: error.message,
        },
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      };
    }
  }

  /**
   * Get application statistics for dashboard
   * @returns {Promise<Object>} - Service response object
   */
  async getApplicationStats() {
    try {
      const stats = await ApplicationRepository.getCountByStatus();

      // Convert to object for easier use
      const statsObj = {
        pending: 0,
        matched: 0,
        rejected: 0,
        withdrawn: 0,
        total: 0,
      };

      stats.forEach((stat) => {
        statsObj[stat._id] = stat.count;
        statsObj.total += stat.count;
      });

      return {
        data: { stats: statsObj },
        statusCode: StatusCodes.OK,
      };
    } catch (error) {
      console.error("ApplicationService.getApplicationStats error:", error);
      return {
        error: {
          message: "Error fetching application statistics",
          details: error.message,
        },
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      };
    }
  }
}

module.exports = new ApplicationService();
