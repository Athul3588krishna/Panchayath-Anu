const Announcement = require('../models/Announcement');

// @desc    Get all announcements
// @route   GET /api/announcements
// @access  Public
const getAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find({}).sort({ date: -1 });
    res.json(announcements);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new announcement (Admin only)
// @route   POST /api/announcements
// @access  Private/Admin
const createAnnouncement = async (req, res) => {
  const { title, content, isImportant } = req.body;

  try {
    const announcement = new Announcement({
      title,
      content,
      isImportant: isImportant || false
    });

    const createdAnnouncement = await announcement.save();
    res.status(201).json(createdAnnouncement);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update an announcement (Admin only)
// @route   PUT /api/announcements/:id
// @access  Private/Admin
const updateAnnouncement = async (req, res) => {
  const { title, content, isImportant } = req.body;

  try {
    const announcement = await Announcement.findById(req.params.id);

    if (announcement) {
      announcement.title = title || announcement.title;
      announcement.content = content || announcement.content;
      announcement.isImportant = isImportant !== undefined ? isImportant : announcement.isImportant;

      const updatedAnnouncement = await announcement.save();
      res.json(updatedAnnouncement);
    } else {
      res.status(404).json({ message: 'Announcement not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete an announcement (Admin only)
// @route   DELETE /api/announcements/:id
// @access  Private/Admin
const deleteAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);

    if (announcement) {
      await announcement.deleteOne();
      res.json({ message: 'Announcement deleted successfully' });
    } else {
      res.status(404).json({ message: 'Announcement not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement
};
