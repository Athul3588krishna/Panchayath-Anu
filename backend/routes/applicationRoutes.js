const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const {
  applyScheme,
  getMyApplications,
  getAllApplications,
  updateApplicationStatus,
  deleteApplication
} = require('../controllers/applicationController');

router.post('/', protect, applyScheme);
router.get('/my', protect, getMyApplications);

router.get('/', protect, admin, getAllApplications);
router.put('/:id', protect, admin, updateApplicationStatus);
router.delete('/:id', protect, admin, deleteApplication);

module.exports = router;
