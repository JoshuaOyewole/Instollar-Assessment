const ApplicationService = require('../services/ApplicationService');
const { StatusCodes } = require('http-status-codes');

/**
 * Apply for a job
 * @route POST /api/applications/apply
 * @access Private/Talent
 */
const applyForJob = async (req, res) => {
  try {
    const { jobId } = req.body;
    const userId = req.user.id;

    if (!jobId) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'Job ID not found'
      });
    }

    const result = await ApplicationService.applyForJob(jobId, userId);

    if (result.error) {
      return res.status(result.statusCode).json({
        success: false,
        message: result.error.message,
        details: result.error.details || null
      });
    }

    res.status(result.statusCode).json({
      success: true,
      message: 'Application submitted successfully',
      data: result.data.application
    });
  } catch (error) {
    console.error('ApplyForJob controller error:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Server error while applying for job'
    });
  }
};

/**
 * Get all applications (Admin only)
 * @route GET /api/applications
 * @access Private/Admin
 */
const getAllApplications = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const options = { page: parseInt(page), limit: parseInt(limit) };
    
    if (status) {
      options.status = status;
    }

    const result = await ApplicationService.getAllApplications(options);

    if (result.error) {
      return res.status(result.statusCode).json({
        success: false,
        message: result.error.message
      });
    }

    res.status(result.statusCode).json({
      success: true,
      count: result.data.count,
      pagination: result.data.pagination,
      data: result.data.applications
    });
  } catch (error) {
    console.error('GetAllApplications controller error:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Server error while fetching applications'
    });
  }
};

/**
 * Get user's applications
 * @route GET /api/applications/my-applications
 * @access Private/Talent
 */
const getUserApplications = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await ApplicationService.getUserApplications(userId);

    if (result.error) {
      return res.status(result.statusCode).json({
        success: false,
        message: result.error.message
      });
    }

    res.status(result.statusCode).json({
      success: true,
      count: result.data.count,
      data: result.data.applications
    });
  } catch (error) {
    console.error('GetUserApplications controller error:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Server error while fetching user applications'
    });
  }
};

/**
 * Review application (Admin only)
 * @route PATCH /api/applications/:id/review
 * @access Private/Admin
 */
const reviewApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const { status} = req.body;
    const reviewedBy = req.user.id;

    if (!status) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'Status is required'
      });
    }

    const result = await ApplicationService.reviewApplication(id, status, reviewedBy);

    if (result.error) {
      return res.status(result.statusCode).json({
        success: false,
        message: result.error.message
      });
    }

    res.status(result.statusCode).json({
      success: true,
      message: 'Application reviewed successfully',
      data: result.data.application
    });
  } catch (error) {
    console.error('ReviewApplication controller error:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Server error while reviewing application'
    });
  }
};

/**
 * Check application status for a job
 * @route GET /api/applications/check/:jobId
 * @access Private/Talent
 */
const checkApplicationStatus = async (req, res) => {
  try {
    const { jobId } = req.params;
    const userId = req.user.id;

    const result = await ApplicationService.checkApplicationStatus(jobId, userId);

    if (result.error) {
      return res.status(result.statusCode).json({
        success: false,
        message: result.error.message
      });
    }

    res.status(result.statusCode).json({
      success: true,
      data: result.data
    });
  } catch (error) {
    console.error('CheckApplicationStatus controller error:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Server error while checking application status'
    });
  }
};

/**
 * Get application statistics
 * @route GET /api/applications/stats
 * @access Private/Admin
 */
const getApplicationStats = async (req, res) => {
  try {
    const result = await ApplicationService.getApplicationStats();

    if (result.error) {
      return res.status(result.statusCode).json({
        success: false,
        message: result.error.message
      });
    }

    res.status(result.statusCode).json({
      success: true,
      data: result.data.stats
    });
  } catch (error) {
    console.error('GetApplicationStats controller error:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Server error while fetching application stats'
    });
  }
};

module.exports = {
  applyForJob,
  getAllApplications,
  getUserApplications,
  reviewApplication,
  checkApplicationStatus,
  getApplicationStats
};
