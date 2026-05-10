const mongoose = require('mongoose');

const feedLogSchema = new mongoose.Schema({
  feedLogId: { type: String, required: true, unique: true },
  flockId: { type: String, required: true },
  farmId: { type: String, required: true },
  date: { type: String, required: true },
  feedType: { type: String, required: true },
  quantityKg: { type: Number, required: true },
  costPerKg: { type: Number, required: true },
}, { timestamps: true });

module.exports = mongoose.model('FeedLog', feedLogSchema);

