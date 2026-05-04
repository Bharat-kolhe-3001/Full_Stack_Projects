import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Chart, registerables } from 'chart.js';
import { useApp } from '../context/AppContext';
import DashboardLayout from '../components/DashboardLayout';
import '../components/DashboardLayout.css';
import { farms, users, orders, productionLogs, transactions, notifications, stats, healthLogs } from '../data/psData';

Chart.register(...registerables);

const navItems = [
  { icon: '📊', label: 'Dashboard', path: '/dashboard/admin' },
  { icon: '🏭', label: 'Farms', path: '/dashboard/admin' },
  { icon: '👥', label: 'Users', path: '/dashboard/admin' },
  { icon: '📦', label: 'Orders', path: '/dashboard/admin' },
  { icon: '💰', label: 'Financials', path: '/dashboard/admin' },
  { icon: '🥚', label: 'Production', path: '/dashboard/admin' },
  { icon: '🏥', label: 'Health Alerts', path: '/dashboard/admin' },
  { icon: '🔔', label: 'Notifications', path: '/dashboard/admin' },
  { icon: '⚙️', label: 'Settings', path: '/dashboard/admin' },
];

function AnimCounter({ target, prefix = '', suffix = '' }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let t0 = performance.now(), dur = 1800;
    const tick = (now) => {
      const p = Math.min((now - t0) / dur, 1);
      const v = Math.round(target * (1 - Math.pow(1 - p, 3)));
      el.textContent = prefix + v.toLocaleString('en-IN') + suffix;
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target, prefix, suffix]);
  return <span ref={ref}>{prefix}0{suffix}</span>;
}

export default function AdminDashboard() {
  const { currentUser } = useApp();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'admin') navigate('/login');
  }, [currentUser, navigate]);

  const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  if (!currentUser || currentUser.role !== 'admin') return null;

  const renderContent = () => {
    switch (activeTab) {
      case 0: return <DashboardOverview />;
      case 1: return <FarmsView />;
      case 2: return <UsersView />;
      case 3: return <OrdersView />;
      case 4: return <FinancialsView />;
      case 5: return <ProductionView />;
      case 6: return <HealthAlertsView />;
      case 7: return <NotificationsView />;
      case 8: return <SettingsView />;
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
      title={navItems[activeTab].label} 
      subtitle={activeTab === 0 ? today : 'Manage and monitor platform data'} 
      role="admin"
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
      {renderContent()}
    </DashboardLayout>
  );
}

