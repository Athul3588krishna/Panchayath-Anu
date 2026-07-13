const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const {
  bookAppointment,
  getMyAppointments,
  getAllAppointments,
  updateAppointment,
  getBookedSlots
} = require('../controllers/appointmentController');

// Public — check available slots for a date
router.get('/booked-slots', getBookedSlots);

// Citizen routes
router.post('/', protect, bookAppointment);
router.get('/my', protect, getMyAppointments);

// Admin routes
router.get('/', protect, adminOnly, getAllAppointments);
router.put('/:id', protect, adminOnly, updateAppointment);

module.exports = router;
