const mongoose = require('mongoose');

const vaccineSchema = new mongoose.Schema({
  name: { type: String, required: true },
  date: { type: String, required: true },
  nextDue: { type: String, default: '' },
}, { _id: false });

const healthLogSchema = new mongoose.Schema({
  healthLogId: { type: String, required: true, unique: true },
  flockId: { type: String, required: true },
  farmId: { type: String, required: true },
  date: { type: String, required: true },
  mortality: { type: Number, required: true },
  cause: { type: String, required: true },
  vaccinations: { type: [vaccineSchema], default: [] },
  notes: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('HealthLog', healthLogSchema);

