const express = require('express');
const {
  getUsers
} = require('../controllers/users');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', protect, authorize('admin'), getUsers);


module.exports = router;
