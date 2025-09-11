const express = require('express');
const {
  getUsers,
  updateProfile
} = require('../controllers/users');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', protect, authorize('admin'), getUsers);
router.put('/profile', protect, updateProfile);

module.exports = router;
