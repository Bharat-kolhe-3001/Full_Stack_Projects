const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  productId: { type: String, required: true, unique: true },
  farmId: { type: String, required: true },
  farmerId: { type: String, required: true },
  farmName: { type: String, required: true },
  type: { type: String, required: true },
  name: { type: String, required: true },
  description: { type: String, default: '' },
  pricePerUnit: { type: Number, required: true },
  unit: { type: String, required: true },
  stock: { type: Number, default: 0 },
  isOrganic: { type: Boolean, default: false },
  isFreshToday: { type: Boolean, default: false },
  rating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  badge: { type: String, default: '' },
  emoji: { type: String, default: '📦' },
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);

