const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve Static Uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Connect to MongoDB
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/smart_panchayat';
console.log('Connecting to database at:', MONGO_URI);

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('MongoDB connection established successfully.');
  })
  .catch((err) => {
    console.error('MongoDB connection error details:', err.message);
    console.warn('\n======================================================');
    console.warn('WARNING: Failed to connect to MongoDB.');
    console.warn('Please ensure that your MongoDB Server is running locally on port 27017.');
    console.warn('Or, set a valid MONGO_URI in a .env file.');
    console.warn('======================================================\n');
  });

// Mount Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/schemes', require('./routes/schemeRoutes'));
app.use('/api/announcements', require('./routes/announcementRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes'));
app.use('/api/applications', require('./routes/applicationRoutes'));
app.use('/api/appointments', require('./routes/appointmentRoutes'));

// Status Route
app.get('/api/status', (req, res) => {
  res.json({
    status: 'online',
    message: 'Smart Panchayat API is running smoothly',
    timestamp: new Date()
  });
});

// Serve frontend build static files in production if needed
// (For development, we run the dev servers separately)
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/dist')));
  app.get('*', (req, res) =>
    res.sendFile(path.resolve(__dirname, '..', 'frontend', 'dist', 'index.html'))
  );
} else {
  app.get('/', (req, res) => {
    res.send('Smart Panchayat Welfare Scheme API is running in development mode...');
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}...`);
});
