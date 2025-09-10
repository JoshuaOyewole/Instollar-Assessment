const Application = require("../models/Application");

class ApplicationRepository {
  //Create a new application
  async create(applicationData) {
    try {
      const application = new Application(applicationData);
      await application.save();
      await application.populate([
        { path: "jobId", select: "title company location" },
        { path: "userId", select: "name email" },
      ]);
      return application;
    } catch (error) {
      throw error;
    }
  }

  //Find application by job and user
  async findByJobAndUser(jobId, userId) {
    try {
      return await Application.findOne({ jobId, userId }).populate([
        { path: "jobId", select: "title company location" },
        { path: "userId", select: "name email" },
      ]);
    } catch (error) {
      throw error;
    }
  }

  // Get all applications with pagination
  async findAll(query = {}, options = {}) {
    try {
      const { page = 1, limit = 10, status } = options;
      const filter = {};

      if (status) {
        filter.status = status;
      }

      const applications = await Application.find(filter)
        .populate([
          { path: "jobId", select: "title company location isActive" },
          { path: "userId", select: "name email role" },
          { path: "reviewedBy", select: "name" },
        ])
        .sort({ appliedAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

      const total = await Application.countDocuments(filter);

      return {
        applications,
        total,
        page,
        pages: Math.ceil(total / limit),
      };
    } catch (error) {
      throw error;
    }
  }

  // Get applications by user ID
  async findByUserId(userId) {
    try {
      return await Application.find({ userId })
        .populate([
          { path: "jobId", select: "title company location isActive" },
          { path: "reviewedBy", select: "name" },
        ])
        .sort({ appliedAt: -1 });
    } catch (error) {
      throw error;
    }
  }

  // Update application status
  async updateStatus(applicationId, status, reviewedBy = null) {
    try {
      const updateData = {
        status,
        reviewedAt: new Date(),
      };

      if (reviewedBy) {
        updateData.reviewedBy = reviewedBy;
      }

      return await Application.findByIdAndUpdate(applicationId, updateData, {
        new: true,
      }).populate([
        { path: "jobId", select: "title company location" },
        { path: "userId", select: "name email" },
        { path: "reviewedBy", select: "name" },
      ]);
    } catch (error) {
      throw error;
    }
  }

  //Delete application
  async delete(applicationId) {
    try {
      return await Application.findByIdAndDelete(applicationId);
    } catch (error) {
      throw error;
    }
  }

  // Get applications count by status
  async getCountByStatus() {
    try {
      return await Application.aggregate([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ]);
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new ApplicationRepository();
