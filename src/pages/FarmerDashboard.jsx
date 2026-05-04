import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Chart, registerables } from 'chart.js';
import { useApp } from '../context/AppContext';
import DashboardLayout from '../components/DashboardLayout';
import '../components/DashboardLayout.css';
import './FarmerDashboard.css';
import { flocks, productionLogs, transactions, notifications, stats, i18nStrings, feedLogs, healthLogs, products, orders } from '../data/psData';

Chart.register(...registerables);

const navItems = [
  { icon: '📊', label: 'Dashboard', path: '/dashboard/farmer' },
  { icon: '🐔', label: 'My Flocks', path: '/dashboard/farmer' },
  { icon: '🥚', label: 'Egg Records', path: '/dashboard/farmer' },
  { icon: '🌾', label: 'Feed Logs', path: '/dashboard/farmer' },
  { icon: '🏥', label: 'Health & Vaccines', path: '/dashboard/farmer' },
  { icon: '💰', label: 'Income & Expenses', path: '/dashboard/farmer' },
  { icon: '🛒', label: 'My Products', path: '/dashboard/farmer' },
  { icon: '📦', label: 'Orders', path: '/dashboard/farmer' },
  { icon: '📈', label: 'Reports', path: '/dashboard/farmer' },
  { icon: '🐥', label: 'Small Hens', path: '/dashboard/farmer' },
];

const modalForms = {
  eggs: { title: '🥚 Record Egg Collection', fields: [{ label: 'Shed', type: 'select', opts: ['Shed A', 'Shed B', 'Shed C'] }, { label: 'Total Eggs Collected', type: 'number', placeholder: 'e.g. 1720' }, { label: 'Broken Eggs', type: 'number', placeholder: 'e.g. 12' }] },
  income: { title: '💰 Add Income Entry', fields: [{ label: 'Category', type: 'select', opts: ['Egg Sales', 'Chicken Sales', 'Manure Sales', 'Other'] }, { label: 'Amount (₹)', type: 'number', placeholder: 'e.g. 14500' }, { label: 'Notes', type: 'text', placeholder: 'Optional description' }] },
  expense: { title: '💸 Add Expense Entry', fields: [{ label: 'Category', type: 'select', opts: ['Feed', 'Medicine', 'Labor', 'Equipment', 'Electricity', 'Other'] }, { label: 'Amount (₹)', type: 'number', placeholder: 'e.g. 9600' }] },
  mortality: { title: '⚰️ Log Mortality', fields: [{ label: 'Shed', type: 'select', opts: ['Shed A', 'Shed B', 'Shed C'] }, { label: 'Number of Deaths', type: 'number', placeholder: 'e.g. 3' }, { label: 'Cause', type: 'select', opts: ['Unknown', 'Disease', 'Heat Stress', 'Predator', 'Injury'] }] },
};

export default function FarmerDashboard() {
  const { currentUser, lang, setLang } = useApp();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'farmer') navigate('/login');
  }, [currentUser, navigate]);

  if (!currentUser || currentUser.role !== 'farmer') return null;

  const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const renderContent = () => {
    switch (activeTab) {
      case 0: return <DashboardOverview lang={lang} setLang={setLang} today={today} />;
      case 1: return <FlocksView />;
      case 2: return <EggsView />;
      case 3: return <FeedLogsView />;
      case 4: return <HealthVaccinesView />;
      case 5: return <FinancialsView />;
      case 6: return <MyProductsView />;
      case 7: return <FarmerOrdersView />;
      case 8: return <ReportsView />;
      case 9: return <SmallHensView />;
      default: return (
        <div className="placeholder-view">
          <h2>{navItems[activeTab].icon} {navItems[activeTab].label}</h2>
          <p>This section is currently under development. Please check back later.</p>
        </div>
      );
    }
  };

  return (
    <DashboardLayout 
      navItems={navItems} 
      title={`Welcome, Ravi 🌾`} 
      subtitle={activeTab === 0 ? today : navItems[activeTab].label} 
      role="farmer"
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
      {renderContent()}
    </DashboardLayout>
  );
}

