const express = require('express');
const router = express.Router();
const {
  applyScheme,
  getMyApplications,
  getAllApplications,
  updateApplicationStatus
} = require('../controllers/applicationController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, applyScheme)
  .get(protect, admin, getAllApplications);

router.get('/my', protect, getMyApplications);

router.route('/:id')
  .put(protect, admin, updateApplicationStatus);

module.exports = router;
