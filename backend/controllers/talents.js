const { StatusCodes } = require('http-status-codes');
const UserService = require('../services/UserService');

// @desc    Get all talents
// @route   GET /api/talents
// @access  Public
exports.getTalents = async (req, res) => {
  try {
    const result = await UserService.getAllTalents();

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
      data: result.data.talents
    });
  } catch (error) {
    console.error('GetTalents controller error:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: 'Server Error'
    });
  }
};
