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

const MongooseScheme = mongoose.model('Scheme', SchemeSchema);
const JsonDb = require('./jsonDb');
const jsonSchemeDb = new JsonDb('schemes');

class SchemeWrapper {
  constructor(data) {
    if (SchemeWrapper.isMongoConnected()) {
      return new MongooseScheme(data);
    }
    Object.assign(this, data);
    this.save = async function() {
      // If updating, save to existing file database
      if (this._id) {
        const items = jsonSchemeDb.read();
        const index = items.findIndex(i => String(i._id) === String(this._id));
        if (index !== -1) {
          items[index] = { ...items[index], ...this };
          delete items[index].save;
          delete items[index].deleteOne;
          jsonSchemeDb.write(items);
          return this;
        }
      }
      const created = await jsonSchemeDb.create(data);
      Object.assign(this, created);
      return this;
    };
  }

  static isMongoConnected() {
    return mongoose.connection.readyState === 1;
  }

  static find(query) {
    return SchemeWrapper.isMongoConnected() ? MongooseScheme.find(query) : jsonSchemeDb.find(query);
  }

  static findOne(query) {
    return SchemeWrapper.isMongoConnected() ? MongooseScheme.findOne(query) : jsonSchemeDb.findOne(query);
  }

  static findById(id) {
    return SchemeWrapper.isMongoConnected() ? MongooseScheme.findById(id) : jsonSchemeDb.findById(id);
  }

  static create(doc) {
    return SchemeWrapper.isMongoConnected() ? MongooseScheme.create(doc) : jsonSchemeDb.create(doc);
  }

  static insertMany(docs) {
    return SchemeWrapper.isMongoConnected() ? MongooseScheme.insertMany(docs) : jsonSchemeDb.insertMany(docs);
  }

  static deleteMany(query) {
    return SchemeWrapper.isMongoConnected() ? MongooseScheme.deleteMany(query) : jsonSchemeDb.deleteMany(query);
  }
}

module.exports = SchemeWrapper;

