const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['citizen', 'admin'],
    default: 'citizen'
  },
  // Profile eligibility screening fields
  age: {
    type: Number,
    default: null
  },
  annualIncome: {
    type: Number,
    default: null
  },
  occupation: {
    type: String,
    default: ''
  },
  category: {
    type: String,
    enum: ['', 'General', 'OBC', 'SC', 'ST'],
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const MongooseUser = mongoose.model('User', UserSchema);
const JsonDb = require('./jsonDb');
const jsonUserDb = new JsonDb('users');

class UserWrapper {
  constructor(data) {
    if (UserWrapper.isMongoConnected()) {
      return new MongooseUser(data);
    }
    Object.assign(this, data);
    this.save = async function() {
      const created = await jsonUserDb.create(data);
      Object.assign(this, created);
      return this;
    };
  }

  static isMongoConnected() {
    return mongoose.connection.readyState === 1;
  }

  static find(query) {
    return UserWrapper.isMongoConnected() ? MongooseUser.find(query) : jsonUserDb.find(query);
  }

  static findOne(query) {
    return UserWrapper.isMongoConnected() ? MongooseUser.findOne(query) : jsonUserDb.findOne(query);
  }

  static findById(id) {
    return UserWrapper.isMongoConnected() ? MongooseUser.findById(id) : jsonUserDb.findById(id);
  }

  static create(doc) {
    return UserWrapper.isMongoConnected() ? MongooseUser.create(doc) : jsonUserDb.create(doc);
  }

  static countDocuments(query) {
    return UserWrapper.isMongoConnected() ? MongooseUser.countDocuments(query) : jsonUserDb.countDocuments(query);
  }

  static deleteMany(query) {
    return UserWrapper.isMongoConnected() ? MongooseUser.deleteMany(query) : jsonUserDb.deleteMany(query);
  }
}

module.exports = UserWrapper;

