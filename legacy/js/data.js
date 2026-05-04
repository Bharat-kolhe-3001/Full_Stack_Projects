// PoultrySmart — Mock Data Layer
// Replace fetch() calls with real API endpoints for production

const PS = window.PS = {};

// ── SEED DATA ─────────────────────────────────────────────────────────────────

PS.users = [
  { id: 'u1', name: 'Admin', email: 'admin@poultrysmart.in', phone: '9000000000', role: 'admin', avatar: null, verified: true },
  { id: 'u2', name: 'Ravi Kumar', email: 'ravi@farm.in', phone: '9876543210', role: 'farmer', avatar: null, verified: true, farmId: 'f1' },
  { id: 'u3', name: 'Sunita Devi', email: 'sunita@farm.in', phone: '9876543211', role: 'farmer', avatar: null, verified: true, farmId: 'f2' },
  { id: 'u4', name: 'Mohammed Ali', email: 'ali@farm.in', phone: '9876543212', role: 'farmer', avatar: null, verified: false, farmId: 'f3' },
  { id: 'u5', name: 'Priya Sharma', email: 'priya@gmail.com', phone: '9876543220', role: 'customer', avatar: null, verified: true },
  { id: 'u6', name: 'Amit Patel', email: 'amit@gmail.com', phone: '9876543221', role: 'customer', avatar: null, verified: true },
];

PS.farms = [
  { id: 'f1', ownerId: 'u2', name: "Ravi's Green Farm", location: 'Nashik, Maharashtra', state: 'Maharashtra', district: 'Nashik', totalBirds: 5000, activeBatches: 3, status: 'verified', rating: 4.8, established: 2018, certifications: ['Organic Certified', 'FSSAI'], images: [] },
  { id: 'f2', ownerId: 'u3', name: "Sunita Poultry Hub", location: 'Amravati, Maharashtra', state: 'Maharashtra', district: 'Amravati', totalBirds: 3200, activeBatches: 2, status: 'verified', rating: 4.6, established: 2020, certifications: ['FSSAI'], images: [] },
  { id: 'f3', ownerId: 'u4', name: "Ali Agro Farm", location: 'Aurangabad, Maharashtra', state: 'Maharashtra', district: 'Aurangabad', totalBirds: 8000, activeBatches: 4, status: 'pending', rating: 4.3, established: 2019, certifications: [], images: [] },
];

PS.flocks = [
  { id: 'fl1', farmId: 'f1', breed: 'BV-300', placementDate: '2025-11-01', initialCount: 2000, currentCount: 1948, shed: 'A', status: 'active', healthStatus: 'healthy', ageWeeks: 26 },
  { id: 'fl2', farmId: 'f1', breed: 'Lohmann Brown', placementDate: '2025-08-15', initialCount: 1500, currentCount: 1420, shed: 'B', status: 'active', healthStatus: 'monitor', ageWeeks: 38 },
  { id: 'fl3', farmId: 'f1', breed: 'BV-300', placementDate: '2025-06-01', initialCount: 1800, currentCount: 1580, shed: 'C', status: 'active', healthStatus: 'healthy', ageWeeks: 48 },
  { id: 'fl4', farmId: 'f2', breed: 'Hy-Line W36', placementDate: '2025-10-01', initialCount: 2000, currentCount: 1960, shed: 'A', status: 'active', healthStatus: 'healthy', ageWeeks: 30 },
  { id: 'fl5', farmId: 'f3', breed: 'BV-300', placementDate: '2025-09-15', initialCount: 4000, currentCount: 3890, shed: 'A', status: 'active', healthStatus: 'healthy', ageWeeks: 33 },
];

// Generate 90 days of production logs
PS.productionLogs = (function() {
  const logs = [];
  const flocks = [
    { id: 'fl1', base: 1700, variance: 80 },
    { id: 'fl2', base: 1200, variance: 60 },
    { id: 'fl3', base: 1400, variance: 70 },
  ];
  for (let d = 89; d >= 0; d--) {
    const date = new Date();
    date.setDate(date.getDate() - d);
    const dateStr = date.toISOString().split('T')[0];
    flocks.forEach(f => {
      const total = Math.round(f.base + (Math.random() - 0.5) * f.variance * 2);
      const broken = Math.round(total * 0.015);
      logs.push({ id: `pl_${f.id}_${dateStr}`, flockId: f.id, farmId: 'f1', date: dateStr, totalEggs: total, brokenEggs: broken, netEggs: total - broken });
    });
  }
  return logs;
})();

