const mongoose = require('mongoose');

const flockSchema = new mongoose.Schema({
  farmId: { type: String, required: true },
  breed: { type: String, required: true },
  placementDate: { type: Date, required: true },
  initialCount: { type: Number, required: true },
  currentCount: { type: Number, required: true },
  shed: { type: String, required: true },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  healthStatus: { type: String, enum: ['healthy', 'monitor', 'sick'], default: 'healthy' },
  ageWeeks: { type: Number, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Flock', flockSchema);
