import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Chart, registerables } from 'chart.js';
import { useApp } from '../context/AppContext';
import DashboardLayout from '../components/DashboardLayout';
import '../components/DashboardLayout.css';
import './FarmerDashboard.css';
import { apiUrl } from '../config/api';
import { toast, ConfirmDialog } from '../components/Toast';

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

const i18nStrings = {
  en: { todayEggs: "Today's Eggs", liveBirds: 'Live Birds', pendingOrders: 'Pending Orders', monthRevenue: 'Monthly Revenue' },
  hi: { todayEggs: 'आज के अंडे', liveBirds: 'जीवित पक्षी', pendingOrders: 'लंबित ऑर्डर', monthRevenue: 'मासिक राजस्व' },
  mr: { todayEggs: 'आजची अंडी', liveBirds: 'जिवंत पक्षी', pendingOrders: 'प्रलंबित ऑर्डर', monthRevenue: 'मासिक उत्पन्न' },
};

export default function FarmerDashboard() {
  const { currentUser, lang, setLang } = useApp();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [data, setData] = useState({
    flocks: [],
    productionLogs: [],
    transactions: [],
    feedLogs: [],
    healthLogs: [],
    products: [],
    orders: [],
    notifications: [],
  });

  const farmId = currentUser?.farmId;

  const fetchData = async () => {
    if (!farmId) return;
    try {
      const res = await fetch(apiUrl(`/api/data/dashboard/farmer?farmId=${farmId}`));
      if (!res.ok) return;
      setData(await res.json());
    } catch (err) {
      console.error('Failed to load farmer dashboard data', err);
    }
  };

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'farmer') navigate('/login');
  }, [currentUser, navigate]);

  useEffect(() => {
    fetchData();
  }, [farmId]);

  if (!currentUser || currentUser.role !== 'farmer') return null;

  const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const renderContent = () => {
    switch (activeTab) {
      case 0: return <DashboardOverview lang={lang} setLang={setLang} today={today} data={data} farmId={farmId} refresh={fetchData} />;
      case 1: return <FlocksView data={data} farmId={farmId} refresh={fetchData} />;
      case 2: return <EggsView data={data} farmId={farmId} refresh={fetchData} />;
      case 3: return <FeedLogsView data={data} farmId={farmId} refresh={fetchData} />;
      case 4: return <HealthVaccinesView data={data} farmId={farmId} refresh={fetchData} />;
      case 5: return <FinancialsView data={data} farmId={farmId} refresh={fetchData} />;
      case 6: return <MyProductsView data={data} farmId={farmId} refresh={fetchData} />;
      case 7: return <FarmerOrdersView data={data} farmId={farmId} refresh={fetchData} />;
      case 8: return <ReportsView data={data} />;
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
      title={`Welcome, ${currentUser.name?.split(' ')[0] || 'Farmer'} 🌾`} 
      subtitle={activeTab === 0 ? today : navItems[activeTab].label} 
      role="farmer"
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
      {renderContent()}
    </DashboardLayout>
  );
}


