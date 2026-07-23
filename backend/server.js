const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

const allowedOrigins = [
  'http://localhost:5173',   
  'http://localhost:4173',   
  'http://localhost:3000',
  process.env.FRONTEND_URL  
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    
    if (process.env.NODE_ENV !== 'production') return callback(null, true);
    callback(new Error('CORS: Origin not allowed'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/smart_panchayat';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message);
    console.warn('\n======================================================');
    console.warn('WARNING: MongoDB not reachable. Running in JSON fallback mode.');
    console.warn('Set a valid MONGO_URI in your .env file to use MongoDB Atlas.');
    console.warn('======================================================\n');
  }
};

connectDB();

mongoose.connection.on('disconnected', () => {
  console.warn('⚠️  MongoDB disconnected. Reconnecting...');
  setTimeout(connectDB, 5000);
});

app.use('/api/auth',          require('./routes/authRoutes'));
app.use('/api/schemes',       require('./routes/schemeRoutes'));
app.use('/api/announcements', require('./routes/announcementRoutes'));
app.use('/api/upload',        require('./routes/uploadRoutes'));
app.use('/api/applications',  require('./routes/applicationRoutes'));
app.use('/api/appointments',  require('./routes/appointmentRoutes'));

app.get('/api/status', (req, res) => {
  res.json({
    status: 'online',
    message: 'Smart Panchayat Welfare Scheme API is running',
    database: mongoose.connection.readyState === 1 ? 'MongoDB (connected)' : 'JSON fallback (MongoDB offline)',
    timestamp: new Date().toISOString(),
    version: '2.0.0'
  });
});

if (process.env.NODE_ENV === 'production') {
  const frontendDist = path.join(__dirname, '../frontend/dist');
  app.use(express.static(frontendDist));
  app.get('*', (req, res) => {
    
    if (req.path.startsWith('/api')) {
      return res.status(404).json({ message: 'API route not found' });
    }
    res.sendFile(path.resolve(frontendDist, 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.json({
      message: 'Smart Panchayat Welfare Scheme API — Development Mode',
      docs: 'Visit /api/status for health check'
    });
  });
  
  app.use('/api/*', (req, res) => {
    res.status(404).json({ message: `Route ${req.originalUrl} not found` });
  });
}

app.use((err, req, res, next) => {
  console.error('Global error handler:', err.stack);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

const PORT = parseInt(process.env.PORT) || 5000;
app.listen(PORT, () => {
  console.log(`\n🚀 Server running on http://localhost:${PORT}`);
  console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔑 JWT Secret: ${process.env.JWT_SECRET ? 'Set ✅' : 'Using default ⚠️  (set JWT_SECRET in .env!)'}`);
});