PS.healthLogs = [
  { id: 'hl1', flockId: 'fl1', farmId: 'f1', date: '2025-11-05', mortality: 2, cause: 'Unknown', vaccinations: [{ name: 'Newcastle Disease', date: '2025-11-10', nextDue: '2026-02-10' }], notes: 'All good' },
  { id: 'hl2', flockId: 'fl2', farmId: 'f1', date: '2026-01-10', mortality: 8, cause: 'Disease', vaccinations: [], notes: 'Monitor batch B closely' },
  { id: 'hl3', flockId: 'fl3', farmId: 'f1', date: '2026-02-14', mortality: 3, cause: 'Predator', vaccinations: [{ name: 'Marek\'s Disease', date: '2026-02-14', nextDue: '2027-02-14' }], notes: '' },
];

PS.feedLogs = [
  { id: 'fd1', flockId: 'fl1', farmId: 'f1', date: '2026-04-28', feedType: 'Layer Mash', quantityKg: 240, costPerKg: 22 },
  { id: 'fd2', flockId: 'fl2', farmId: 'f1', date: '2026-04-28', feedType: 'Pellets', quantityKg: 180, costPerKg: 24 },
  { id: 'fd3', flockId: 'fl3', farmId: 'f1', date: '2026-04-28', feedType: 'Layer Mash', quantityKg: 210, costPerKg: 22 },
];

PS.transactions = (function() {
  const txns = [];
  for (let m = 11; m >= 0; m--) {
    const date = new Date();
    date.setMonth(date.getMonth() - m);
    const mo = date.toISOString().substr(0, 7);
    txns.push({ id: `t_inc_${m}`, farmId: 'f1', type: 'income', category: 'Egg Sales', amount: 85000 + Math.round(Math.random() * 25000), date: mo + '-15', description: 'Monthly egg sale batch' });
    txns.push({ id: `t_exp_${m}`, farmId: 'f1', type: 'expense', category: 'Feed', amount: 45000 + Math.round(Math.random() * 10000), date: mo + '-10', description: 'Feed purchase' });
    txns.push({ id: `t_exp2_${m}`, farmId: 'f1', type: 'expense', category: 'Medicine', amount: 3000 + Math.round(Math.random() * 2000), date: mo + '-05', description: 'Vaccination & medicine' });
    txns.push({ id: `t_exp3_${m}`, farmId: 'f1', type: 'expense', category: 'Labor', amount: 15000 + Math.round(Math.random() * 3000), date: mo + '-01', description: 'Labor wages' });
  }
  return txns;
})();