function DashboardOverview({ lang, setLang, today, data, farmId, refresh }) {
  const { flocks, productionLogs, transactions, orders } = data;
  const eggRef = useRef(null);
  const finRef = useRef(null);
  const chartsRef = useRef([]);
  const [modal, setModal] = useState(null);
  const [formVals, setFormVals] = useState({});
  const [saving, setSaving] = useState(false);

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
    const inc = transactions.filter(t => t.type === 'income' && t.date.startsWith(mo)).reduce((s, t) => s + t.amount, 0) || 91400;
    const profit = inc - 63000;

    if (finRef.current) {
      chartsRef.current.push(new Chart(finRef.current, {
        type: 'doughnut',
        data: { labels: ['Feed', 'Medicine', 'Labor', 'Profit'], datasets: [{ data: [42000, 4200, 16800, profit], backgroundColor: ['#f59e0b', '#ef4444', '#6366f1', '#16a34a'], borderWidth: 0, hoverOffset: 6 }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { color: tc }, position: 'bottom' } } }
      }));
    }

    return () => { chartsRef.current.forEach(c => c.destroy()); chartsRef.current = []; };
  }, [productionLogs, transactions]);

  const s = i18nStrings[lang] || i18nStrings.en;
  const mo = new Date().toISOString().substr(0, 7);
  const inc = transactions.filter(t => t.type === 'income' && t.date.startsWith(mo)).reduce((s, t) => s + t.amount, 0) || 91400;
  const exp = transactions.filter(t => t.type === 'expense' && t.date.startsWith(mo)).reduce((s, t) => s + t.amount, 0) || 63000;
  const totalBirds = flocks.filter(f => f.status === 'active').reduce((sum, f) => sum + f.currentCount, 0);
  const todayDate = new Date().toISOString().split('T')[0];
  const todayEggs = productionLogs.filter(l => l.date === todayDate).reduce((sum, l) => sum + l.netEggs, 0);
  const pendingOrders = orders.filter(o => o.status === 'pending').length;
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

      {/* QUICK ADD — navigates to the actual form view */}
      <div className="add-entry-row">
        <button className="add-btn" onClick={() => setModal('eggs')}>🥚 Record Eggs</button>
        <button className="add-btn" onClick={() => setModal('income')}>💰 Add Income</button>
        <button className="add-btn" onClick={() => setModal('expense')}>💸 Add Expense</button>
        <button className="add-btn" onClick={() => setModal('mortality')}>⚰️ Log Mortality</button>
      </div>

      {/* KPI */}
      <div className="kpi-grid">
        <div className="kpi-card green">
          <div className="kpi-icon-box green">🐔</div>
          <div className="kpi-val">{totalBirds.toLocaleString('en-IN')}</div>
          <div className="kpi-label">{s.liveBirds}</div>
          <div className="kpi-trend up">3 Sheds Active</div>
        </div>
        <div className="kpi-card yellow">
          <div className="kpi-icon-box yellow">🥚</div>
          <div className="kpi-val">{todayEggs.toLocaleString('en-IN')}</div>
          <div className="kpi-label">{s.todayEggs}</div>
          <div className="kpi-trend up">↑ 87.2% production rate</div>
        </div>
        <div className="kpi-card purple">
          <div className="kpi-icon-box purple">💰</div>
          <div className="kpi-val">₹{inc.toLocaleString('en-IN')}</div>
          <div className="kpi-label">{s.monthRevenue}</div>
          <div className="kpi-trend up">↑ 9% vs last month</div>
        </div>
        <div className="kpi-card red">
          <div className="kpi-icon-box red">📦</div>
          <div className="kpi-val">{pendingOrders}</div>
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
              {flocks.map(f => (
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

      {/* QUICK-ADD MODAL — now uses controlled inputs and POSTs to backend */}
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
                    ? <select className="modal-control" value={formVals[field.label] || ''} onChange={e => setFormVals(p => ({ ...p, [field.label]: e.target.value }))}>
                        <option value="">Select</option>{field.opts.map(o => <option key={o}>{o}</option>)}
                      </select>
                    : <input type={field.type} className="modal-control" placeholder={field.placeholder}
                        value={formVals[field.label] || ''}
                        onChange={e => setFormVals(p => ({ ...p, [field.label]: e.target.value }))}
                      />
                  }
                </div>
              ))}
            </div>
            <button className="modal-save" disabled={saving} onClick={async () => {
              if (!farmId) { toast.error('Error', 'No farm linked to your account.'); return; }
              setSaving(true);
              try {
                let endpoint = '', body = {};
                const today = new Date().toISOString().split('T')[0];
                if (modal === 'eggs') {
                  const total = parseInt(formVals['Total Eggs Collected'] || 0);
                  const broken = parseInt(formVals['Broken Eggs'] || 0);
                  if (!total) { toast.warning('Missing', 'Enter total eggs collected.'); setSaving(false); return; }
                  endpoint = '/api/data/production-logs';
                  body = { farmId, flockId: formVals['Shed'] || 'Shed A', date: today, totalEggs: total, brokenEggs: broken };
                } else if (modal === 'income' || modal === 'expense') {
                  const amount = parseFloat(formVals['Amount (₹)'] || 0);
                  if (!formVals['Category'] || !amount) { toast.warning('Missing', 'Fill category and amount.'); setSaving(false); return; }
                  endpoint = '/api/data/transactions';
                  body = { farmId, type: modal, category: formVals['Category'], amount, date: today, notes: formVals['Notes'] || '' };
                } else if (modal === 'mortality') {
                  endpoint = '/api/data/health-logs';
                  body = { farmId, flockId: formVals['Shed'] || 'Shed A', date: today, mortality: parseInt(formVals['Number of Deaths'] || 0), cause: formVals['Cause'] || 'Unknown', vaccinations: [], notes: '' };
                }
                const res = await fetch(apiUrl(endpoint), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
                const result = await res.json();
                if (!res.ok) throw new Error(result.message);
                toast.success('Saved to Database! ✅', `${modalForms[modal].title.replace(/[^a-zA-Z ]/g, '').trim()} recorded.`);
                setModal(null);
                setFormVals({});
                refresh();
              } catch (err) {
                toast.error('Save Failed', err.message || 'Could not save entry.');
              } finally { setSaving(false); }
            }}>{saving ? 'Saving...' : 'Save Entry'}</button>
          </div>
        </div>
      )}
    </>
  );
}

