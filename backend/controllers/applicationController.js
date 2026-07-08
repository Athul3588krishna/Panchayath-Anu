const Application = require('../models/Application');
const Scheme = require('../models/Scheme');

// @desc    Submit application online for a scheme
// @route   POST /api/applications
// @access  Private
const applyScheme = async (req, res) => {
  const { schemeId } = req.body;
  const userId = req.user._id;

  try {
    // Check if scheme exists
    const scheme = await Scheme.findById(schemeId);
    if (!scheme) {
      return res.status(404).json({ message: 'Welfare scheme not found' });
    }

    // Check if already applied
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
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get logged in user's submitted applications
// @route   GET /api/applications/my
// @access  Private
const getMyApplications = async (req, res) => {
  try {
    const applications = await Application.find({ user: req.user._id });
    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all applications (Admin only)
// @route   GET /api/applications
// @access  Private/Admin
const getAllApplications = async (req, res) => {
  try {
    const applications = await Application.find({});
    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update application status & remarks (Admin only)
// @route   PUT /api/applications/:id
// @access  Private/Admin
const updateApplicationStatus = async (req, res) => {
  const { status, remarks } = req.body;

  try {
    const application = await Application.findById(req.params.id);

    if (application) {
      application.status = status || application.status;
      application.remarks = remarks !== undefined ? remarks : application.remarks;

      const updated = await application.save();
      res.json(updated);
    } else {
      res.status(404).json({ message: 'Application not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  applyScheme,
  getMyApplications,
  getAllApplications,
  updateApplicationStatus
};
