import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import './LoginPage.css';

const roleConfig = {
  farmer:   { label: 'Farmer Portal',   email: 'ravi@farm.in',          pass: 'farmer123',   emoji: '🌾', desc: 'Flock, eggs & finance tracking' },
  customer: { label: 'Customer Portal', email: 'priya@gmail.com',       pass: 'customer123', emoji: '🛒', desc: 'Browse & order fresh produce' },
};

export default function LoginPage() {
  const { login, currentUser } = useApp();
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const [role, setRole] = useState(roleConfig[params.get('role')] ? params.get('role') : 'farmer');
  const [tab, setTab] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkModeLocal] = useState(() => document.documentElement.getAttribute('data-theme') === 'dark');

  useEffect(() => {
    if (currentUser) {
      const map = { admin: '/dashboard/admin', farmer: '/dashboard/farmer', customer: '/dashboard/customer' };
      navigate(map[currentUser.role] || '/');
    }
  }, [currentUser, navigate]);

  useEffect(() => {
    const cfg = roleConfig[role];
    setEmail(cfg.email);
    setPassword(cfg.pass);
    setError('');
  }, [role]);

  const handleLogin = () => {
    setLoading(true);
    setError('');
    setTimeout(() => {
      const result = login(email, password);
      if (result.success) {
        const map = { admin: '/dashboard/admin', farmer: '/dashboard/farmer', customer: '/dashboard/customer' };
        navigate(map[result.user.role] || '/');
      } else {
        setError('Invalid email or password. Please check the demo credentials.');
        setLoading(false);
      }
    }, 900);
  };

  const toggleDark = () => {
    const next = darkMode ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    setDarkModeLocal(!darkMode);
  };

  return (
    <div className="login-page">
      {/* LEFT PANEL */}
      <div className="left-panel">
        <div className="left-brand">
          <span className="logo">🐔</span>
          <h1>PoultrySmart</h1>
          <p>India's #1 Poultry Farm<br />Management Platform</p>
        </div>
        <div className="role-selector">
          {Object.entries(roleConfig).map(([key, cfg]) => (
            <button key={key} className={`role-btn ${role === key ? 'active' : ''}`} onClick={() => setRole(key)}>
              <span className="role-emoji">{cfg.emoji}</span>
              <div className="role-info">
                <strong>{key.charAt(0).toUpperCase() + key.slice(1)}</strong>
                <span>{cfg.desc}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="right-panel">
        <button className="dark-toggle" onClick={toggleDark}>{darkMode ? '☀️' : '🌙'}</button>
        <div className="login-form-wrap">
          <div className="tab-switcher">
            <button className={`tab-btn ${tab === 'login' ? 'active' : ''}`} onClick={() => setTab('login')}>Sign In</button>
            <button className={`tab-btn ${tab === 'register' ? 'active' : ''}`} onClick={() => setTab('register')}>Register</button>
          </div>

          {tab === 'login' ? (
            <div className="login-section">
              <div className="form-greeting">{roleConfig[role].label}</div>
              <h2 className="form-title">Welcome back 👋</h2>
              <p className="form-sub">Sign in to access your dashboard</p>
              <div className="demo-cred">
                💡 Demo: <strong>{roleConfig[role].email}</strong> / <strong>{roleConfig[role].pass}</strong>
              </div>
              {error && <div className="form-error show">❌ <span>{error}</span></div>}
              <div className="form-group">
                <label>Email Address</label>
                <div className="input-with-icon">
                  <span className="input-icon">📧</span>
                  <input type="email" className="form-control" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} />
                </div>
              </div>
              <div className="form-group">
                <label>Password</label>
                <div className="input-with-icon">
                  <span className="input-icon">🔒</span>
                  <input type={showPass ? 'text' : 'password'} className="form-control" placeholder="Your password" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin()} />
                  <button className="pass-toggle" onClick={() => setShowPass(s => !s)} type="button">{showPass ? '🙈' : '👁'}</button>
                </div>
              </div>
              <button className={`btn-login ${loading ? 'loading' : ''}`} onClick={handleLogin} disabled={loading}>
                {loading ? 'Signing in…' : 'Sign In →'}
              </button>
            </div>
          ) : (
            <div className="register-section">
              <div className="form-greeting">Create Account</div>
              <h2 className="form-title">Join PoultrySmart 🚀</h2>
              <p className="form-sub">Register your farm or account today</p>
              <div className="form-group">
                <label>Full Name</label>
                <div className="input-with-icon"><span className="input-icon">👤</span><input type="text" className="form-control" placeholder="Your full name" /></div>
              </div>
              <div className="form-group">
                <label>Email Address</label>
                <div className="input-with-icon"><span className="input-icon">📧</span><input type="email" className="form-control" placeholder="your@email.com" /></div>
              </div>
              <div className="form-group">
                <label>Mobile Number</label>
                <div className="input-with-icon"><span className="input-icon">📱</span><input type="tel" className="form-control" placeholder="9876543210" /></div>
              </div>
              <div className="form-group">
                <label>Password</label>
                <div className="input-with-icon"><span className="input-icon">🔒</span><input type="password" className="form-control" placeholder="Create a password" /></div>
              </div>
              <button className="btn-login" onClick={() => alert('Registration coming soon! Use demo credentials to explore.')}>Create Account →</button>
            </div>
          )}

          <div className="form-footer">
            <p>🔐 Secure login powered by PoultrySmart Auth</p>
            <Link to="/" className="back-home">← Back to Home</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
