require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const flockRoutes = require('./routes/flockRoutes');
const dataRoutes = require('./routes/dataRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

app.use(cors({
  origin(origin, cb) {
    // allow non-browser clients or same-origin requests
    if (!origin) return cb(null, true);
    if (allowedOrigins.length === 0) return cb(null, true);
    return allowedOrigins.includes(origin) ? cb(null, true) : cb(new Error('CORS blocked'));
  },
  credentials: true,
}));
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/poultrysmart', {
  serverSelectionTimeoutMS: 10000,
})
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/flocks', flockRoutes);
app.use('/api/data', dataRoutes);

app.get('/', (req, res) => {
  res.json({ ok: true, service: 'poultrysmart-backend' });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'API is running' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
