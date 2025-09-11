const { StatusCodes } = require('http-status-codes');
const UserService = require('../services/UserService');

// @desc    Get users with optional role filtering
// @route   GET /api/users?role=talent
// @access  Private (Admin only)
exports.getUsers = async (req, res) => {
  try {
    const { role } = req.query;
    const filters = {};
    
    // Add role filter if provided and valid
    if (role && ['talent', 'admin'].includes(role)) {
      filters.role = role;
    }

    const result = await UserService.getUsers(filters);

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
      data: result.data.users
    });
  } catch (error) {
    console.error('GetUsers controller error:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: 'Server Error'
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, email, location, skills } = req.body;

    const result = await UserService.updateProfile(userId, {
      name,
      email,
      location,
      skills
    });

    if (result.error) {
      return res.status(result.statusCode).json({
        status: false,
        message: result.error.message,
        errors: result.error.details || null
      });
    }

    res.status(result.statusCode).json({
      status: true,
      message: 'Profile updated successfully',
      data: result.data.user
    });
  } catch (error) {
    console.error('UpdateProfile controller error:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: 'Server Error'
    });
  }
};
