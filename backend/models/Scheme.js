const mongoose = require('mongoose');

const SchemeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Agriculture', 'Animal Husbandry', 'Housing', 'Education', 'Social Welfare', 'Health', 'Employment'],
    trim: true
  },
  eligibilityCriteria: {
    minAge: {
      type: Number,
      default: 0
    },
    maxAge: {
      type: Number,
      default: 150
    },
    maxIncome: {
      type: Number,
      default: null // null means no upper limit
    },
    allowedOccupations: {
      type: [String],
      default: [] // Empty array means all occupations allowed
    },
    allowedCategories: {
      type: [String],
      default: [] // Empty array means all categories allowed (General, OBC, SC, ST)
    }
  },
  requiredDocuments: {
    type: [String],
    default: []
  },
  formUrl: {
    type: String,
    default: '' // Path to the uploaded application form PDF/DOC
  },
  viewsCount: {
    type: Number,
    default: 0
  },
  downloadsCount: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Scheme', SchemeSchema);
