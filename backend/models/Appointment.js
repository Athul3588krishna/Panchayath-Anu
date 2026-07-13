const mongoose = require('mongoose');
const JsonDb = require('./jsonDb');

const AppointmentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  timeSlot: {
    type: String,
    required: true,
    enum: ['10:00 AM', '11:00 AM', '12:00 PM', '02:00 PM', '03:00 PM', '04:00 PM']
  },
  purpose: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Cancelled'],
    default: 'Pending'
  },
  adminNote: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const MongooseAppointment = mongoose.model('Appointment', AppointmentSchema);
const jsonAppointmentDb = new JsonDb('appointments');

class AppointmentWrapper {
  constructor(data) {
    if (AppointmentWrapper.isMongoConnected()) {
      return new MongooseAppointment(data);
    }
    Object.assign(this, data);
    this.save = async function () {
      if (this._id) {
        const items = jsonAppointmentDb.read();
        const index = items.findIndex(i => String(i._id) === String(this._id));
        if (index !== -1) {
          items[index] = { ...items[index], ...this };
          delete items[index].save;
          delete items[index].deleteOne;
          jsonAppointmentDb.write(items);
          return this;
        }
      }
      const created = await jsonAppointmentDb.create(data);
      Object.assign(this, created);
      return this;
    };
  }

  static isMongoConnected() {
    return mongoose.connection.readyState === 1;
  }

  static find(query) {
    if (AppointmentWrapper.isMongoConnected()) {
      return MongooseAppointment.find(query).populate('user', 'name email phone').sort({ date: 1 });
    }
    const items = jsonAppointmentDb.find(query);
    return Promise.resolve(items).then(async (list) => {
      const jsonUserDb = new JsonDb('users');
      const populated = [];
      for (const item of list) {
        const userObj = await jsonUserDb.findById(item.user);
        populated.push({
          ...item,
          user: userObj
            ? { name: userObj.name, email: userObj.email, phone: userObj.phone || '' }
            : { name: 'Unknown', email: '' }
        });
      }
      return populated.sort((a, b) => new Date(a.date) - new Date(b.date));
    });
  }

  static findOne(query) {
    return AppointmentWrapper.isMongoConnected()
      ? MongooseAppointment.findOne(query)
      : jsonAppointmentDb.findOne(query);
  }

  static findById(id) {
    return AppointmentWrapper.isMongoConnected()
      ? MongooseAppointment.findById(id)
      : jsonAppointmentDb.findById(id);
  }

  static create(doc) {
    return AppointmentWrapper.isMongoConnected()
      ? MongooseAppointment.create(doc)
      : jsonAppointmentDb.create(doc);
  }

  static deleteMany(query) {
    return AppointmentWrapper.isMongoConnected()
      ? MongooseAppointment.deleteMany(query)
      : jsonAppointmentDb.deleteMany(query);
  }
}

module.exports = AppointmentWrapper;
