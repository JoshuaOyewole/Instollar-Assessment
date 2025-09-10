const express = require('express');
const {
  createMatch,
  getAllMatches,
  applyToJob,
  getTalentMatches
} = require('../controllers/matches');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', protect, authorize('admin'), getAllMatches);
router.post('/', protect, authorize('admin'), createMatch);
router.post('/apply', protect, authorize('talent'), applyToJob);
router.get('/my-matches', protect, authorize('talent'), getTalentMatches);

module.exports = router;
