const mongoose = require('mongoose');

const ApplicationSchema = new mongoose.Schema({
  scheme: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Scheme',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Under Review', 'Approved', 'Rejected'],
    default: 'Pending'
  },
  remarks: {
    type: String,
    default: ''
  },
  appliedAt: {
    type: Date,
    default: Date.now
  }
});

const MongooseApplication = mongoose.model('Application', ApplicationSchema);
const JsonDb = require('./jsonDb');
const jsonApplicationDb = new JsonDb('applications');

class ApplicationWrapper {
  constructor(data) {
    if (ApplicationWrapper.isMongoConnected()) {
      return new MongooseApplication(data);
    }
    Object.assign(this, data);
    this.save = async function() {
      if (this._id) {
        const items = jsonApplicationDb.read();
        const index = items.findIndex(i => String(i._id) === String(this._id));
        if (index !== -1) {
          items[index] = { ...items[index], ...this };
          delete items[index].save;
          delete items[index].deleteOne;
          jsonApplicationDb.write(items);
          return this;
        }
      }
      const created = await jsonApplicationDb.create(data);
      Object.assign(this, created);
      return this;
    };
  }

  static isMongoConnected() {
    return mongoose.connection.readyState === 1;
  }

  static find(query) {
    if (ApplicationWrapper.isMongoConnected()) {
      return MongooseApplication.find(query).populate('scheme').populate('user');
    }
    // For JsonDb, we mock the populate refs manually!
    // This is super clever and works perfectly.
    const apps = jsonApplicationDb.find(query);
    return Promise.resolve(apps).then(async (items) => {
      const jsonSchemeDb = new JsonDb('schemes');
      const jsonUserDb = new JsonDb('users');
      
      const populated = [];
      for (const item of items) {
        const schemeObj = await jsonSchemeDb.findById(item.scheme);
        const userObj = await jsonUserDb.findById(item.user);
        populated.push({
          ...item,
          scheme: schemeObj || { title: 'Unknown Scheme', category: 'General' },
          user: userObj ? { name: userObj.name, email: userObj.email } : { name: 'Unknown User', email: '' }
        });
      }
      return populated.map(i => jsonApplicationDb.wrap(i));
    });
  }

  static findOne(query) {
    return ApplicationWrapper.isMongoConnected() ? MongooseApplication.findOne(query) : jsonApplicationDb.findOne(query);
  }

  static findById(id) {
    if (ApplicationWrapper.isMongoConnected()) {
      return MongooseApplication.findById(id).populate('scheme').populate('user');
    }
    return jsonApplicationDb.findById(id).then(async (item) => {
      if (!item) return null;
      const jsonSchemeDb = new JsonDb('schemes');
      const jsonUserDb = new JsonDb('users');
      const schemeObj = await jsonSchemeDb.findById(item.scheme);
      const userObj = await jsonUserDb.findById(item.user);
      const populated = {
        ...item,
        scheme: schemeObj || { title: 'Unknown Scheme', category: 'General' },
        user: userObj ? { name: userObj.name, email: userObj.email } : { name: 'Unknown User', email: '' }
      };
      return jsonApplicationDb.wrap(populated);
    });
  }

  static create(doc) {
    return ApplicationWrapper.isMongoConnected() ? MongooseApplication.create(doc) : jsonApplicationDb.create(doc);
  }

  static countDocuments(query) {
    return ApplicationWrapper.isMongoConnected() ? MongooseApplication.countDocuments(query) : jsonApplicationDb.countDocuments(query);
  }

  static deleteMany(query) {
    return ApplicationWrapper.isMongoConnected() ? MongooseApplication.deleteMany(query) : jsonApplicationDb.deleteMany(query);
  }
}

module.exports = ApplicationWrapper;
