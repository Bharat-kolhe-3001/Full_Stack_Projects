const mongoose = require('mongoose');

const farmSchema = new mongoose.Schema({
  farmId: { type: String, required: true, unique: true },
  ownerId: { type: String, required: true },
  name: { type: String, required: true },
  location: { type: String, required: true },
  state: { type: String, default: '' },
  district: { type: String, default: '' },
  totalBirds: { type: Number, default: 0 },
  activeBatches: { type: Number, default: 0 },
  status: { type: String, enum: ['verified', 'pending', 'inactive'], default: 'pending' },
  rating: { type: Number, default: 0 },
  established: { type: Number, default: null },
  certifications: { type: [String], default: [] },
}, { timestamps: true });

module.exports = mongoose.model('Farm', farmSchema);