function FlocksView({ data }) {
  const { currentUser } = useApp();
  const [dbFlocks, setDbFlocks] = useState(data.flocks || []);
  const [showAddForm, setShowAddForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    shed: '',
    breed: '',
    placementDate: new Date().toISOString().split('T')[0],
    initialCount: '',
    currentCount: '',
    ageWeeks: '',
    healthStatus: 'healthy',
  });

  useEffect(() => {
    setDbFlocks(data.flocks || []);
  }, [data.flocks]);

  const handleCreateFlock = async () => {
    if (!currentUser?.farmId || !form.shed || !form.breed || !form.initialCount || !form.currentCount || !form.ageWeeks) {
      alert('Please fill all required fields.');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        farmId: currentUser.farmId,
        shed: form.shed,
        breed: form.breed,
        placementDate: form.placementDate,
        initialCount: Number(form.initialCount),
        currentCount: Number(form.currentCount),
        ageWeeks: Number(form.ageWeeks),
        healthStatus: form.healthStatus,
        status: 'active',
      };
      const res = await fetch(apiUrl('/api/flocks'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const created = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(created.message || 'Failed to create flock');
      setDbFlocks(prev => [created, ...prev]);
      setShowAddForm(false);
      setForm({
        shed: '',
        breed: '',
        placementDate: new Date().toISOString().split('T')[0],
        initialCount: '',
        currentCount: '',
        ageWeeks: '',
        healthStatus: 'healthy',
      });
    } catch (error) {
      alert(`Could not add flock: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="view-section">
      <div className="section-header">
        <h2>My Flocks</h2>
        <button className="btn-primary" onClick={() => setShowAddForm(s => !s)}>
          {showAddForm ? 'Cancel' : 'Add New Flock'}
        </button>
      </div>
      {showAddForm && (
        <div className="chart-card" style={{ marginBottom: '16px' }}>
          <h3 style={{ marginBottom: '12px' }}>Create New Flock</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
            <input className="modal-control" placeholder="Shed (A/B/C)" value={form.shed} onChange={e => setForm({ ...form, shed: e.target.value })} />
            <input className="modal-control" placeholder="Breed (e.g. BV-300)" value={form.breed} onChange={e => setForm({ ...form, breed: e.target.value })} />
            <input className="modal-control" type="date" value={form.placementDate} onChange={e => setForm({ ...form, placementDate: e.target.value })} />
            <input className="modal-control" type="number" placeholder="Initial Count" value={form.initialCount} onChange={e => setForm({ ...form, initialCount: e.target.value })} />
            <input className="modal-control" type="number" placeholder="Current Count" value={form.currentCount} onChange={e => setForm({ ...form, currentCount: e.target.value })} />
            <input className="modal-control" type="number" placeholder="Age (weeks)" value={form.ageWeeks} onChange={e => setForm({ ...form, ageWeeks: e.target.value })} />
            <select className="modal-control" value={form.healthStatus} onChange={e => setForm({ ...form, healthStatus: e.target.value })}>
              <option value="healthy">healthy</option>
              <option value="monitor">monitor</option>
              <option value="sick">sick</option>
            </select>
          </div>
          <button className="btn-primary" style={{ marginTop: '12px' }} onClick={handleCreateFlock} disabled={saving}>
            {saving ? 'Saving...' : 'Save Flock'}
          </button>
        </div>
      )}
      <div className="table-card full-width">
        <table className="ps-table">
          <thead><tr><th>Shed</th><th>Breed</th><th>Initial Count</th><th>Current Count</th><th>Age</th><th>Health</th><th>Actions</th></tr></thead>
          <tbody>
            {dbFlocks.map(f => (
              <tr key={f._id || f.id}>
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

function EggsView({ data, farmId, refresh }) {
  const productionLogs = data.productionLogs || [];
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ shed: 'Shed A', totalEggs: '', brokenEggs: '0' });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!form.totalEggs) { toast.warning('Missing Data', 'Please enter total eggs collected.'); return; }
    if (!farmId) { toast.error('Error', 'No farm linked to your account.'); return; }
    setSaving(true);
    try {
      const res = await fetch(apiUrl('/api/data/production-logs'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          farmId,
          flockId: form.shed,
          date: new Date().toISOString().split('T')[0],
          totalEggs: parseInt(form.totalEggs),
          brokenEggs: parseInt(form.brokenEggs || 0),
        }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message);
      const net = parseInt(form.totalEggs) - parseInt(form.brokenEggs || 0);
      toast.success('Eggs Recorded! 🥚', `${net.toLocaleString('en-IN')} net eggs saved to database.`);
      setForm({ shed: 'Shed A', totalEggs: '', brokenEggs: '0' });
      setShowForm(false);
      refresh();
    } catch (err) {
      toast.error('Save Failed', err.message || 'Could not save record.');
    } finally { setSaving(false); }
  };

  const allLogs = productionLogs.slice(0, 20);

  return (
    <div className="view-section">
      <div className="section-header">
        <h2>Egg Production Records</h2>
        <button className="btn-primary" onClick={() => setShowForm(s => !s)}>{showForm ? 'Cancel' : '+ Record Today\'s Eggs'}</button>
      </div>
      {showForm && (
        <div className="chart-card" style={{ marginBottom: '16px' }}>
          <h3 style={{ marginBottom: '14px' }}>🥚 Record Egg Collection</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '10px', marginBottom: '14px' }}>
            <div><label style={{ display:'block', fontSize:'12px', color:'var(--text3)', marginBottom:'4px' }}>Shed</label><select className="modal-control" value={form.shed} onChange={e => setForm({...form, shed: e.target.value})}><option>Shed A</option><option>Shed B</option><option>Shed C</option></select></div>
            <div><label style={{ display:'block', fontSize:'12px', color:'var(--text3)', marginBottom:'4px' }}>Total Eggs</label><input className="modal-control" type="number" placeholder="e.g. 1720" value={form.totalEggs} onChange={e => setForm({...form, totalEggs: e.target.value})} /></div>
            <div><label style={{ display:'block', fontSize:'12px', color:'var(--text3)', marginBottom:'4px' }}>Broken Eggs</label><input className="modal-control" type="number" placeholder="e.g. 12" value={form.brokenEggs} onChange={e => setForm({...form, brokenEggs: e.target.value})} /></div>
          </div>
          <button className="btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save Record'}</button>
        </div>
      )}
      <div className="table-card full-width">
        <table className="ps-table">
          <thead><tr><th>Date</th><th>Flock/Shed</th><th>Total Eggs</th><th>Broken/Damaged</th><th>Net Eggs</th></tr></thead>
          <tbody>
            {allLogs.map((l, i) => (
              <tr key={i}>
                <td>{new Date(l.date).toLocaleDateString('en-IN')}</td>
                <td><strong>{l.flockId}</strong></td>
                <td>{l.totalEggs.toLocaleString('en-IN')}</td>
                <td style={{ color: l.brokenEggs > 0 ? '#ef4444' : 'inherit' }}>{l.brokenEggs}</td>
                <td><strong>{l.netEggs.toLocaleString('en-IN')}</strong></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function FinancialsView({ data, farmId, refresh }) {
  const transactions = data.transactions || [];
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({ category: '', amount: '', notes: '' });
  const [saving, setSaving] = useState(false);

  const cats = { income: ['Egg Sales', 'Chicken Sales', 'Manure Sales', 'Other'], expense: ['Feed', 'Medicine', 'Labor', 'Equipment', 'Electricity', 'Other'] };

  const handleSave = async () => {
    if (!form.category || !form.amount) { toast.warning('Missing Info', 'Please fill category and amount.'); return; }
    if (!farmId) { toast.error('Error', 'No farm linked to your account.'); return; }
    setSaving(true);
    try {
      const res = await fetch(apiUrl('/api/data/transactions'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          farmId,
          type: modal,
          category: form.category,
          amount: parseFloat(form.amount),
          date: new Date().toISOString().split('T')[0],
          notes: form.notes,
        }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message);
      const sign = modal === 'income' ? '+' : '-';
      toast.success(modal === 'income' ? 'Income Saved 💰' : 'Expense Saved 💸', `${sign}₹${parseFloat(form.amount).toLocaleString('en-IN')} saved to database.`);
      setModal(null);
      setForm({ category: '', amount: '', notes: '' });
      refresh();
    } catch (err) {
      toast.error('Save Failed', err.message || 'Could not save entry.');
    } finally { setSaving(false); }
  };

  const allTx = transactions.slice(0, 20);

  return (
    <div className="view-section">
      {modal && (
        <div className="modal-backdrop" onClick={() => setModal(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h3>{modal === 'income' ? '💰 Add Income' : '💸 Add Expense'}</h3><button className="modal-close" onClick={() => setModal(null)}>✕</button></div>
            <div className="modal-body">
              <div className="modal-field"><label>Category</label><select className="modal-control" value={form.category} onChange={e => setForm({...form, category: e.target.value})}><option value="">Select category</option>{(cats[modal] || []).map(c => <option key={c}>{c}</option>)}</select></div>
              <div className="modal-field"><label>Amount (₹)</label><input className="modal-control" type="number" placeholder="e.g. 14500" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} /></div>
              <div className="modal-field"><label>Notes (optional)</label><input className="modal-control" type="text" placeholder="Brief description" value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} /></div>
            </div>
            <button className="modal-save" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save Entry'}</button>
          </div>
        </div>
      )}
      <div className="section-header">
        <h2>Income & Expenses</h2>
        <div>
          <button className="btn-primary" style={{ marginRight: '10px' }} onClick={() => { setForm({category:'',amount:'',notes:''}); setModal('income'); }}>+ Add Income</button>
          <button className="btn-primary" style={{ background: '#ef4444' }} onClick={() => { setForm({category:'',amount:'',notes:''}); setModal('expense'); }}>+ Add Expense</button>
        </div>
      </div>
      <div className="table-card full-width">
        <table className="ps-table">
          <thead><tr><th>Date</th><th>Type</th><th>Category</th><th>Amount</th><th>Notes</th></tr></thead>
          <tbody>
            {allTx.map((t, i) => (
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

function FeedLogsView({ data, farmId, refresh }) {
  const feedLogs = data.feedLogs || [];
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ flockId: 'Shed A', feedType: 'Layer Feed', quantityKg: '', costPerKg: '' });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!form.quantityKg || !form.costPerKg) { toast.warning('Missing Info', 'Please fill quantity and cost.'); return; }
    if (!farmId) { toast.error('Error', 'No farm linked to your account.'); return; }
    setSaving(true);
    try {
      const res = await fetch(apiUrl('/api/data/feed-logs'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          farmId,
          flockId: form.flockId,
          date: new Date().toISOString().split('T')[0],
          feedType: form.feedType,
          quantityKg: parseFloat(form.quantityKg),
          costPerKg: parseFloat(form.costPerKg),
        }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message);
      toast.success('Feed Log Saved! 🌾', `${form.quantityKg}kg of ${form.feedType} saved to database.`);
      setForm({ flockId: 'Shed A', feedType: 'Layer Feed', quantityKg: '', costPerKg: '' });
      setShowForm(false);
      refresh();
    } catch (err) {
      toast.error('Save Failed', err.message || 'Could not save log.');
    } finally { setSaving(false); }
  };

  const allLogs = feedLogs.slice(0, 20);

  return (
    <div className="view-section">
      <div className="section-header">
        <h2>Feed Logs</h2>
        <button className="btn-primary" onClick={() => setShowForm(s => !s)}>{showForm ? 'Cancel' : '+ Log Feed Intake'}</button>
      </div>
      {showForm && (
        <div className="chart-card" style={{ marginBottom: '16px' }}>
          <h3 style={{ marginBottom: '14px' }}>🌾 Log Feed Intake</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '10px', marginBottom: '14px' }}>
            <div><label style={{ display:'block', fontSize:'12px', color:'var(--text3)', marginBottom:'4px' }}>Shed/Flock</label><select className="modal-control" value={form.flockId} onChange={e => setForm({...form, flockId: e.target.value})}><option>Shed A</option><option>Shed B</option><option>Shed C</option></select></div>
            <div><label style={{ display:'block', fontSize:'12px', color:'var(--text3)', marginBottom:'4px' }}>Feed Type</label><select className="modal-control" value={form.feedType} onChange={e => setForm({...form, feedType: e.target.value})}><option>Layer Feed</option><option>Starter Feed</option><option>Grower Feed</option><option>Organic Mix</option></select></div>
            <div><label style={{ display:'block', fontSize:'12px', color:'var(--text3)', marginBottom:'4px' }}>Quantity (kg)</label><input className="modal-control" type="number" placeholder="e.g. 200" value={form.quantityKg} onChange={e => setForm({...form, quantityKg: e.target.value})} /></div>
            <div><label style={{ display:'block', fontSize:'12px', color:'var(--text3)', marginBottom:'4px' }}>Cost per Kg (₹)</label><input className="modal-control" type="number" placeholder="e.g. 28" value={form.costPerKg} onChange={e => setForm({...form, costPerKg: e.target.value})} /></div>
          </div>
          <button className="btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save Log'}</button>
        </div>
      )}
      <div className="table-card full-width">
        <table className="ps-table">
          <thead><tr><th>Date</th><th>Shed/Flock</th><th>Feed Type</th><th>Quantity (kg)</th><th>Cost per Kg</th><th>Total Cost</th></tr></thead>
          <tbody>
            {allLogs.map((f, i) => (
              <tr key={i}>
                <td>{new Date(f.date).toLocaleDateString('en-IN')}</td>
                <td><strong>{f.flockId}</strong></td>
                <td>{f.feedType}</td>
                <td>{f.quantityKg} kg</td>
                <td>₹{f.costPerKg}</td>
                <td><strong>₹{(f.quantityKg * f.costPerKg).toLocaleString('en-IN')}</strong></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function HealthVaccinesView({ data, farmId, refresh }) {
  const healthLogs = data.healthLogs || [];
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ flockId: 'Shed A', mortality: '0', cause: 'Unknown', notes: '' });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!farmId) { toast.error('Error', 'No farm linked to your account.'); return; }
    setSaving(true);
    try {
      const res = await fetch(apiUrl('/api/data/health-logs'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          farmId,
          flockId: form.flockId,
          date: new Date().toISOString().split('T')[0],
          mortality: parseInt(form.mortality || 0),
          cause: form.cause,
          vaccinations: [],
          notes: form.notes,
        }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message);
      toast.success('Health Log Saved! 🏥', `Saved to database — ${form.flockId}, ${form.mortality} mortality, Cause: ${form.cause}.`);
      setForm({ flockId: 'Shed A', mortality: '0', cause: 'Unknown', notes: '' });
      setShowForm(false);
      refresh();
    } catch (err) {
      toast.error('Save Failed', err.message || 'Could not save health log.');
    } finally { setSaving(false); }
  };

  const allLogs = healthLogs.slice(0, 20);

  return (
    <div className="view-section">
      <div className="section-header">
        <h2>Health & Vaccines</h2>
        <button className="btn-primary" onClick={() => setShowForm(s => !s)}>{showForm ? 'Cancel' : '+ Add Health Log'}</button>
      </div>
      {showForm && (
        <div className="chart-card" style={{ marginBottom: '16px' }}>
          <h3 style={{ marginBottom: '14px' }}>🏥 Add Health Log</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '10px', marginBottom: '14px' }}>
            <div><label style={{ display:'block', fontSize:'12px', color:'var(--text3)', marginBottom:'4px' }}>Shed/Flock</label><select className="modal-control" value={form.flockId} onChange={e => setForm({...form, flockId: e.target.value})}><option>Shed A</option><option>Shed B</option><option>Shed C</option></select></div>
            <div><label style={{ display:'block', fontSize:'12px', color:'var(--text3)', marginBottom:'4px' }}>Mortality Count</label><input className="modal-control" type="number" placeholder="e.g. 3" value={form.mortality} onChange={e => setForm({...form, mortality: e.target.value})} /></div>
            <div><label style={{ display:'block', fontSize:'12px', color:'var(--text3)', marginBottom:'4px' }}>Cause</label><select className="modal-control" value={form.cause} onChange={e => setForm({...form, cause: e.target.value})}><option>Unknown</option><option>Disease</option><option>Heat Stress</option><option>Predator</option><option>Injury</option></select></div>
            <div><label style={{ display:'block', fontSize:'12px', color:'var(--text3)', marginBottom:'4px' }}>Notes</label><input className="modal-control" type="text" placeholder="Optional notes" value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} /></div>
          </div>
          <button className="btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save Log'}</button>
        </div>
      )}
      <div className="table-card full-width">
        <table className="ps-table">
          <thead><tr><th>Date</th><th>Flock ID</th><th>Mortality</th><th>Cause</th><th>Vaccinations</th><th>Notes</th></tr></thead>
          <tbody>
            {allLogs.map((l, i) => (
              <tr key={i}>
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

function MyProductsView({ data }) {
  const farmProducts = data.products || [];
  return (
    <div className="view-section">
      <div className="section-header">
        <h2>My Shop Products</h2>
        <button className="btn-primary" onClick={() => toast.info('Coming Soon', 'Add product form will be available in the next update.')}>+ Add New Product</button>
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
                  <button className="action-btn" onClick={() => toast.info('Edit Product', `Editing "${p.name}" — feature coming soon.`)}>Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function FarmerOrdersView({ data }) {
  const farmOrders = data.orders || [];
  
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
                  <button className="action-btn" onClick={() => toast.success('Status Updated', `Order ${o.id} marked as dispatched.`)}>Update Status</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function downloadCSV(filename, rows) {
  const csv = rows.map(r => r.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

function ReportsView() {
  return (
    <div className="view-section">
      <div className="section-header">
        <h2>Farm Reports</h2>
      </div>
      <div className="kpi-grid">
        <div className="chart-card">
          <h3 style={{ marginBottom: '10px' }}>📊 Monthly Production Report</h3>
          <p style={{ fontSize: '13px', color: 'var(--text3)', marginBottom: '16px' }}>Detailed breakdown of egg production, mortality, and feed conversion ratio (FCR).</p>
          <button className="btn-primary" style={{ width: '100%' }} onClick={() => { downloadCSV('production_report.csv', [['Date','Shed','Total Eggs','Broken','Net Eggs'],['2026-05-01','Shed A',1800,12,1788],['2026-05-02','Shed A',1820,8,1812],['2026-05-03','Shed B',1750,15,1735]]); toast.success('Report Downloaded!', 'production_report.csv saved.'); }}>⬇ Download CSV</button>
        </div>
        <div className="chart-card">
          <h3 style={{ marginBottom: '10px' }}>💰 Financial Statement</h3>
          <p style={{ fontSize: '13px', color: 'var(--text3)', marginBottom: '16px' }}>Comprehensive P&L statement including all recorded incomes and expenses.</p>
          <button className="btn-primary" style={{ width: '100%' }} onClick={() => { downloadCSV('financial_statement.csv', [['Date','Type','Category','Amount','Notes'],['2026-05-01','income','Egg Sales',91400,''],['2026-05-02','expense','Feed',42000,'Monthly feed'],['2026-05-03','expense','Labor',16800,'Wages']]); toast.success('Report Downloaded!', 'financial_statement.csv saved.'); }}>⬇ Download CSV</button>
        </div>
        <div className="chart-card">
          <h3 style={{ marginBottom: '10px' }}>🏥 Health Audit Report</h3>
          <p style={{ fontSize: '13px', color: 'var(--text3)', marginBottom: '16px' }}>Vaccination history, disease alerts, and mortality summaries for all flocks.</p>
          <button className="btn-primary" style={{ width: '100%' }} onClick={() => { downloadCSV('health_audit.csv', [['Date','Shed','Mortality','Cause','Notes'],['2026-05-01','Shed A',2,'Unknown',''],['2026-05-08','Shed C',1,'Heat Stress','High temp day']]); toast.success('Report Downloaded!', 'health_audit.csv saved.'); }}>⬇ Download CSV</button>
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
