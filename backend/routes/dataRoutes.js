const express = require('express');
const router = express.Router();

const User = require('../models/User');
const Farm = require('../models/Farm');
const Flock = require('../models/Flock');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Transaction = require('../models/Transaction');
const ProductionLog = require('../models/ProductionLog');
const FeedLog = require('../models/FeedLog');
const HealthLog = require('../models/HealthLog');
const Notification = require('../models/Notification');

/* ─── helper: auto-increment ID ─── */
async function nextId(Model, idField, prefix) {
  const last = await Model.findOne({}).sort({ createdAt: -1 }).lean();
  const lastNum = last?.[idField]?.startsWith(prefix)
    ? Number(last[idField].slice(prefix.length))
    : 1000;
  return `${prefix}${Number.isFinite(lastNum) ? lastNum + 1 : 1001}`;
}

/* ─── Products ─── */
router.get('/products', async (req, res) => {
  const { farmId, active } = req.query;
  const query = {};
  if (farmId) query.farmId = farmId;
  if (active === 'true') query.isActive = true;
  const products = await Product.find(query).sort({ createdAt: -1 }).lean();
  res.json(products.map(p => ({ ...p, id: p.productId })));
});

/* ─── Orders ─── */
router.get('/orders', async (req, res) => {
  const { customerId } = req.query;
  const query = {};
  if (customerId) query.customerId = customerId;
  const orders = await Order.find(query).sort({ createdAtClient: -1 }).lean();
  res.json(orders.map(o => ({ ...o, id: o.orderId, createdAt: o.createdAtClient })));
});

router.post('/orders', async (req, res) => {
  try {
    const {
      customerId,
      items = [],
      totalAmount,
      deliveryAddress = '',
      paymentMethod = 'COD',
      paymentStatus = 'pending',
      status = 'confirmed',
    } = req.body;

    if (!customerId || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid order payload' });
    }

    const orderId = await nextId(Order, 'orderId', 'ORD');
    const computedTotal = Number.isFinite(totalAmount)
      ? totalAmount
      : items.reduce((sum, item) => sum + (item.price || 0) * (item.qty || 0), 0) + 40;

    const order = await Order.create({
      orderId,
      customerId,
      items,
      totalAmount: computedTotal,
      status,
      deliveryAddress,
      paymentMethod,
      paymentStatus,
      createdAtClient: new Date(),
    });

    return res.status(201).json({
      success: true,
      order: { ...order.toObject(), id: order.orderId, createdAt: order.createdAtClient },
    });
  } catch (error) {
    console.error('Error creating order:', error);
    return res.status(500).json({ success: false, message: 'Failed to create order' });
  }
});

/* ─── Production Logs (Egg Records) ─── */
router.post('/production-logs', async (req, res) => {
  try {
    const { farmId, flockId, date, totalEggs, brokenEggs } = req.body;
    if (!farmId || !flockId || !date || totalEggs == null || brokenEggs == null) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }
    const logId = await nextId(ProductionLog, 'logId', 'PL');
    const log = await ProductionLog.create({
      logId,
      farmId,
      flockId,
      date,
      totalEggs: Number(totalEggs),
      brokenEggs: Number(brokenEggs),
      netEggs: Number(totalEggs) - Number(brokenEggs),
    });
    res.status(201).json({ success: true, log: { ...log.toObject(), id: log.logId } });
  } catch (err) {
    console.error('Error saving production log:', err);
    res.status(500).json({ success: false, message: 'Failed to save production log' });
  }
});

/* ─── Feed Logs ─── */
router.post('/feed-logs', async (req, res) => {
  try {
    const { farmId, flockId, date, feedType, quantityKg, costPerKg } = req.body;
    if (!farmId || !flockId || !date || !feedType || quantityKg == null || costPerKg == null) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }
    const feedLogId = await nextId(FeedLog, 'feedLogId', 'FL');
    const log = await FeedLog.create({
      feedLogId,
      farmId,
      flockId,
      date,
      feedType,
      quantityKg: Number(quantityKg),
      costPerKg: Number(costPerKg),
    });
    res.status(201).json({ success: true, log: { ...log.toObject(), id: log.feedLogId } });
  } catch (err) {
    console.error('Error saving feed log:', err);
    res.status(500).json({ success: false, message: 'Failed to save feed log' });
  }
});

