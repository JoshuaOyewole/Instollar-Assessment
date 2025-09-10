"use strict";
const { StatusCodes } = require("http-status-codes");
const JobRepository = require("../repositories/JobRepository");
const jobValidator = require("../validators/JobValidator");

/**
 * Job Service - Business logic layer
 * Handles job-related business operations
 */
class JobService {
    constructor() {
        this.jobRepository = new JobRepository();
    }
    /**
     * Get all active jobs
     * @param {Object} options - Query options
     * @returns {Promise<Object>} - Service response object
     */
    async getAllJobs(options = {}) {
        try {
            const jobs = await this.jobRepository.findAllActive();
            
            return {
                data: {
                    jobs: jobs.map(job => ({
                        id: job._id,
                        title: job.title,
                        description: job.description,
                        location: job.location,
                        requiredSkills: job.requiredSkills,
                        createdAt: job.createdAt,
                        createdBy: job.createdBy
                    })),
                    count: jobs.length
                },
                statusCode: StatusCodes.OK
            };
        } catch (error) {
            console.error("An unknown error occurred while fetching jobs:", error);
            return {
                error: {
                    message: "Internal server error occurred while fetching jobs",
                    details: error.message
                },
                statusCode: StatusCodes.INTERNAL_SERVER_ERROR
            };
        }
    }

    /**
     * Get job by ID
     * @param {String} jobId - Job ID
     * @returns {Promise<Object>} - Service response object
     */
    async getJobById(jobId) {
        try {
            const job = await this.jobRepository.findById(jobId);
            
            if (!job) {
                return {
                    error: {
                        message: "Job not found",
                        field: "jobId"
                    },
                    statusCode: StatusCodes.NOT_FOUND
                };
            }

            return {
                data: {
                    job: {
                        id: job._id,
                        title: job.title,
                        description: job.description,
                        location: job.location,
                        requiredSkills: job.requiredSkills,
                        isActive: job.isActive,
                        createdAt: job.createdAt,
                        createdBy: job.createdBy
                    }
                },
                statusCode: StatusCodes.OK
            };
        } catch (error) {
            console.error("An unknown error occurred while fetching job:", error);
            return {
                error: {
                    message: "Internal server error occurred while fetching job",
                    details: error.message
                },
                statusCode: StatusCodes.INTERNAL_SERVER_ERROR
            };
        }
    }

    /**
     * Create a new job
     * @param {Object} body - Request body containing job data
     * @param {String} userId - ID of the user creating the job
     * @returns {Promise<Object>} - Service response object
     */
    async createJob(body, userId) {
        try {
            // Validate input data
            const validation = await jobValidator.createJob(body);
            if (!validation.isValid) {
                return {
                    error: {
                        message: validation.errors[0].message,
                        details: validation.errors
                    },
                    statusCode: StatusCodes.BAD_REQUEST
                };
            }

            // Create new job
            const jobData = {
                ...validation.data,
                createdBy: userId
            };

            const job = await this.jobRepository.create(jobData);
            const populatedJob = await this.jobRepository.findById(job._id);

            return {
                data: {
                    job: {
                        id: populatedJob._id,
                        title: populatedJob.title,
                        description: populatedJob.description,
                        location: populatedJob.location,
                        requiredSkills: populatedJob.requiredSkills,
                        isActive: populatedJob.isActive,
                        createdAt: populatedJob.createdAt,
                        createdBy: populatedJob.createdBy
                    }
                },
                statusCode: StatusCodes.CREATED
            };
        } catch (error) {
            console.error("An unknown error occurred while creating job:", error);
            return {
                error: {
                    message: "Internal server error occurred while creating job",
                    details: error.message
                },
                statusCode: StatusCodes.INTERNAL_SERVER_ERROR
            };
        }
    }

    /**
     * Delete job by ID
     * @param {String} jobId - Job ID
     * @param {String} userId - ID of the user requesting deletion
     * @returns {Promise<Object>} - Service response object
     */
    async deleteJob(jobId, userId) {
        try {
            const job = await this.jobRepository.findById(jobId);
            
            if (!job) {
                return {
                    error: {
                        message: "Job not found",
                        field: "jobId"
                    },
                    statusCode: StatusCodes.NOT_FOUND
                };
            }

            // Optional: Check if user is the creator of the job
            // if (job.createdBy._id.toString() !== userId) {
            //     return {
            //         error: {
            //             message: "Not authorized to delete this job",
            //             field: "authorization"
            //         },
            //         statusCode: StatusCodes.FORBIDDEN
            //     };
            // }

            await this.jobRepository.delete(jobId);

            return {
                data: {
                    message: "Job deleted successfully"
                },
                statusCode: StatusCodes.OK
            };
        } catch (error) {
            console.error("An unknown error occurred while deleting job:", error);
            return {
                error: {
                    message: "Internal server error occurred while deleting job",
                    details: error.message
                },
                statusCode: StatusCodes.INTERNAL_SERVER_ERROR
            };
        }
    }

    /**
     * Search jobs
     * @param {String} searchTerm - Search term
     * @param {Object} options - Query options
     * @returns {Promise<Object>} - Service response object
     */
    async searchJobs(searchTerm, options = {}) {
        try {
            const jobs = await this.jobRepository.findAllActive();
            
            return {
                data: {
                    jobs: jobs.map(job => ({
                        id: job._id,
                        title: job.title,
                        description: job.description,
                        location: job.location,
                        requiredSkills: job.requiredSkills,
                        createdAt: job.createdAt,
                        createdBy: job.createdBy
                    })),
                    count: jobs.length,
                    searchTerm: searchTerm
                },
                statusCode: StatusCodes.OK
            };
        } catch (error) {
            console.error("An unknown error occurred while searching jobs:", error);
            return {
                error: {
                    message: "Internal server error occurred while searching jobs",
                    details: error.message
                },
                statusCode: StatusCodes.INTERNAL_SERVER_ERROR
            };
        }
    }
}

module.exports = new JobService();