function DashboardOverview({ lang, setLang, today }) {
  const eggRef = useRef(null);
  const finRef = useRef(null);
  const chartsRef = useRef([]);
  const [modal, setModal] = useState(null);

  const hour = new Date().getHours();
  const greetKey = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';
  const greetEmoji = hour < 12 ? '🌅' : hour < 17 ? '☀️' : '🌙';

  useEffect(() => {
    chartsRef.current.forEach(c => c.destroy());
    chartsRef.current = [];
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const tc = isDark ? '#a7c4ae' : '#475569';
    const gc = isDark ? 'rgba(255,255,255,.06)' : 'rgba(0,0,0,.05)';

    const logs = productionLogs.slice(-42);
    const dates = [...new Set(logs.map(l => l.date))].slice(-14);
    const vals = dates.map(d => logs.filter(l => l.date === d).reduce((s, l) => s + l.netEggs, 0));

    if (eggRef.current) {
      chartsRef.current.push(new Chart(eggRef.current, {
        type: 'line',
        data: { labels: dates.map(d => d.slice(5)), datasets: [{ label: 'Net Eggs', data: vals, borderColor: '#16a34a', backgroundColor: 'rgba(22,163,74,.1)', fill: true, tension: .4, pointRadius: 4, pointBackgroundColor: '#16a34a' }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { ticks: { color: tc, maxTicksLimit: 7 }, grid: { color: gc } }, y: { ticks: { color: tc }, grid: { color: gc } } } }
      }));
    }

    const mo = new Date().toISOString().substr(0, 7);
    const inc = transactions.filter(t => t.farmId === 'f1' && t.type === 'income' && t.date.startsWith(mo)).reduce((s, t) => s + t.amount, 0) || 91400;
    const profit = inc - 63000;

    if (finRef.current) {
      chartsRef.current.push(new Chart(finRef.current, {
        type: 'doughnut',
        data: { labels: ['Feed', 'Medicine', 'Labor', 'Profit'], datasets: [{ data: [42000, 4200, 16800, profit], backgroundColor: ['#f59e0b', '#ef4444', '#6366f1', '#16a34a'], borderWidth: 0, hoverOffset: 6 }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { color: tc }, position: 'bottom' } } }
      }));
    }

    return () => { chartsRef.current.forEach(c => c.destroy()); chartsRef.current = []; };
  }, []);

  const s = i18nStrings[lang] || i18nStrings.en;
  const mo = new Date().toISOString().substr(0, 7);
  const inc = transactions.filter(t => t.farmId === 'f1' && t.type === 'income' && t.date.startsWith(mo)).reduce((s, t) => s + t.amount, 0) || 91400;
  const exp = transactions.filter(t => t.farmId === 'f1' && t.type === 'expense' && t.date.startsWith(mo)).reduce((s, t) => s + t.amount, 0) || 63000;
  const finRows = [
    { label: '🥚 Egg Sales Income', amount: inc, type: 'income' },
    { label: '🌾 Feed Expenses', amount: 42000, type: 'expense' },
    { label: '💊 Medicine & Vaccines', amount: 4200, type: 'expense' },
    { label: '👷 Labor Wages', amount: 16800, type: 'expense' },
    { label: '📈 Net Profit', amount: inc - exp, type: 'profit' },
  ];

  return (
    <>
      {/* LANG TOGGLE */}
      <div className="farmer-topbar-extra">
        <div className="lang-toggle">
          {['en', 'hi', 'mr'].map(l => (
            <button key={l} className={`lang-btn ${lang === l ? 'active' : ''}`} onClick={() => setLang(l)}>
              {l === 'en' ? 'EN' : l === 'hi' ? 'हि' : 'म'}
            </button>
          ))}
        </div>
      </div>

      {/* WELCOME BAR */}
      <div className="welcome-bar">
        <div>
          <h3>{greetKey}, Ravi! {greetEmoji}</h3>
          <p>Ravi's Green Farm · Nashik, Maharashtra · 3 Active Sheds</p>
        </div>
        <div className="weather-pill">
          <span className="wicon">☀️</span>
          <span>28°C · Sunny</span>
        </div>
      </div>

      {/* ALERT */}
      <div className="alert-card">
        <div className="alert-icon">💉</div>
        <div className="alert-body">
          <strong>Vaccination Due in 3 Days!</strong>
          <p>Newcastle Disease vaccine is scheduled for Shed A (BV-300 flock, 1,948 birds) on May 5th. Please contact your vet to confirm.</p>
        </div>
      </div>

      {/* QUICK ADD */}
      <div className="add-entry-row">
        {Object.keys(modalForms).map(key => (
          <button key={key} className="add-btn" onClick={() => setModal(key)}>
            {key === 'eggs' ? '🥚 Record Eggs' : key === 'income' ? '💰 Add Income' : key === 'expense' ? '💸 Add Expense' : '⚰️ Log Mortality'}
          </button>
        ))}
      </div>

      {/* KPI */}
      <div className="kpi-grid">
        <div className="kpi-card green">
          <div className="kpi-icon-box green">🐔</div>
          <div className="kpi-val">{stats.totalBirds().toLocaleString('en-IN')}</div>
          <div className="kpi-label">{s.liveBirds}</div>
          <div className="kpi-trend up">3 Sheds Active</div>
        </div>
        <div className="kpi-card yellow">
          <div className="kpi-icon-box yellow">🥚</div>
          <div className="kpi-val">{stats.todayEggs().toLocaleString('en-IN')}</div>
          <div className="kpi-label">{s.todayEggs}</div>
          <div className="kpi-trend up">↑ 87.2% production rate</div>
        </div>
        <div className="kpi-card purple">
          <div className="kpi-icon-box purple">💰</div>
          <div className="kpi-val">₹{stats.monthRevenue().toLocaleString('en-IN')}</div>
          <div className="kpi-label">{s.monthRevenue}</div>
          <div className="kpi-trend up">↑ 9% vs last month</div>
        </div>
        <div className="kpi-card red">
          <div className="kpi-icon-box red">📦</div>
          <div className="kpi-val">{stats.pendingOrders()}</div>
          <div className="kpi-label">{s.pendingOrders}</div>
          <div className="kpi-trend down">⚠ Needs dispatch</div>
        </div>
      </div>

      {/* CHARTS */}
      <div className="charts-row">
        <div className="chart-card">
          <div className="chart-card-title">Egg Production — Last 14 Days</div>
          <div className="chart-card-sub">Net eggs collected per day across all sheds</div>
          <div className="chart-wrap"><canvas ref={eggRef} /></div>
        </div>
        <div className="chart-card">
          <div className="chart-card-title">Income vs Expense</div>
          <div className="chart-card-sub">This month breakdown</div>
          <div className="chart-wrap"><canvas ref={finRef} /></div>
        </div>
      </div>

      {/* TABLES */}
      <div className="tables-row">
        <div className="table-card">
          <div className="table-header"><h3>🐔 My Flocks</h3></div>
          <table className="ps-table">
            <thead><tr><th>Shed</th><th>Breed</th><th>Birds</th><th>Age</th><th>Health</th></tr></thead>
            <tbody>
              {flocks.filter(f => f.farmId === 'f1').map(f => (
                <tr key={f.id}>
                  <td><strong>{f.shed}</strong></td>
                  <td>{f.breed}</td>
                  <td>{f.currentCount.toLocaleString('en-IN')}</td>
                  <td>{f.ageWeeks}w</td>
                  <td><span className={`badge ${f.healthStatus}`}>{f.healthStatus}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="fin-card table-card">
          <div className="table-header"><h3>💰 This Month's Financials</h3></div>
          {finRows.map((row, i) => (
            <div key={i} className="fin-row">
              <span className="fin-label">{row.label}</span>
              <span className={`fin-amount ${row.type}`}>
                {row.amount < 0 ? '-' : ''}₹{Math.abs(row.amount).toLocaleString('en-IN')}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL */}
      {modal && (
        <div className="modal-backdrop" onClick={() => setModal(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{modalForms[modal].title}</h3>
              <button className="modal-close" onClick={() => setModal(null)}>✕</button>
            </div>
            <div className="modal-body">
              {modalForms[modal].fields.map((field, i) => (
                <div key={i} className="modal-field">
                  <label>{field.label}</label>
                  {field.type === 'select'
                    ? <select className="modal-control"><option value="">Select</option>{field.opts.map(o => <option key={o}>{o}</option>)}</select>
                    : <input type={field.type} className="modal-control" placeholder={field.placeholder} />
                  }
                </div>
              ))}
            </div>
            <button className="modal-save" onClick={() => { alert('Saved! (Demo mode)'); setModal(null); }}>Save Entry</button>
          </div>
        </div>
      )}
    </>
  );
}

function FlocksView() {
  return (
    <div className="view-section">
      <div className="section-header">
        <h2>My Flocks</h2>
        <button className="btn-primary">Add New Flock</button>
      </div>
      <div className="table-card full-width">
        <table className="ps-table">
          <thead><tr><th>Shed</th><th>Breed</th><th>Initial Count</th><th>Current Count</th><th>Age</th><th>Health</th><th>Actions</th></tr></thead>
          <tbody>
            {flocks.filter(f => f.farmId === 'f1').map(f => (
              <tr key={f.id}>
                <td><strong>{f.shed}</strong></td>
                <td>{f.breed}</td>
                <td>{f.initialCount.toLocaleString('en-IN')}</td>
                <td>{f.currentCount.toLocaleString('en-IN')}</td>
                <td>{f.ageWeeks} weeks</td>
                <td><span className={`badge ${f.healthStatus}`}>{f.healthStatus}</span></td>
                <td>
                  <button className="action-btn">Manage</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function EggsView() {
  return (
    <div className="view-section">
      <div className="section-header">
        <h2>Egg Production Records</h2>
        <button className="btn-primary">Record Today's Eggs</button>
      </div>
      <div className="table-card full-width">
        <table className="ps-table">
          <thead><tr><th>Date</th><th>Flock</th><th>Total Eggs</th><th>Broken/Damaged</th><th>Net Eggs</th></tr></thead>
          <tbody>
            {productionLogs.filter(l => l.farmId === 'f1').slice(0, 10).map((l, i) => (
              <tr key={i}>
                <td>{new Date(l.date).toLocaleDateString('en-IN')}</td>
                <td><strong>{l.flockId}</strong></td>
                <td>{l.totalEggs.toLocaleString('en-IN')}</td>
                <td>{l.brokenEggs}</td>
                <td><strong>{l.netEggs.toLocaleString('en-IN')}</strong></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function FinancialsView() {
  return (
    <div className="view-section">
      <div className="section-header">
        <h2>Income & Expenses</h2>
        <div>
          <button className="btn-primary" style={{ marginRight: '10px' }}>Add Income</button>
          <button className="btn-primary" style={{ background: '#ef4444' }}>Add Expense</button>
        </div>
      </div>
      <div className="table-card full-width">
        <table className="ps-table">
          <thead><tr><th>Date</th><th>Type</th><th>Category</th><th>Amount</th><th>Notes</th></tr></thead>
          <tbody>
            {transactions.filter(t => t.farmId === 'f1').slice(0, 10).map((t, i) => (
              <tr key={i}>
                <td>{new Date(t.date).toLocaleDateString('en-IN')}</td>
                <td><span className={`badge ${t.type === 'income' ? 'verified' : 'disputed'}`}>{t.type}</span></td>
                <td><strong>{t.category}</strong></td>
                <td style={{ color: t.type === 'income' ? '#16a34a' : '#ef4444', fontWeight: 'bold' }}>
                  {t.type === 'income' ? '+' : '-'}₹{t.amount.toLocaleString('en-IN')}
                </td>
                <td>{t.notes || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function FeedLogsView() {
  return (
    <div className="view-section">
      <div className="section-header">
        <h2>Feed Logs</h2>
        <button className="btn-primary">Log Feed Intake</button>
      </div>
      <div className="table-card full-width">
        <table className="ps-table">
          <thead><tr><th>Date</th><th>Flock ID</th><th>Feed Type</th><th>Quantity (kg)</th><th>Cost per Kg</th></tr></thead>
          <tbody>
            {feedLogs.filter(f => f.farmId === 'f1').map(f => (
              <tr key={f.id}>
                <td>{new Date(f.date).toLocaleDateString('en-IN')}</td>
                <td><strong>{f.flockId}</strong></td>
                <td>{f.feedType}</td>
                <td>{f.quantityKg} kg</td>
                <td>₹{f.costPerKg}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function HealthVaccinesView() {
  return (
    <div className="view-section">
      <div className="section-header">
        <h2>Health & Vaccines</h2>
        <button className="btn-primary">Add Health Log</button>
      </div>
      <div className="table-card full-width">
        <table className="ps-table">
          <thead><tr><th>Date</th><th>Flock ID</th><th>Mortality</th><th>Cause</th><th>Vaccinations</th><th>Notes</th></tr></thead>
          <tbody>
            {healthLogs.filter(l => l.farmId === 'f1').map(l => (
              <tr key={l.id}>
                <td>{new Date(l.date).toLocaleDateString('en-IN')}</td>
                <td><strong>{l.flockId}</strong></td>
                <td style={{ color: l.mortality > 0 ? '#ef4444' : 'inherit' }}>{l.mortality} birds</td>
                <td><span className={`badge ${l.cause === 'Disease' ? 'disputed' : 'pending'}`}>{l.cause}</span></td>
                <td>
                  {l.vaccinations.length > 0 
                    ? l.vaccinations.map((v, i) => <div key={i}>💉 {v.name} ({v.date})</div>) 
                    : 'None'
                  }
                </td>
                <td>{l.notes || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function MyProductsView() {
  const farmProducts = products.filter(p => p.farmId === 'f1');
  return (
    <div className="view-section">
      <div className="section-header">
        <h2>My Shop Products</h2>
        <button className="btn-primary">Add New Product</button>
      </div>
      <div className="table-card full-width">
        <table className="ps-table">
          <thead><tr><th>Product</th><th>Type</th><th>Price</th><th>Stock</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {farmProducts.map(p => (
              <tr key={p.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '24px' }}>{p.emoji}</span>
                    <strong>{p.name}</strong>
                  </div>
                </td>
                <td><span className="badge active">{p.type}</span></td>
                <td>₹{p.pricePerUnit} / {p.unit}</td>
                <td>{p.stock}</td>
                <td><span className={`badge ${p.isActive ? 'verified' : 'pending'}`}>{p.isActive ? 'Active' : 'Inactive'}</span></td>
                <td>
                  <button className="action-btn">Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function FarmerOrdersView() {
  const myProductIds = products.filter(p => p.farmId === 'f1').map(p => p.id);
  const farmOrders = orders.filter(o => o.items.some(item => myProductIds.includes(item.productId)));
  
  return (
    <div className="view-section">
      <div className="section-header">
        <h2>Customer Orders</h2>
        <div className="search-bar-sm">
          <input type="text" placeholder="Search orders..." />
        </div>
      </div>
      <div className="table-card full-width">
        <table className="ps-table">
          <thead><tr><th>Order ID</th><th>Date</th><th>Items</th><th>Total Amount</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {farmOrders.map(o => (
              <tr key={o.id}>
                <td><strong>{o.id}</strong></td>
                <td>{new Date(o.createdAt).toLocaleDateString('en-IN')}</td>
                <td>{o.items.map(item => `${item.qty}x ${item.name}`).join(', ')}</td>
                <td>₹{o.totalAmount.toLocaleString('en-IN')}</td>
                <td><span className={`badge ${o.status}`}>{o.status}</span></td>
                <td>
                  <button className="action-btn">Update Status</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ReportsView() {
  return (
    <div className="view-section">
      <div className="section-header">
        <h2>Farm Reports</h2>
      </div>
      <div className="kpi-grid">
        <div className="chart-card">
          <h3 style={{ marginBottom: '10px' }}>Monthly Production Report</h3>
          <p style={{ fontSize: '13px', color: 'var(--text3)', marginBottom: '16px' }}>Detailed breakdown of egg production, mortality, and feed conversion ratio (FCR).</p>
          <button className="btn-primary" style={{ width: '100%' }}>Download PDF</button>
        </div>
        <div className="chart-card">
          <h3 style={{ marginBottom: '10px' }}>Financial Statement</h3>
          <p style={{ fontSize: '13px', color: 'var(--text3)', marginBottom: '16px' }}>Comprehensive P&L statement including all recorded incomes and expenses.</p>
          <button className="btn-primary" style={{ width: '100%' }}>Download CSV</button>
        </div>
        <div className="chart-card">
          <h3 style={{ marginBottom: '10px' }}>Health Audit Report</h3>
          <p style={{ fontSize: '13px', color: 'var(--text3)', marginBottom: '16px' }}>Vaccination history, disease alerts, and mortality summaries for all flocks.</p>
          <button className="btn-primary" style={{ width: '100%' }}>Download PDF</button>
        </div>
      </div>
    </div>
  );
}

function SmallHensView() {
  const { currentUser } = useApp();
  const [smallHens, setSmallHens] = useState(() => {
    try { return JSON.parse(localStorage.getItem('smallHens')) || []; } catch { return []; }
  });
  
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    count: '',
    weight: '',
    age: '',
    health: 'Healthy'
  });

  const handleSave = () => {
    if (!formData.count || !formData.weight || !formData.age) return;
    const entry = {
      id: Date.now().toString(),
      farmerId: currentUser.id,
      date: formData.date,
      count: parseInt(formData.count),
      weight: parseFloat(formData.weight),
      age: parseInt(formData.age),
      health: formData.health
    };
    const updated = [entry, ...smallHens];
    setSmallHens(updated);
    localStorage.setItem('smallHens', JSON.stringify(updated));
    setShowForm(false);
    setFormData({ ...formData, count: '', weight: '', age: '', health: 'Healthy' });
  };

  const myHens = smallHens.filter(h => h.farmerId === currentUser.id);

  return (
    <div className="view-section">
      <div className="section-header">
        <h2>Small Hen (Chicks) Tracking</h2>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : 'Add New Record'}
        </button>
      </div>
      
      {showForm && (
        <div className="chart-card" style={{ marginBottom: '20px' }}>
          <h3 style={{ marginBottom: '16px' }}>Add Small Hen Record</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--text3)', marginBottom: '4px' }}>Date</label>
              <input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} style={{ width: '100%', padding: '10px', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--text3)', marginBottom: '4px' }}>Number of Chicks</label>
              <input type="number" placeholder="e.g. 500" value={formData.count} onChange={e => setFormData({...formData, count: e.target.value})} style={{ width: '100%', padding: '10px', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--text3)', marginBottom: '4px' }}>Avg Weight (g)</label>
              <input type="number" placeholder="e.g. 45" value={formData.weight} onChange={e => setFormData({...formData, weight: e.target.value})} style={{ width: '100%', padding: '10px', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--text3)', marginBottom: '4px' }}>Age (Days)</label>
              <input type="number" placeholder="e.g. 7" value={formData.age} onChange={e => setFormData({...formData, age: e.target.value})} style={{ width: '100%', padding: '10px', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--text3)', marginBottom: '4px' }}>Health Status</label>
              <select value={formData.health} onChange={e => setFormData({...formData, health: e.target.value})} style={{ width: '100%', padding: '10px', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)' }}>
                <option value="Healthy">Healthy</option>
                <option value="Weak">Weak</option>
                <option value="Sick">Sick</option>
              </select>
            </div>
          </div>
          <button className="btn-primary" onClick={handleSave}>Save Record</button>
        </div>
      )}

      <div className="table-card full-width">
        <table className="ps-table">
          <thead><tr><th>Date</th><th>Count</th><th>Growth Progress</th><th>Health</th></tr></thead>
          <tbody>
            {myHens.length > 0 ? myHens.map(h => (
              <tr key={h.id}>
                <td>{new Date(h.date).toLocaleDateString('en-IN')}</td>
                <td><strong>{h.count.toLocaleString('en-IN')}</strong></td>
                <td>{h.weight}g at {h.age} days</td>
                <td>
                  <span className={`badge ${h.health === 'Healthy' ? 'verified' : h.health === 'Weak' ? 'pending' : 'disputed'}`}>
                    {h.health}
                  </span>
                </td>
              </tr>
            )) : (
              <tr><td colSpan="4" style={{ textAlign: 'center', padding: '20px', color: 'var(--text3)' }}>No records found. Add your first record above.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
