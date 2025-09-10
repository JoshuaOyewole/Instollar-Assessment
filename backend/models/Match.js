const mongoose = require('mongoose');
const { ref } = require('process');

const matchSchema = new mongoose.Schema({
  jobId: {
    type: mongoose.Schema.ObjectId,
    ref: 'Job',
    required: true
  },
  userId: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  matchedBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['matched', 'viewed', 'applied'],
    default: 'matched'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Ensure a user can only be matched to a job once
matchSchema.index({ jobId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('Match', matchSchema);
