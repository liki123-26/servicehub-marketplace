const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const dotenv = require('dotenv');
const { initDb } = require('./config/db');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security & Parsing Middleware
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/merchants', require('./routes/merchants'));
app.use('/api/services', require('./routes/services'));
app.use('/api/cart', require('./routes/cart'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/addresses', require('./routes/addresses'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/otp', require('./routes/otp'));
app.use('/api/admin', require('./routes/admin'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'ServiceHub API',
    timestamp: new Date().toISOString()
  });
});

// 404 Handler for API routes
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'API Endpoint not found.' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error.'
  });
});

// Start Server & Initialize Database
initDb()
  .then(() => {
    const server = app.listen(PORT, () => {
      console.log(`===================================================`);
      console.log(` ServiceHub Backend Running on http://localhost:${PORT}`);
      console.log(` Database: SQLite (database.db) initialized`);
      console.log(`===================================================`);
    });
    // Keep event loop active
    process.stdin.resume();
    setInterval(() => {}, 3600000);
  })
  .catch((err) => {
    console.error('Database initialization failed:', err);
  });

