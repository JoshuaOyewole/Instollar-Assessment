"use strict";
const Job = require("../models/Job");

/**
 * Job Repository - Data access layer
 * Handles all database operations for Job model
 */
class JobRepository {
    // Create a new job
    async create(jobData) {
        return await Job.create(jobData);
    }

    // Find job by ID
    async findById(id) {
        return await Job.findById(id).populate('createdBy', 'name email');
    }

    // Find all active jobs
    async findAllActive() {
        return await Job.find({ isActive: true })
            .populate('createdBy', 'name email')
            .sort('-createdAt');
    }

    /**
     * Delete job by ID
     * @param {String} id - Job ID
     * @returns {Promise<Object|null>} - Deleted job or null
     */
    async delete(id) {
        return await Job.findByIdAndDelete(id);
    }

    /**
     * Find jobs created by a specific user
     * @param {String} userId - User ID
     * @returns {Promise<Array>} - Array of jobs
     */
    async findByCreator(userId) {
        return await Job.find({ createdBy: userId })
            .populate('createdBy', 'name email')
            .sort('-createdAt');
    }
}

module.exports = JobRepository;
