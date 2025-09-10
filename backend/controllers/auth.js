const { StatusCodes } = require('http-status-codes');
const userService = require('../services/UserService');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const result = await userService.createUser(req.body);
    
    if (result.error) {
      return res.status(result.statusCode).json({
        status: false,
        message: result.error.message,
        errors: result.error.details || null
      });
    }

    res.status(result.statusCode).json({
      status: true,
      token: result.data.token,
      data: result.data.user
    });
  } catch (error) {
    console.error('Register controller error:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: 'Server Error'
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const result = await userService.loginUser(req.body);
    
    if (result.error) {
      return res.status(result.statusCode).json({
        status: false,
        message: result.error.message,
        errors: result.error.details || null
      });
    }

    res.status(result.statusCode).json({
      status: true,
      token: result.data.token,
      data: result.data.user
    });
  } catch (error) {
    console.error('Login controller error:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: 'Server Error'
    });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const result = await userService.getCurrentUser(req.user.id);
    
    if (result.error) {
      return res.status(result.statusCode).json({
        status: false,
        message: result.error.message
      });
    }

    res.status(result.statusCode).json({
      status: true,
      data: result.data.user
    });
  } catch (error) {
    console.error('GetMe controller error:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: 'Server Error'
    });
  }
};
