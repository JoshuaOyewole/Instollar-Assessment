const { StatusCodes } = require('http-status-codes');
const jobService = require('../services/JobService');

// @desc    Get all jobs
// @route   GET /api/jobs
// @access  Public
exports.getJobs = async (req, res) => {
  try {
    const result = await jobService.getAllJobs();
    
    if (result.error) {
      return res.status(result.statusCode).json({
        status: false,
        message: result.error.message,
        errors: result.error.details || null
      });
    }

    res.status(result.statusCode).json({
      status: true,
      count: result.data.count,
      data: result.data.jobs
    });
  } catch (error) {
    console.error('GetJobs controller error:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: 'Server Error'
    });
  }
};

// @desc    Get single job
// @route   GET /api/jobs/:id
// @access  Public
exports.getJob = async (req, res) => {
  try {
    const result = await jobService.getJobById(req.params.id);
    
    if (result.error) {
      return res.status(result.statusCode).json({
        status: false,
        message: result.error.message
      });
    }

    res.status(result.statusCode).json({
      status: true,
      data: result.data.job
    });
  } catch (error) {
    console.error('GetJob controller error:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: 'Server Error'
    });
  }
};

// @desc    Create new job
// @route   POST /api/jobs
// @access  Private (Admin only)
exports.createJob = async (req, res) => {
  try {
    const result = await jobService.createJob(req.body, req.user.id);
    
    if (result.error) {
      return res.status(result.statusCode).json({
        status: false,
        message: result.error.message,
        errors: result.error.details || null
      });
    }

    res.status(result.statusCode).json({
      status: true,
      data: result.data.job
    });
  } catch (error) {
    console.error('CreateJob controller error:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: 'Server Error'
    });
  }
};

// @desc    Delete job
// @route   DELETE /api/jobs/:id
// @access  Private (Admin only)
exports.deleteJob = async (req, res) => {
  try {
    const result = await jobService.deleteJob(req.params.id, req.user.id);
    
    if (result.error) {
      return res.status(result.statusCode).json({
        status: false,
        message: result.error.message
      });
    }

    res.status(result.statusCode).json({
      status: true,
      message: result.data.message
    });
  } catch (error) {
    console.error('DeleteJob controller error:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: 'Server Error'
    });
  }
};
