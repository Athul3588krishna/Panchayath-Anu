const Application = require('../models/Application');
const Scheme = require('../models/Scheme');
const mongoose = require('mongoose');

const applyScheme = async (req, res) => {
  const { schemeId } = req.body;
  const userId = req.user._id;

  if (!schemeId) {
    return res.status(400).json({ message: 'schemeId is required' });
  }

  try {
    const scheme = await Scheme.findById(schemeId);
    if (!scheme) {
      return res.status(404).json({ message: 'Welfare scheme not found' });
    }

    
    const alreadyApplied = await Application.findOne({ scheme: schemeId, user: userId });
    if (alreadyApplied) {
      return res.status(400).json({ message: 'You have already submitted an application for this scheme' });
    }

    const application = await Application.create({
      scheme: schemeId,
      user: userId,
      status: 'Pending'
    });

    res.status(201).json({
      message: 'Application submitted successfully',
      application
    });
  } catch (error) {
    console.error('applyScheme error:', error);
    res.status(500).json({ message: error.message });
  }
};

const getMyApplications = async (req, res) => {
  try {
    let applications;

    if (mongoose.connection.readyState === 1) {
      
      applications = await mongoose.model('Application')
        .find({ user: req.user._id })
        .populate('scheme', 'title category description expiresAt')
        .sort({ appliedAt: -1 });
    } else {
      
      const JsonDb = require('../models/jsonDb');
      const jsonDb = new JsonDb('applications');
      const jsonSchemeDb = new JsonDb('schemes');
      const all = await jsonDb.find({});
      const myApps = all.filter(a => String(a.user) === String(req.user._id));
      applications = await Promise.all(
        myApps.map(async (app) => {
          const scheme = await jsonSchemeDb.findById(app.scheme);
          return { ...app, scheme: scheme || { title: 'Unknown Scheme', category: '' } };
        })
      );
      applications.sort((a, b) => new Date(b.appliedAt) - new Date(a.appliedAt));
    }

    res.json(applications);
  } catch (error) {
    console.error('getMyApplications error:', error);
    res.status(500).json({ message: error.message });
  }
};

const getAllApplications = async (req, res) => {
  try {
    const applications = await Application.find({});
    res.json(applications);
  } catch (error) {
    console.error('getAllApplications error:', error);
    res.status(500).json({ message: error.message });
  }
};

const updateApplicationStatus = async (req, res) => {
  const { status, remarks } = req.body;

  const validStatuses = ['Pending', 'Under Review', 'Approved', 'Rejected'];
  if (status && !validStatuses.includes(status)) {
    return res.status(400).json({ message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
  }

  try {
    let updated;

    if (mongoose.connection.readyState === 1) {
      const app = await mongoose.model('Application').findById(req.params.id);
      if (!app) return res.status(404).json({ message: 'Application not found' });
      if (status) app.status = status;
      if (remarks !== undefined) app.remarks = remarks;
      updated = await app.save();
    } else {
      const JsonDb = require('../models/jsonDb');
      const jsonDb = new JsonDb('applications');
      const items = jsonDb.read();
      const idx = items.findIndex(i => String(i._id) === String(req.params.id));
      if (idx === -1) return res.status(404).json({ message: 'Application not found' });
      if (status) items[idx].status = status;
      if (remarks !== undefined) items[idx].remarks = remarks;
      jsonDb.write(items);
      updated = items[idx];
    }

    res.json({ message: 'Application status updated successfully', application: updated });
  } catch (error) {
    console.error('updateApplicationStatus error:', error);
    res.status(500).json({ message: error.message });
  }
};

const deleteApplication = async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const app = await mongoose.model('Application').findById(req.params.id);
      if (!app) return res.status(404).json({ message: 'Application not found' });
      await app.deleteOne();
    } else {
      const JsonDb = require('../models/jsonDb');
      const jsonDb = new JsonDb('applications');
      const items = jsonDb.read();
      const filtered = items.filter(i => String(i._id) !== String(req.params.id));
      if (filtered.length === items.length) return res.status(404).json({ message: 'Application not found' });
      jsonDb.write(filtered);
    }
    res.json({ message: 'Application deleted successfully' });
  } catch (error) {
    console.error('deleteApplication error:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  applyScheme,
  getMyApplications,
  getAllApplications,
  updateApplicationStatus,
  deleteApplication
};
