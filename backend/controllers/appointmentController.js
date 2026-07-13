const Appointment = require('../models/Appointment');

// POST /api/appointments — Citizen books a slot
const bookAppointment = async (req, res) => {
  try {
    const { date, timeSlot, purpose } = req.body;
    if (!date || !timeSlot || !purpose) {
      return res.status(400).json({ message: 'Date, time slot and purpose are required.' });
    }

    // Prevent double-booking same slot
    const existing = await Appointment.findOne({
      date: new Date(date),
      timeSlot,
      status: { $ne: 'Cancelled' }
    });
    if (existing) {
      return res.status(409).json({ message: 'This time slot is already booked. Please choose another.' });
    }

    const appointment = await Appointment.create({
      user: req.user._id,
      date: new Date(date),
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

// GET /api/appointments/my — Citizen's own appointments
const getMyAppointments = async (req, res) => {
  try {
    const Appointment = require('../models/Appointment');
    const JsonDb = require('../models/jsonDb');
    const mongoose = require('mongoose');

    let appointments;
    if (mongoose.connection.readyState === 1) {
      appointments = await require('mongoose').model('Appointment')
        .find({ user: req.user._id })
        .populate('user', 'name email')
        .sort({ date: 1 });
    } else {
      const jsonDb = new JsonDb('appointments');
      const all = await jsonDb.find({});
      appointments = all.filter(a => String(a.user) === String(req.user._id))
        .sort((a, b) => new Date(a.date) - new Date(b.date));
    }
    res.json(appointments);
  } catch (err) {
    console.error('getMyAppointments error:', err);
    res.status(500).json({ message: 'Server error fetching appointments.' });
  }
};

// GET /api/appointments — Admin: all appointments
const getAllAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({});
    res.json(appointments);
  } catch (err) {
    console.error('getAllAppointments error:', err);
    res.status(500).json({ message: 'Server error fetching appointments.' });
  }
};

// PUT /api/appointments/:id — Admin: update status + note
const updateAppointment = async (req, res) => {
  try {
    const { status, adminNote } = req.body;
    const Appointment = require('../models/Appointment');
    const mongoose = require('mongoose');

    let appointment;
    if (mongoose.connection.readyState === 1) {
      appointment = await require('mongoose').model('Appointment').findById(req.params.id);
    } else {
      const JsonDb = require('../models/jsonDb');
      const jsonDb = new JsonDb('appointments');
      appointment = await jsonDb.findById(req.params.id);
      if (appointment) {
        const items = jsonDb.read();
        const idx = items.findIndex(i => String(i._id) === String(req.params.id));
        if (idx !== -1) {
          items[idx].status = status || items[idx].status;
          items[idx].adminNote = adminNote !== undefined ? adminNote : items[idx].adminNote;
          jsonDb.write(items);
          return res.json({ message: 'Appointment updated.', appointment: items[idx] });
        }
      }
    }

    if (!appointment) return res.status(404).json({ message: 'Appointment not found.' });

    if (status) appointment.status = status;
    if (adminNote !== undefined) appointment.adminNote = adminNote;
    await appointment.save();

    res.json({ message: 'Appointment updated successfully.', appointment });
  } catch (err) {
    console.error('updateAppointment error:', err);
    res.status(500).json({ message: 'Server error updating appointment.' });
  }
};

// GET /api/appointments/booked-slots — Public: get booked slots for a date
const getBookedSlots = async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) return res.json([]);

    const Appointment = require('../models/Appointment');
    const mongoose = require('mongoose');
    let booked;

    if (mongoose.connection.readyState === 1) {
      const appts = await require('mongoose').model('Appointment')
        .find({ date: new Date(date), status: { $ne: 'Cancelled' } });
      booked = appts.map(a => a.timeSlot);
    } else {
      const JsonDb = require('../models/jsonDb');
      const jsonDb = new JsonDb('appointments');
      const all = await jsonDb.find({});
      const dateStr = new Date(date).toDateString();
      booked = all
        .filter(a => new Date(a.date).toDateString() === dateStr && a.status !== 'Cancelled')
        .map(a => a.timeSlot);
    }
    res.json(booked);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching booked slots.' });
  }
};

module.exports = { bookAppointment, getMyAppointments, getAllAppointments, updateAppointment, getBookedSlots };