function DashboardOverview() {
  const revenueRef = useRef(null);
  const farmStatusRef = useRef(null);
  const eggRef = useRef(null);
  const userRef = useRef(null);
  const chartsRef = useRef([]);

  useEffect(() => {
    // Destroy old charts
    chartsRef.current.forEach(c => c.destroy());
    chartsRef.current = [];

    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const tc = isDark ? '#a7c4ae' : '#475569';
    const gc = isDark ? 'rgba(255,255,255,.06)' : 'rgba(0,0,0,.06)';

    const months = transactions.filter(t => t.type === 'income').slice(0, 12).map(t => t.date.substr(0, 7)).reverse();
    const incomes = months.map(m => transactions.filter(t => t.type === 'income' && t.date.startsWith(m)).reduce((s, t) => s + t.amount, 0));
    const expenses = months.map(m => transactions.filter(t => t.type === 'expense' && t.date.startsWith(m)).reduce((s, t) => s + t.amount, 0));

    if (revenueRef.current) {
      chartsRef.current.push(new Chart(revenueRef.current, {
        type: 'bar',
        data: { labels: months.map(m => new Date(m).toLocaleDateString('en-IN', { month: 'short', year: '2-digit' })), datasets: [{ label: 'Revenue', data: incomes, backgroundColor: 'rgba(22,163,74,.8)', borderRadius: 6 }, { label: 'Expenses', data: expenses, backgroundColor: 'rgba(239,68,68,.6)', borderRadius: 6 }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { color: tc } } }, scales: { x: { ticks: { color: tc }, grid: { color: gc } }, y: { ticks: { color: tc, callback: v => '₹' + (v / 1000) + 'K' }, grid: { color: gc } } } }
      }));
    }

    if (farmStatusRef.current) {
      chartsRef.current.push(new Chart(farmStatusRef.current, {
        type: 'doughnut',
        data: { labels: ['Verified', 'Pending', 'Inactive'], datasets: [{ data: [2, 1, 0], backgroundColor: ['#16a34a', '#f59e0b', '#94a3b8'], borderWidth: 0, hoverOffset: 8 }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { color: tc }, position: 'bottom' } } }
      }));
    }

    const eggDays = productionLogs.slice(-30);
    const eggDates = [...new Set(eggDays.map(l => l.date))].slice(-14);
    const eggVals = eggDates.map(d => eggDays.filter(l => l.date === d).reduce((s, l) => s + l.netEggs, 0));
    if (eggRef.current) {
      chartsRef.current.push(new Chart(eggRef.current, {
        type: 'line',
        data: { labels: eggDates.map(d => d.slice(5)), datasets: [{ data: eggVals, borderColor: '#16a34a', backgroundColor: 'rgba(22,163,74,.1)', fill: true, tension: .4, pointRadius: 3, pointBackgroundColor: '#16a34a' }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { ticks: { color: tc, maxTicksLimit: 7 }, grid: { color: gc } }, y: { ticks: { color: tc }, grid: { color: gc } } } }
      }));
    }

    const roleCounts = users.reduce((acc, u) => { acc[u.role] = (acc[u.role] || 0) + 1; return acc; }, {});
    if (userRef.current) {
      chartsRef.current.push(new Chart(userRef.current, {
        type: 'pie',
        data: { labels: Object.keys(roleCounts), datasets: [{ data: Object.values(roleCounts), backgroundColor: ['#6366f1', '#16a34a', '#f59e0b'], borderWidth: 0 }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { color: tc }, position: 'bottom' } } }
      }));
    }

    return () => { chartsRef.current.forEach(c => c.destroy()); chartsRef.current = []; };
  }, []);

  return (
    <>
      {/* KPI CARDS */}
      <div className="kpi-grid">
        <div className="kpi-card green">
          <div className="kpi-icon-box green">🏭</div>
          <div className="kpi-val"><AnimCounter target={stats.platformFarms} /></div>
          <div className="kpi-label">Total Registered Farms</div>
          <div className="kpi-trend up">↑ 3 new this week</div>
        </div>
        <div className="kpi-card yellow">
          <div className="kpi-icon-box yellow">🥚</div>
          <div className="kpi-val"><AnimCounter target={stats.platformEggsTracked} /></div>
          <div className="kpi-label">Eggs Tracked (Platform)</div>
          <div className="kpi-trend up">↑ 12% vs last month</div>
        </div>
        <div className="kpi-card purple">
          <div className="kpi-icon-box purple">📦</div>
          <div className="kpi-val"><AnimCounter target={stats.platformOrders} /></div>
          <div className="kpi-label">Total Orders Fulfilled</div>
          <div className="kpi-trend up">↑ 8% this quarter</div>
        </div>
        <div className="kpi-card red">
          <div className="kpi-icon-box red">✅</div>
          <div className="kpi-val">1</div>
          <div className="kpi-label">Farms Awaiting Approval</div>
          <div className="kpi-trend down">⚠ Action required</div>
        </div>
      </div>

      {/* CHARTS */}
      <div className="charts-row">
        <div className="chart-card">
          <div className="chart-card-title">Monthly Revenue vs Expenses</div>
          <div className="chart-card-sub">Platform-wide financial performance (Last 12 months)</div>
          <div className="chart-wrap"><canvas ref={revenueRef} /></div>
        </div>
        <div className="chart-card">
          <div className="chart-card-title">Farm Status</div>
          <div className="chart-card-sub">Verified, Pending & Inactive</div>
          <div className="chart-wrap"><canvas ref={farmStatusRef} /></div>
        </div>
      </div>

      {/* TABLES */}
      <div className="tables-row">
        <div className="table-card">
          <div className="table-header"><h3>🏭 Farm Registry</h3><button className="view-all">View All →</button></div>
          <table className="ps-table">
            <thead><tr><th>Farm</th><th>Owner</th><th>Birds</th><th>Status</th></tr></thead>
            <tbody>
              {farms.map(f => (
                <tr key={f.id}>
                  <td><strong>{f.name}</strong><br /><small style={{ color: 'var(--text3)' }}>{f.location}</small></td>
                  <td>{users.find(u => u.id === f.ownerId)?.name || '—'}</td>
                  <td>{f.totalBirds.toLocaleString('en-IN')}</td>
                  <td><span className={`badge ${f.status}`}>{f.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="table-card">
          <div className="table-header"><h3>📦 Recent Orders</h3><button className="view-all">View All →</button></div>
          <table className="ps-table">
            <thead><tr><th>Order</th><th>Product</th><th>Amount</th><th>Status</th></tr></thead>
            <tbody>
              {orders.slice(0, 6).map(o => (
                <tr key={o.id}>
                  <td><strong>{o.id}</strong></td>
                  <td style={{ maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{o.items[0].name}</td>
                  <td>₹{o.totalAmount.toLocaleString('en-IN')}</td>
                  <td><span className={`badge ${o.status}`}>{o.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* BOTTOM ROW */}
      <div className="bottom-row">
        <div className="chart-card">
          <div className="chart-card-title">Egg Production Trend</div>
          <div className="chart-card-sub">Last 30 days</div>
          <div className="chart-wrap-sm"><canvas ref={eggRef} /></div>
        </div>
        <div className="chart-card">
          <div className="chart-card-title">User Distribution</div>
          <div className="chart-card-sub">By role</div>
          <div className="chart-wrap-sm"><canvas ref={userRef} /></div>
        </div>
        <div className="table-card">
          <div className="table-header"><h3>🔔 Notifications</h3><button className="view-all">Mark all read</button></div>
          <div className="notif-list">
            {notifications.map(n => {
              const ago = Math.round((Date.now() - new Date(n.createdAt)) / 3600000);
              return (
                <div key={n.id} className="notif-item">
                  <div className={`notif-dot ${n.isRead ? 'read' : n.type}`} />
                  <div className="notif-body">
                    <strong>{n.title}</strong>
                    <p>{n.message}</p>
                    <div className="notif-time">{ago}h ago</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}

function FarmsView() {
  return (
    <div className="view-section">
      <div className="section-header">
        <h2>Registered Farms</h2>
        <button className="btn-primary">Add New Farm</button>
      </div>
      <div className="table-card full-width">
        <table className="ps-table">
          <thead><tr><th>ID</th><th>Farm Name</th><th>Location</th><th>Owner ID</th><th>Total Birds</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {farms.map(f => (
              <tr key={f.id}>
                <td>{f.id}</td>
                <td><strong>{f.name}</strong></td>
                <td>{f.location}</td>
                <td>{f.ownerId}</td>
                <td>{f.totalBirds.toLocaleString('en-IN')}</td>
                <td><span className={`badge ${f.status}`}>{f.status}</span></td>
                <td>
                  <button className="action-btn">Edit</button>
                  <button className="action-btn danger">Suspend</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function UsersView() {
  return (
    <div className="view-section">
      <div className="section-header">
        <h2>User Management</h2>
        <button className="btn-primary">Invite User</button>
      </div>
      <div className="table-card full-width">
        <table className="ps-table">
          <thead><tr><th>ID</th><th>Name</th><th>Email</th><th>Phone</th><th>Role</th><th>Actions</th></tr></thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id}>
                <td>{u.id}</td>
                <td><strong>{u.name}</strong></td>
                <td>{u.email}</td>
                <td>{u.phone}</td>
                <td><span className={`badge ${u.role}`}>{u.role}</span></td>
                <td>
                  <button className="action-btn">Edit</button>
                  <button className="action-btn danger">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function OrdersView() {
  return (
    <div className="view-section">
      <div className="section-header">
        <h2>All Orders</h2>
        <div className="search-bar-sm">
          <input type="text" placeholder="Search orders..." />
        </div>
      </div>
      <div className="table-card full-width">
        <table className="ps-table">
          <thead><tr><th>Order ID</th><th>Customer ID</th><th>Date</th><th>Amount</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {orders.map(o => (
              <tr key={o.id}>
                <td><strong>{o.id}</strong></td>
                <td>{o.customerId}</td>
                <td>{new Date(o.createdAt).toLocaleDateString('en-IN')}</td>
                <td>₹{o.totalAmount.toLocaleString('en-IN')}</td>
                <td><span className={`badge ${o.status}`}>{o.status}</span></td>
                <td>
                  <button className="action-btn">View Details</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function FinancialsView() {
  const inc = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const exp = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  
  return (
    <div className="view-section">
      <div className="section-header">
        <h2>Financials</h2>
        <button className="btn-primary">Generate Report</button>
      </div>
      <div className="kpi-grid" style={{ marginBottom: '20px' }}>
        <div className="kpi-card green">
          <div className="kpi-icon-box green">💰</div>
          <div className="kpi-val">₹{(inc / 1000).toFixed(1)}k</div>
          <div className="kpi-label">Total Income</div>
        </div>
        <div className="kpi-card red">
          <div className="kpi-icon-box red">💸</div>
          <div className="kpi-val">₹{(exp / 1000).toFixed(1)}k</div>
          <div className="kpi-label">Total Expenses</div>
        </div>
        <div className="kpi-card purple">
          <div className="kpi-icon-box purple">📈</div>
          <div className="kpi-val">₹{((inc - exp) / 1000).toFixed(1)}k</div>
          <div className="kpi-label">Net Profit</div>
        </div>
      </div>
      <div className="table-card full-width">
        <table className="ps-table">
          <thead><tr><th>Date</th><th>Type</th><th>Category</th><th>Amount</th><th>Farm ID</th></tr></thead>
          <tbody>
            {transactions.slice(0, 15).map(t => (
              <tr key={t.id}>
                <td>{new Date(t.date).toLocaleDateString('en-IN')}</td>
                <td><span className={`badge ${t.type === 'income' ? 'verified' : 'disputed'}`}>{t.type}</span></td>
                <td><strong>{t.category}</strong></td>
                <td style={{ color: t.type === 'income' ? '#16a34a' : '#ef4444', fontWeight: 'bold' }}>
                  {t.type === 'income' ? '+' : '-'}₹{t.amount.toLocaleString('en-IN')}
                </td>
                <td>{t.farmId}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ProductionView() {
  return (
    <div className="view-section">
      <div className="section-header">
        <h2>Platform Egg Production</h2>
        <button className="btn-primary">Export Data</button>
      </div>
      <div className="table-card full-width">
        <table className="ps-table">
          <thead><tr><th>Date</th><th>Farm ID</th><th>Flock ID</th><th>Total Eggs</th><th>Broken</th><th>Net Eggs</th></tr></thead>
          <tbody>
            {productionLogs.slice(0, 15).map(l => (
              <tr key={l.id}>
                <td>{new Date(l.date).toLocaleDateString('en-IN')}</td>
                <td><strong>{l.farmId}</strong></td>
                <td>{l.flockId}</td>
                <td>{l.totalEggs.toLocaleString('en-IN')}</td>
                <td><span style={{ color: '#ef4444' }}>{l.brokenEggs}</span></td>
                <td><strong>{l.netEggs.toLocaleString('en-IN')}</strong></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function HealthAlertsView() {
  return (
    <div className="view-section">
      <div className="section-header">
        <h2>Health & Mortality Logs</h2>
      </div>
      <div className="table-card full-width">
        <table className="ps-table">
          <thead><tr><th>Date</th><th>Farm ID</th><th>Flock ID</th><th>Mortality</th><th>Cause</th><th>Notes</th></tr></thead>
          <tbody>
            {healthLogs.map(l => (
              <tr key={l.id}>
                <td>{new Date(l.date).toLocaleDateString('en-IN')}</td>
                <td><strong>{l.farmId}</strong></td>
                <td>{l.flockId}</td>
                <td style={{ color: l.mortality > 5 ? '#ef4444' : 'inherit', fontWeight: 'bold' }}>{l.mortality} birds</td>
                <td><span className={`badge ${l.cause === 'Disease' ? 'disputed' : 'pending'}`}>{l.cause}</span></td>
                <td>{l.notes || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function NotificationsView() {
  return (
    <div className="view-section">
      <div className="section-header">
        <h2>Notifications & System Alerts</h2>
        <button className="btn-primary">Mark All as Read</button>
      </div>
      <div className="table-card full-width" style={{ padding: '0' }}>
        <div className="notif-list" style={{ padding: '0 22px' }}>
          {notifications.map(n => {
            const ago = Math.round((Date.now() - new Date(n.createdAt)) / 3600000);
            return (
              <div key={n.id} className="notif-item">
                <div className={`notif-dot ${n.isRead ? 'read' : n.type}`} />
                <div className="notif-body">
                  <strong>{n.title}</strong>
                  <p>{n.message}</p>
                  <div className="notif-time">{ago > 0 ? `${ago}h ago` : 'Just now'}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function SettingsView() {
  return (
    <div className="view-section">
      <div className="section-header">
        <h2>Platform Settings</h2>
      </div>
      <div className="charts-row">
        <div className="chart-card">
          <h3 style={{ marginBottom: '16px' }}>General Settings</h3>
          <div style={{ display: 'grid', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--text3)', marginBottom: '4px' }}>Platform Name</label>
              <input type="text" defaultValue="PoultrySmart" style={{ width: '100%', padding: '10px', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--text3)', marginBottom: '4px' }}>Admin Email</label>
              <input type="email" defaultValue="admin@poultry.com" style={{ width: '100%', padding: '10px', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)' }} />
            </div>
            <button className="btn-primary" style={{ width: 'fit-content' }}>Save Changes</button>
          </div>
        </div>
        <div className="chart-card">
          <h3 style={{ marginBottom: '16px' }}>Fee Structure</h3>
          <div style={{ display: 'grid', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--text3)', marginBottom: '4px' }}>Platform Fee (%)</label>
              <input type="number" defaultValue="2" style={{ width: '100%', padding: '10px', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)' }} />
            </div>
            <button className="btn-primary" style={{ width: 'fit-content' }}>Update Fees</button>
          </div>
        </div>
      </div>
    </div>
  );
}
