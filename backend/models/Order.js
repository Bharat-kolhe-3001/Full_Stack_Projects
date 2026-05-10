const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  productId: { type: String, required: true },
  name: { type: String, required: true },
  qty: { type: Number, required: true },
  price: { type: Number, required: true },
}, { _id: false });

const orderSchema = new mongoose.Schema({
  orderId: { type: String, required: true, unique: true },
  customerId: { type: String, required: true },
  items: { type: [orderItemSchema], default: [] },
  totalAmount: { type: Number, required: true },
  status: { type: String, default: 'pending' },
  deliveryAddress: { type: String, default: '' },
  paymentMethod: { type: String, default: 'COD' },
  paymentStatus: { type: String, default: 'pending' },
  createdAtClient: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);

