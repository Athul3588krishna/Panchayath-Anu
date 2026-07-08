const express = require('express');
const router = express.Router();
const {
  getSchemes,
  getSchemeById,
  createScheme,
  updateScheme,
  deleteScheme,
  incrementDownloads,
  checkEligibility
} = require('../controllers/schemeController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
  .get(getSchemes)
  .post(protect, admin, createScheme);

router.post('/check-eligibility', checkEligibility);

router.route('/:id')
  .get(getSchemeById)
  .put(protect, admin, updateScheme)
  .delete(protect, admin, deleteScheme);

router.post('/:id/download', incrementDownloads);

module.exports = router;
