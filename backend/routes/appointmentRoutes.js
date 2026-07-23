const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const {
  bookAppointment,
  getMyAppointments,
  getAllAppointments,
  updateAppointment,
  getBookedSlots,
  cancelAppointment
} = require('../controllers/appointmentController');

router.get('/booked-slots', getBookedSlots);

router.post('/', protect, bookAppointment);
router.get('/my', protect, getMyAppointments);
router.delete('/:id', protect, cancelAppointment);

router.get('/', protect, admin, getAllAppointments);
router.put('/:id', protect, admin, updateAppointment);

module.exports = router;