PS.products = [
  { id: 'p1', farmId: 'f1', farmerId: 'u2', farmName: "Ravi's Green Farm", type: 'eggs', name: 'Farm Fresh Brown Eggs', description: 'Free-range eggs from happy hens, rich in omega-3', pricePerUnit: 88, unit: 'dozen', stock: 240, isOrganic: true, isFreshToday: true, rating: 4.9, reviewCount: 847, isActive: true, badge: 'Top Seller', emoji: '🥚' },
  { id: 'p2', farmId: 'f1', farmerId: 'u2', farmName: "Ravi's Green Farm", type: 'eggs', name: 'White Eggs — Value Pack (30)', description: 'Nutritious white eggs, ideal for daily consumption', pricePerUnit: 195, unit: '30 eggs', stock: 85, isOrganic: false, isFreshToday: true, rating: 4.7, reviewCount: 312, isActive: true, badge: 'Fresh Today', emoji: '🥚' },
  { id: 'p3', farmId: 'f2', farmerId: 'u3', farmName: "Sunita Poultry Hub", type: 'chicken', name: 'Country Chicken (Desi)', description: 'Farm-raised desi chicken, hormone-free, flavorful', pricePerUnit: 340, unit: 'kg', stock: 42, isOrganic: false, isFreshToday: false, rating: 4.8, reviewCount: 523, isActive: true, badge: 'Verified Farm', emoji: '🐔' },
  { id: 'p4', farmId: 'f2', farmerId: 'u3', farmName: "Sunita Poultry Hub", type: 'organic', name: 'Organic Eggs — Certified', description: 'NPOP certified organic eggs, no antibiotics ever', pricePerUnit: 145, unit: 'dozen', stock: 60, isOrganic: true, isFreshToday: true, rating: 4.9, reviewCount: 201, isActive: true, badge: 'Organic', emoji: '🌿' },
  { id: 'p5', farmId: 'f3', farmerId: 'u4', farmName: "Ali Agro Farm", type: 'eggs', name: 'Jumbo Brown Eggs', description: 'Extra-large eggs from mature hens, perfect for baking', pricePerUnit: 105, unit: 'dozen', stock: 320, isOrganic: false, isFreshToday: true, rating: 4.5, reviewCount: 98, isActive: true, badge: 'New Farm', emoji: '🥚' },
  { id: 'p6', farmId: 'f1', farmerId: 'u2', farmName: "Ravi's Green Farm", type: 'chicken', name: 'Broiler Chicken — Fresh', description: 'Same-day processed broiler chicken, packed fresh', pricePerUnit: 185, unit: 'kg', stock: 28, isOrganic: false, isFreshToday: true, rating: 4.6, reviewCount: 447, isActive: true, badge: 'Fresh Today', emoji: '🐔' },
];

PS.orders = (function() {
  const statuses = ['pending', 'confirmed', 'dispatched', 'delivered', 'disputed'];
  const orders = [];
  for (let i = 0; i < 24; i++) {
    const product = PS.products[i % PS.products.length];
    const qty = 1 + Math.floor(Math.random() * 4);
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * 30));
    orders.push({
      id: `ORD${1001 + i}`,
      customerId: 'u5',
      items: [{ productId: product.id, name: product.name, qty, price: product.pricePerUnit }],
      totalAmount: product.pricePerUnit * qty + 40,
      status: statuses[i % statuses.length],
      deliveryAddress: '14/A, Shivaji Nagar, Pune 411005',
      paymentMethod: ['UPI', 'COD', 'Net Banking'][i % 3],
      paymentStatus: i % 5 < 4 ? 'paid' : 'pending',
      createdAt: date.toISOString(),
    });
  }
  return orders;
})();

PS.notifications = [
  { id: 'n1', userId: 'u2', title: 'Vaccination Due', message: 'Newcastle Disease vaccine due for Shed A in 3 days', type: 'alert', isRead: false, createdAt: new Date(Date.now() - 3600000).toISOString() },
  { id: 'n2', userId: 'u2', title: 'New Order Received', message: 'Priya Sharma ordered 2 dozen Farm Fresh Brown Eggs', type: 'order', isRead: false, createdAt: new Date(Date.now() - 7200000).toISOString() },
  { id: 'n3', userId: 'u2', title: 'Mortality Alert', message: 'Shed B reported 8 mortalities today — please review', type: 'warning', isRead: true, createdAt: new Date(Date.now() - 86400000).toISOString() },
  { id: 'n4', userId: 'u1', title: 'New Farm Registration', message: 'Ali Agro Farm pending verification approval', type: 'info', isRead: false, createdAt: new Date(Date.now() - 1800000).toISOString() },
];

// ── AUTH STATE ────────────────────────────────────────────────────────────────

