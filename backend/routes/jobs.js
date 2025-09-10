const express = require('express');
const {
  getJobs,
  getJob,
  createJob,
  deleteJob
} = require('../controllers/jobs');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router
  .route('/')
  .get(getJobs)
  .post(protect, authorize('admin'), createJob);

router
  .route('/:id')
  .get(getJob)
  .delete(protect, authorize('admin'), deleteJob);

module.exports = router;