/* ─── Health Logs ─── */
router.post('/health-logs', async (req, res) => {
  try {
    const { farmId, flockId, date, mortality, cause, vaccinations, notes } = req.body;
    if (!farmId || !flockId || !date || mortality == null || !cause) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }
    const healthLogId = await nextId(HealthLog, 'healthLogId', 'HL');
    const log = await HealthLog.create({
      healthLogId,
      farmId,
      flockId,
      date,
      mortality: Number(mortality),
      cause,
      vaccinations: vaccinations || [],
      notes: notes || '',
    });
    res.status(201).json({ success: true, log: { ...log.toObject(), id: log.healthLogId } });
  } catch (err) {
    console.error('Error saving health log:', err);
    res.status(500).json({ success: false, message: 'Failed to save health log' });
  }
});

/* ─── Transactions (Income / Expense) ─── */
router.post('/transactions', async (req, res) => {
  try {
    const { farmId, type, category, amount, date, notes } = req.body;
    if (!farmId || !type || !category || amount == null || !date) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }
    const transactionId = await nextId(Transaction, 'transactionId', 'TX');
    const tx = await Transaction.create({
      transactionId,
      farmId,
      type,
      category,
      amount: Number(amount),
      date,
      notes: notes || '',
    });
    res.status(201).json({ success: true, transaction: { ...tx.toObject(), id: tx.transactionId } });
  } catch (err) {
    console.error('Error saving transaction:', err);
    res.status(500).json({ success: false, message: 'Failed to save transaction' });
  }
});

/* ─── Farmer Dashboard ─── */
router.get('/dashboard/farmer', async (req, res) => {
  const farmId = req.query.farmId || 'f1';
  const [flocks, productionLogs, transactions, feedLogs, healthLogs, products, orders, notifications] = await Promise.all([
    Flock.find({ farmId }).sort({ shed: 1 }).lean(),
    ProductionLog.find({ farmId }).sort({ date: -1 }).lean(),
    Transaction.find({ farmId }).sort({ date: -1 }).lean(),
    FeedLog.find({ farmId }).sort({ date: -1 }).lean(),
    HealthLog.find({ farmId }).sort({ date: -1 }).lean(),
    Product.find({ farmId }).lean(),
    Order.find({}).sort({ createdAtClient: -1 }).lean(),
    Notification.find({}).sort({ createdAtClient: -1 }).lean(),
  ]);

  const productIds = new Set(products.map(p => p.productId));
  const farmOrders = orders.filter(o => o.items.some(i => productIds.has(i.productId)));

  res.json({
    flocks,
    productionLogs: productionLogs.map(l => ({ ...l, id: l.logId })),
    transactions: transactions.map(t => ({ ...t, id: t.transactionId })),
    feedLogs: feedLogs.map(f => ({ ...f, id: f.feedLogId })),
    healthLogs: healthLogs.map(h => ({ ...h, id: h.healthLogId })),
    products: products.map(p => ({ ...p, id: p.productId })),
    orders: farmOrders.map(o => ({ ...o, id: o.orderId, createdAt: o.createdAtClient })),
    notifications: notifications.map(n => ({ ...n, id: n.notificationId, createdAt: n.createdAtClient })),
  });
});

/* ─── Admin Dashboard ─── */
router.get('/dashboard/admin', async (req, res) => {
  const [farms, users, orders, productionLogs, transactions, notifications, healthLogs] = await Promise.all([
    Farm.find({}).sort({ createdAt: -1 }).lean(),
    User.find({}).sort({ createdAt: -1 }).lean(),
    Order.find({}).sort({ createdAtClient: -1 }).lean(),
    ProductionLog.find({}).sort({ date: -1 }).lean(),
    Transaction.find({}).sort({ date: -1 }).lean(),
    Notification.find({}).sort({ createdAtClient: -1 }).lean(),
    HealthLog.find({}).sort({ date: -1 }).lean(),
  ]);

  res.json({
    farms: farms.map(f => ({ ...f, id: f.farmId })),
    users: users.map(u => ({ ...u, id: String(u._id) })),
    orders: orders.map(o => ({ ...o, id: o.orderId, createdAt: o.createdAtClient })),
    productionLogs: productionLogs.map(p => ({ ...p, id: p.logId })),
    transactions: transactions.map(t => ({ ...t, id: t.transactionId })),
    notifications: notifications.map(n => ({ ...n, id: n.notificationId, createdAt: n.createdAtClient })),
    healthLogs: healthLogs.map(h => ({ ...h, id: h.healthLogId })),
  });
});

module.exports = router;