PS.auth = {
  currentUser: null,
  
  login(email, password) {
    // Demo credentials
    const credMap = {
      'admin@poultrysmart.in': { pass: 'admin123', userId: 'u1' },
      'ravi@farm.in': { pass: 'farmer123', userId: 'u2' },
      'sunita@farm.in': { pass: 'farmer123', userId: 'u3' },
      'priya@gmail.com': { pass: 'customer123', userId: 'u5' },
    };
    const cred = credMap[email];
    if (cred && cred.pass === password) {
      this.currentUser = PS.users.find(u => u.id === cred.userId);
      localStorage.setItem('ps_user', JSON.stringify(this.currentUser));
      return { success: true, user: this.currentUser };
    }
    return { success: false, error: 'Invalid credentials' };
  },
  
  logout() {
    this.currentUser = null;
    localStorage.removeItem('ps_user');
    window.location.href = 'login.html';
  },
  
  restore() {
    const saved = localStorage.getItem('ps_user');
    if (saved) this.currentUser = JSON.parse(saved);
    return this.currentUser;
  },
  
  redirectByRole() {
    if (!this.currentUser) return;
    const map = { admin: 'dashboard-admin.html', farmer: 'dashboard-farmer.html', customer: 'dashboard-customer.html' };
    window.location.href = map[this.currentUser.role] || 'index.html';
  }
};

// ── COMPUTED STATS ────────────────────────────────────────────────────────────

PS.stats = {
  todayEggs() {
    const today = new Date().toISOString().split('T')[0];
    return PS.productionLogs.filter(l => l.date === today && l.farmId === 'f1').reduce((s, l) => s + l.netEggs, 0) || 4280;
  },
  monthRevenue() {
    const mo = new Date().toISOString().substr(0, 7);
    return PS.transactions.filter(t => t.farmId === 'f1' && t.type === 'income' && t.date.startsWith(mo)).reduce((s, t) => s + t.amount, 0) || 91400;
  },
  pendingOrders() {
    return PS.orders.filter(o => o.status === 'pending').length;
  },
  totalBirds() {
    return PS.flocks.filter(f => f.farmId === 'f1' && f.status === 'active').reduce((s, f) => s + f.currentCount, 0);
  },
  platformEggsTracked() { return 48200000; },
  platformFarms() { return 12400; },
  platformOrders() { return 3100000; },
  platformIncome() { return 24000000; },
};

// ── i18n ──────────────────────────────────────────────────────────────────────

PS.i18n = {
  current: localStorage.getItem('ps_lang') || 'en',
  strings: {
    en: {
      welcome: 'Good morning',
      todayEggs: "Today's Eggs",
      liveBirds: 'Live Birds',
      pendingOrders: 'Pending Orders',
      monthRevenue: 'Monthly Revenue',
      farmName: "Ravi's Green Farm",
    },
    hi: {
      welcome: 'सुप्रभात',
      todayEggs: 'आज के अंडे',
      liveBirds: 'जीवित पक्षी',
      pendingOrders: 'लंबित ऑर्डर',
      monthRevenue: 'मासिक राजस्व',
      farmName: 'रवि का हरित फार्म',
    },
    mr: {
      welcome: 'शुभ सकाळ',
      todayEggs: 'आजची अंडी',
      liveBirds: 'जिवंत पक्षी',
      pendingOrders: 'प्रलंबित ऑर्डर',
      monthRevenue: 'मासिक उत्पन्न',
      farmName: 'रवीचे हरित फार्म',
    }
  },
  t(key) {
    return this.strings[this.current]?.[key] || this.strings.en[key] || key;
  },
  set(lang) {
    this.current = lang;
    localStorage.setItem('ps_lang', lang);
  }
};

// ── CART ──────────────────────────────────────────────────────────────────────

PS.cart = {
  items: JSON.parse(localStorage.getItem('ps_cart') || '[]'),
  add(productId, qty = 1) {
    const product = PS.products.find(p => p.id === productId);
    if (!product) return;
    const existing = this.items.find(i => i.productId === productId);
    if (existing) existing.qty += qty;
    else this.items.push({ productId, qty, name: product.name, price: product.pricePerUnit, unit: product.unit, farmName: product.farmName });
    this.save();
    this.updateBadge();
  },
  remove(productId) {
    this.items = this.items.filter(i => i.productId !== productId);
    this.save();
    this.updateBadge();
  },
  total() {
    return this.items.reduce((s, i) => s + i.price * i.qty, 0);
  },
  save() {
    localStorage.setItem('ps_cart', JSON.stringify(this.items));
  },
  updateBadge() {
    const badge = document.getElementById('cart-badge');
    if (badge) badge.textContent = this.items.length;
  }
};

console.log('✅ PoultrySmart data layer loaded. Users:', PS.users.length, 'Products:', PS.products.length);
