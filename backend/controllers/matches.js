const { StatusCodes } = require("http-status-codes");
const matchService = require("../services/MatchService");

// @desc    Create a match between talent and job
// @route   POST /api/matches
// @access  Private (Admin only)
exports.createMatch = async (req, res) => {
  try {
    // Transform input to match service expectations
    const matchData = {
      user: req.body.userId,
      job: req.body.jobId,
      status: req.body.status || "matched",
      matchedBy: req.user.id, // Add the ID of the user creating the match
    };

    const result = await matchService.createMatch(matchData);

    if (result.error) {
      return res.status(result.statusCode).json({
        status: false,
        message: result.error.message,
        errors: result.error.details || null,
      });
    }

    res.status(result.statusCode).json({
      status: true,
      data: result.data.match,
    });
  } catch (error) {
    console.error("CreateMatch controller error:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: "Server Error",
    });
  }
};

// @desc    Get all matches (Admin only)
// @route   GET /api/matches
// @access  Private (Admin only)
exports.getAllMatches = async (req, res) => {
  try {
    const result = await matchService.getAllMatches();

    if (result.error) {
      return res.status(result.statusCode).json({
        status: false,
        message: result.error.message,
      });
    }

    res.status(result.statusCode).json({
      status: true,
      count: result.data.count,
      data: result.data.matches,
    });
  } catch (error) {
    console.error("GetAllMatches controller error:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: "Server Error",
    });
  }
};

// @desc    Apply to a job (Talent creates their own match)
// @route   POST /api/matches/apply
// @access  Private (Talent only)
exports.applyToJob = async (req, res) => {
  try {
    // Transform input to match service expectations
    const matchData = {
      user: req.user.id, // Use the current user's ID
      job: req.body.jobId,
      status: 'applied',
      matchedBy: req.user.id, // Talent applies themselves
    };

    const result = await matchService.createMatch(matchData);

    if (result.error) {
      return res.status(result.statusCode).json({
        status: false,
        message: result.error.message,
        errors: result.error.details || null
      });
    }

    res.status(result.statusCode).json({
      status: true,
      data: result.data.match
    });
  } catch (error) {
    console.error('ApplyToJob controller error:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: 'Server Error'
    });
  }
};

// @desc    Get all jobs matched to current talent
// @route   GET /api/matches/my-matches
// @access  Private (Talent only)
exports.getTalentMatches = async (req, res) => {
  try {
    const result = await matchService.getMatchesByUser(req.user.id);

    if (result.error) {
      return res.status(result.statusCode).json({
        status: false,
        message: result.error.message,
      });
    }

    res.status(result.statusCode).json({
      status: true,
      count: result.data.count,
      data: result.data.matches,
    });
  } catch (error) {
    console.error("GetTalentMatches controller error:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: "Server Error",
    });
  }
};
