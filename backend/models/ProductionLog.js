const mongoose = require('mongoose');

const productionLogSchema = new mongoose.Schema({
  logId: { type: String, required: true, unique: true },
  flockId: { type: String, required: true },
  farmId: { type: String, required: true },
  date: { type: String, required: true },
  totalEggs: { type: Number, required: true },
  brokenEggs: { type: Number, required: true },
  netEggs: { type: Number, required: true },
}, { timestamps: true });

module.exports = mongoose.model('ProductionLog', productionLogSchema);

