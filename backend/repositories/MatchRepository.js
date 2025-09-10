const Match = require("../models/Match");

class MatchRepository {
  // Get all matches
  async findAll() {
    return await Match.find()
      .populate("userId", "name email")
      .populate("jobId", "title location description requiredSkills")
      .populate("matchedBy", "name email")
      .sort("-createdAt");
  }

  // Get matches by job ID
  async findByJobId(jobId) {
    return await Match.find({ jobId: jobId })
      .populate("userId", "name email")
      .sort("-createdAt");
  }

  // Create a new match
  async create(matchData) {
    try {
      const res = await Match.create(matchData);

      return res;
    } catch (error) {
      console.error("Error creating match in repository:", error);
      throw error;
    }
  }

  // Check if match exists
  async exists(userId, jobId) {
    const match = await Match.findOne({ userId: userId, jobId: jobId });
    return !!match;
  }

  // Get matches by user ID
  async findByUserId(userId) {
    return await Match.find({ userId: userId })
      .populate("jobId", "title location description requiredSkills")
      .populate("matchedBy", "name email")
      .sort("-createdAt");
  }

  // Find specific match by user and job
  async findByUserAndJob(userId, jobId) {
    return await Match.findOne({ userId: userId, jobId: jobId })
      .populate("jobId", "title location description requiredSkills")
      .populate("matchedBy", "name email")
      .populate("userId", "name email");
  }
}

module.exports = MatchRepository;
