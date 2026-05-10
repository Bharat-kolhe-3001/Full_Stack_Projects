require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Farm = require('./models/Farm');
const Flock = require('./models/Flock');
const Product = require('./models/Product');
const Order = require('./models/Order');
const Transaction = require('./models/Transaction');
const ProductionLog = require('./models/ProductionLog');
const FeedLog = require('./models/FeedLog');
const HealthLog = require('./models/HealthLog');
const Notification = require('./models/Notification');

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/poultrysmart')
  .then(() => console.log('MongoDB Connected for Seeding'))
  .catch(err => console.error('MongoDB connection error:', err));

const seedDB = async () => {
  try {
    await User.deleteMany({});
    await Farm.deleteMany({});
    await Flock.deleteMany({});
    await Product.deleteMany({});
    await Order.deleteMany({});
    await Transaction.deleteMany({});
    await ProductionLog.deleteMany({});
    await FeedLog.deleteMany({});
    await HealthLog.deleteMany({});
    await Notification.deleteMany({});

    const users = [
      { userId: 'u1', name: 'Admin', email: 'admin@poultry.com', password: 'admin123', phone: '9000000000', role: 'admin', verified: true },
      { userId: 'u2', name: 'Ravi Kumar', email: 'ravi@farm.in', password: 'farmer123', phone: '9876543210', role: 'farmer', farmId: 'f1', verified: true },
      { userId: 'u3', name: 'Sunita Devi', email: 'sunita@farm.in', password: 'farmer123', phone: '9876543211', role: 'farmer', farmId: 'f2', verified: true },
      { userId: 'u4', name: 'Mohammed Ali', email: 'ali@farm.in', password: 'farmer123', phone: '9876543212', role: 'farmer', farmId: 'f3', verified: false },
      { userId: 'u5', name: 'Priya Sharma', email: 'priya@gmail.com', password: 'customer123', phone: '9876543220', role: 'customer', verified: true },
      { userId: 'u6', name: 'Amit Patel', email: 'amit@gmail.com', password: 'customer123', phone: '9876543221', role: 'customer', verified: true },
    ];

    const farms = [
      { farmId: 'f1', ownerId: 'u2', name: "Ravi's Green Farm", location: 'Nashik, Maharashtra', state: 'Maharashtra', district: 'Nashik', totalBirds: 5000, activeBatches: 3, status: 'verified', rating: 4.8, established: 2018, certifications: ['Organic Certified', 'FSSAI'] },
      { farmId: 'f2', ownerId: 'u3', name: 'Sunita Poultry Hub', location: 'Amravati, Maharashtra', state: 'Maharashtra', district: 'Amravati', totalBirds: 3200, activeBatches: 2, status: 'verified', rating: 4.6, established: 2020, certifications: ['FSSAI'] },
      { farmId: 'f3', ownerId: 'u4', name: 'Ali Agro Farm', location: 'Aurangabad, Maharashtra', state: 'Maharashtra', district: 'Aurangabad', totalBirds: 8000, activeBatches: 4, status: 'pending', rating: 4.3, established: 2019, certifications: [] },
    ];

    const flocks = [
      { farmId: 'f1', breed: 'BV-300', placementDate: '2025-11-01', initialCount: 2000, currentCount: 1948, shed: 'A', status: 'active', healthStatus: 'healthy', ageWeeks: 26 },
      { farmId: 'f1', breed: 'Lohmann Brown', placementDate: '2025-08-15', initialCount: 1500, currentCount: 1420, shed: 'B', status: 'active', healthStatus: 'monitor', ageWeeks: 38 },
      { farmId: 'f1', breed: 'BV-300', placementDate: '2025-06-01', initialCount: 1800, currentCount: 1580, shed: 'C', status: 'active', healthStatus: 'healthy', ageWeeks: 48 },
      { farmId: 'f2', breed: 'Hy-Line W36', placementDate: '2025-10-01', initialCount: 2000, currentCount: 1960, shed: 'A', status: 'active', healthStatus: 'healthy', ageWeeks: 30 },
      { farmId: 'f3', breed: 'BV-300', placementDate: '2025-09-15', initialCount: 4000, currentCount: 3890, shed: 'A', status: 'active', healthStatus: 'healthy', ageWeeks: 33 },
    ];

    const products = [
      { productId: 'p1', farmId: 'f1', farmerId: 'u2', farmName: "Ravi's Green Farm", type: 'eggs', name: 'Farm Fresh Brown Eggs', description: 'Free-range eggs from happy hens', pricePerUnit: 88, unit: 'dozen', stock: 240, isOrganic: true, isFreshToday: true, rating: 4.9, reviewCount: 847, isActive: true, badge: 'Top Seller', emoji: '🥚' },
      { productId: 'p2', farmId: 'f1', farmerId: 'u2', farmName: "Ravi's Green Farm", type: 'eggs', name: 'White Eggs - Value Pack (30)', description: 'Nutritious white eggs for daily use', pricePerUnit: 195, unit: '30 eggs', stock: 85, isOrganic: false, isFreshToday: true, rating: 4.7, reviewCount: 312, isActive: true, badge: 'Fresh Today', emoji: '🥚' },
      { productId: 'p3', farmId: 'f2', farmerId: 'u3', farmName: 'Sunita Poultry Hub', type: 'chicken', name: 'Country Chicken (Desi)', description: 'Farm-raised desi chicken', pricePerUnit: 340, unit: 'kg', stock: 42, isOrganic: false, isFreshToday: false, rating: 4.8, reviewCount: 523, isActive: true, badge: 'Verified Farm', emoji: '🐔' },
      { productId: 'p4', farmId: 'f2', farmerId: 'u3', farmName: 'Sunita Poultry Hub', type: 'organic', name: 'Organic Eggs - Certified', description: 'Certified organic eggs', pricePerUnit: 145, unit: 'dozen', stock: 60, isOrganic: true, isFreshToday: true, rating: 4.9, reviewCount: 201, isActive: true, badge: 'Organic', emoji: '🌿' },
      { productId: 'p5', farmId: 'f3', farmerId: 'u4', farmName: 'Ali Agro Farm', type: 'eggs', name: 'Jumbo Brown Eggs', description: 'Extra large eggs, perfect for baking', pricePerUnit: 105, unit: 'dozen', stock: 320, isOrganic: false, isFreshToday: true, rating: 4.5, reviewCount: 98, isActive: true, badge: 'New Farm', emoji: '🥚' },
      { productId: 'p6', farmId: 'f1', farmerId: 'u2', farmName: "Ravi's Green Farm", type: 'chicken', name: 'Broiler Chicken - Fresh', description: 'Same-day processed broiler chicken', pricePerUnit: 185, unit: 'kg', stock: 28, isOrganic: false, isFreshToday: true, rating: 4.6, reviewCount: 447, isActive: true, badge: 'Fresh Today', emoji: '🐔' },
    ];

    const orders = [
      { orderId: 'ORD1001', customerId: 'u5', items: [{ productId: 'p1', name: 'Farm Fresh Brown Eggs', qty: 2, price: 88 }], totalAmount: 216, status: 'confirmed', deliveryAddress: '14/A, Shivaji Nagar, Pune', paymentMethod: 'UPI', paymentStatus: 'paid', createdAtClient: new Date() },
      { orderId: 'ORD1002', customerId: 'u5', items: [{ productId: 'p6', name: 'Broiler Chicken - Fresh', qty: 1, price: 185 }], totalAmount: 225, status: 'dispatched', deliveryAddress: '14/A, Shivaji Nagar, Pune', paymentMethod: 'COD', paymentStatus: 'pending', createdAtClient: new Date(Date.now() - 86400000) },
      { orderId: 'ORD1003', customerId: 'u6', items: [{ productId: 'p4', name: 'Organic Eggs - Certified', qty: 3, price: 145 }], totalAmount: 475, status: 'delivered', deliveryAddress: 'Model Colony, Pune', paymentMethod: 'UPI', paymentStatus: 'paid', createdAtClient: new Date(Date.now() - 2 * 86400000) },
    ];

    const transactions = [
      { transactionId: 't1', farmId: 'f1', type: 'income', category: 'Egg Sales', amount: 91400, date: '2026-05-01', notes: 'Monthly sales' },
      { transactionId: 't2', farmId: 'f1', type: 'expense', category: 'Feed', amount: 42000, date: '2026-05-02', notes: 'Feed purchase' },
      { transactionId: 't3', farmId: 'f1', type: 'expense', category: 'Medicine', amount: 4200, date: '2026-05-04', notes: 'Vaccines and medicine' },
      { transactionId: 't4', farmId: 'f1', type: 'expense', category: 'Labor', amount: 16800, date: '2026-05-05', notes: 'Wages' },
      { transactionId: 't5', farmId: 'f2', type: 'income', category: 'Egg Sales', amount: 75400, date: '2026-05-03', notes: 'Monthly sales' },
    ];

    const productionLogs = [];
    for (let d = 0; d < 20; d += 1) {
      const dt = new Date();
      dt.setDate(dt.getDate() - d);
      const date = dt.toISOString().split('T')[0];
      const total = 4200 + (d % 5) * 35;
      const broken = 40 + (d % 4) * 3;
      productionLogs.push({
        logId: `pl_f1_${date}`,
        flockId: 'fl1',
        farmId: 'f1',
        date,
        totalEggs: total,
        brokenEggs: broken,
        netEggs: total - broken,
      });
    }

    const feedLogs = [
      { feedLogId: 'fd1', flockId: 'fl1', farmId: 'f1', date: '2026-05-07', feedType: 'Layer Mash', quantityKg: 240, costPerKg: 22 },
      { feedLogId: 'fd2', flockId: 'fl2', farmId: 'f1', date: '2026-05-07', feedType: 'Pellets', quantityKg: 180, costPerKg: 24 },
      { feedLogId: 'fd3', flockId: 'fl3', farmId: 'f1', date: '2026-05-06', feedType: 'Layer Mash', quantityKg: 210, costPerKg: 22 },
    ];

    const healthLogs = [
      { healthLogId: 'hl1', flockId: 'fl1', farmId: 'f1', date: '2026-05-05', mortality: 2, cause: 'Unknown', vaccinations: [{ name: 'Newcastle Disease', date: '2026-05-05', nextDue: '2026-08-05' }], notes: 'All good' },
      { healthLogId: 'hl2', flockId: 'fl2', farmId: 'f1', date: '2026-05-03', mortality: 6, cause: 'Disease', vaccinations: [], notes: 'Monitor batch B' },
    ];

    const notifications = [
      { notificationId: 'n1', userId: 'u2', title: 'Vaccination Due', message: 'Newcastle Disease vaccine due for Shed A in 3 days', type: 'alert', isRead: false, createdAtClient: new Date(Date.now() - 3600000) },
      { notificationId: 'n2', userId: 'u2', title: 'New Order Received', message: 'Priya Sharma ordered 2 dozen Farm Fresh Brown Eggs', type: 'order', isRead: false, createdAtClient: new Date(Date.now() - 7200000) },
      { notificationId: 'n3', userId: 'u1', title: 'New Farm Registration', message: 'Ali Agro Farm pending verification approval', type: 'info', isRead: false, createdAtClient: new Date(Date.now() - 1800000) },
    ];

    await User.insertMany(users);
    await Farm.insertMany(farms);
    await Flock.insertMany(flocks);
    await Product.insertMany(products);
    await Order.insertMany(orders);
    await Transaction.insertMany(transactions);
    await ProductionLog.insertMany(productionLogs);
    await FeedLog.insertMany(feedLogs);
    await HealthLog.insertMany(healthLogs);
    await Notification.insertMany(notifications);
    console.log('Database seeded successfully with production collections.');
  } catch (error) {
    console.error('Seed error:', error);
  } finally {
    await mongoose.connection.close();
    process.exit();
  }
};

seedDB();
