const mongoose = require('mongoose');

const AnnouncementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  isImportant: {
    type: Boolean,
    default: false
  },
  date: {
    type: Date,
    default: Date.now
  }
});

const MongooseAnnouncement = mongoose.model('Announcement', AnnouncementSchema);
const JsonDb = require('./jsonDb');
const jsonAnnouncementDb = new JsonDb('announcements');

class AnnouncementWrapper {
  constructor(data) {
    if (AnnouncementWrapper.isMongoConnected()) {
      return new MongooseAnnouncement(data);
    }
    Object.assign(this, data);
    this.save = async function() {
      if (this._id) {
        const items = jsonAnnouncementDb.read();
        const index = items.findIndex(i => String(i._id) === String(this._id));
        if (index !== -1) {
          items[index] = { ...items[index], ...this };
          delete items[index].save;
          delete items[index].deleteOne;
          jsonAnnouncementDb.write(items);
          return this;
        }
      }
      const created = await jsonAnnouncementDb.create(data);
      Object.assign(this, created);
      return this;
    };
  }

  static isMongoConnected() {
    return mongoose.connection.readyState === 1;
  }

  static find(query) {
    return AnnouncementWrapper.isMongoConnected() ? MongooseAnnouncement.find(query) : jsonAnnouncementDb.find(query);
  }

  static findOne(query) {
    return AnnouncementWrapper.isMongoConnected() ? MongooseAnnouncement.findOne(query) : jsonAnnouncementDb.findOne(query);
  }

  static findById(id) {
    return AnnouncementWrapper.isMongoConnected() ? MongooseAnnouncement.findById(id) : jsonAnnouncementDb.findById(id);
  }

  static create(doc) {
    return AnnouncementWrapper.isMongoConnected() ? MongooseAnnouncement.create(doc) : jsonAnnouncementDb.create(doc);
  }

  static insertMany(docs) {
    return AnnouncementWrapper.isMongoConnected() ? MongooseAnnouncement.insertMany(docs) : jsonAnnouncementDb.insertMany(docs);
  }

  static deleteMany(query) {
    return AnnouncementWrapper.isMongoConnected() ? MongooseAnnouncement.deleteMany(query) : jsonAnnouncementDb.deleteMany(query);
  }
}

module.exports = AnnouncementWrapper;

