const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Please provide a job title"],
    maxlength: 100,
  },
  description: {
    type: String,
    required: [true, "Please provide a job description"],
    maxlength: 3000,
  },
  location: {
    type: String,
    required: [true, "Please provide a location"],
    maxlength: 100,
  },
  requiredSkills: [
    {
      type: String,
      maxlength: 200,
      required: [true, "Please provide required skills"],
    },
  ],
  isActive: {
    type: Boolean,
    default: true,
  },
  createdBy: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Job", jobSchema);
