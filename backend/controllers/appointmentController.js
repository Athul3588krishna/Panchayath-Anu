const mongoose = require('mongoose');
const Appointment = require('../models/Appointment');
const JsonDb = require('../models/jsonDb');

const getJsonDb = () => new JsonDb('appointments');
const isMongoUp = () => mongoose.connection.readyState === 1;

const bookAppointment = async (req, res) => {
  try {
    const { date, timeSlot, purpose } = req.body;

    if (!date || !timeSlot || !purpose) {
      return res.status(400).json({ message: 'Date, time slot and purpose are required.' });
    }

    const validSlots = ['10:00 AM', '11:00 AM', '12:00 PM', '02:00 PM', '03:00 PM', '04:00 PM'];
    if (!validSlots.includes(timeSlot)) {
      return res.status(400).json({ message: 'Invalid time slot selected.' });
    }

    const appointmentDate = new Date(date);
    if (isNaN(appointmentDate.getTime())) {
      return res.status(400).json({ message: 'Invalid date format.' });
    }

    
    if (appointmentDate.getDay() === 0) {
      return res.status(400).json({ message: 'Appointments are not available on Sundays.' });
    }

    
    let slotTaken = false;
    if (isMongoUp()) {
      const existing = await mongoose.model('Appointment').findOne({
        date: appointmentDate,
        timeSlot,
        status: { $ne: 'Cancelled' }
      });
      slotTaken = !!existing;
    } else {
      const db = getJsonDb();
      const all = await db.find({});
      const dateStr = appointmentDate.toDateString();
      slotTaken = all.some(
        a => new Date(a.date).toDateString() === dateStr &&
             a.timeSlot === timeSlot &&
             a.status !== 'Cancelled'
      );
    }

    if (slotTaken) {
      return res.status(409).json({ message: 'This time slot is already booked. Please choose another.' });
    }

    const appointment = await Appointment.create({
      user: req.user._id,
      date: appointmentDate,
      timeSlot,
      purpose: purpose.trim(),
      status: 'Pending'
    });

    res.status(201).json({ message: 'Appointment booked successfully!', appointment });
  } catch (err) {
    console.error('bookAppointment error:', err);
    res.status(500).json({ message: 'Server error booking appointment.' });
  }
};

const getMyAppointments = async (req, res) => {
  try {
    let appointments;
    if (isMongoUp()) {
      appointments = await mongoose.model('Appointment')
        .find({ user: req.user._id })
        .sort({ date: 1 });
    } else {
      const db = getJsonDb();
      const all = await db.find({});
      appointments = all
        .filter(a => String(a.user) === String(req.user._id))
        .sort((a, b) => new Date(a.date) - new Date(b.date));
    }
    res.json(appointments);
  } catch (err) {
    console.error('getMyAppointments error:', err);
    res.status(500).json({ message: 'Server error fetching appointments.' });
  }
};

const getAllAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({});
    res.json(appointments);
  } catch (err) {
    console.error('getAllAppointments error:', err);
    res.status(500).json({ message: 'Server error fetching appointments.' });
  }
};

const updateAppointment = async (req, res) => {
  try {
    const { status, adminNote } = req.body;

    const validStatuses = ['Pending', 'Confirmed', 'Cancelled'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ message: `Invalid status. Must be: ${validStatuses.join(', ')}` });
    }

    let appointment;

    if (isMongoUp()) {
      appointment = await mongoose.model('Appointment').findById(req.params.id);
      if (!appointment) return res.status(404).json({ message: 'Appointment not found.' });
      if (status) appointment.status = status;
      if (adminNote !== undefined) appointment.adminNote = adminNote;
      await appointment.save();
    } else {
      const db = getJsonDb();
      const items = db.read();
      const idx = items.findIndex(i => String(i._id) === String(req.params.id));
      if (idx === -1) return res.status(404).json({ message: 'Appointment not found.' });
      if (status) items[idx].status = status;
      if (adminNote !== undefined) items[idx].adminNote = adminNote;
      db.write(items);
      appointment = items[idx];
    }

    res.json({ message: 'Appointment updated successfully.', appointment });
  } catch (err) {
    console.error('updateAppointment error:', err);
    res.status(500).json({ message: 'Server error updating appointment.' });
  }
};

const getBookedSlots = async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) return res.json([]);

    const targetDate = new Date(date);
    const dateStr = targetDate.toDateString();
    let booked = [];

    if (isMongoUp()) {
      
      const start = new Date(targetDate); start.setHours(0, 0, 0, 0);
      const end = new Date(targetDate); end.setHours(23, 59, 59, 999);
      const appts = await mongoose.model('Appointment').find({
        date: { $gte: start, $lte: end },
        status: { $ne: 'Cancelled' }
      });
      booked = appts.map(a => a.timeSlot);
    } else {
      const db = getJsonDb();
      const all = await db.find({});
      booked = all
        .filter(a => new Date(a.date).toDateString() === dateStr && a.status !== 'Cancelled')
        .map(a => a.timeSlot);
    }

    res.json(booked);
  } catch (err) {
    console.error('getBookedSlots error:', err);
    res.status(500).json({ message: 'Error fetching booked slots.' });
  }
};

const cancelAppointment = async (req, res) => {
  try {
    if (isMongoUp()) {
      const appt = await mongoose.model('Appointment').findById(req.params.id);
      if (!appt) return res.status(404).json({ message: 'Appointment not found.' });
      if (String(appt.user) !== String(req.user._id)) {
        return res.status(403).json({ message: 'Not authorized to cancel this appointment.' });
      }
      appt.status = 'Cancelled';
      await appt.save();
    } else {
      const db = getJsonDb();
      const items = db.read();
      const idx = items.findIndex(i => String(i._id) === String(req.params.id));
      if (idx === -1) return res.status(404).json({ message: 'Appointment not found.' });
      if (String(items[idx].user) !== String(req.user._id)) {
        return res.status(403).json({ message: 'Not authorized.' });
      }
      items[idx].status = 'Cancelled';
      db.write(items);
    }
    res.json({ message: 'Appointment cancelled successfully.' });
  } catch (err) {
    console.error('cancelAppointment error:', err);
    res.status(500).json({ message: 'Server error cancelling appointment.' });
  }
};

module.exports = {
  bookAppointment,
  getMyAppointments,
  getAllAppointments,
  updateAppointment,
  getBookedSlots,
  cancelAppointment
};
