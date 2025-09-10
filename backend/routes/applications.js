const express = require('express');
const {
  applyForJob,
  getAllApplications,
  getUserApplications,
  reviewApplication,
  checkApplicationStatus,
  getApplicationStats
} = require('../controllers/applications');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Apply for a job (Talent only)
router.post('/apply', protect, authorize('talent'), applyForJob);

// Get user's applications (Talent only)
router.get('/my-applications', protect, authorize('talent'), getUserApplications);

// Check application status for a specific job (Talent only)
router.get('/check/:jobId', protect, authorize('talent'), checkApplicationStatus);

// Get all applications (Admin only)
router.get('/', protect, authorize('admin'), getAllApplications);

// Get application statistics (Admin only)
router.get('/stats', protect, authorize('admin'), getApplicationStats);

// Review application (Admin only)
router.patch('/:id/review', protect, authorize('admin'), reviewApplication);

module.exports = router;
