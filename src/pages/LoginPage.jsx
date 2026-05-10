import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import './LoginPage.css';

const roleConfig = {
  farmer: {
    label: 'Farmer Portal',
    email: '',
    pass: '',
    desc: 'Flock, eggs & finance tracking',
    color: '#f59e0b',
    bg: 'rgba(245,158,11,0.12)',
  },
  customer: {
    label: 'Customer Portal',
    email: '',
    pass: '',
    desc: 'Browse & order fresh produce',
    color: '#60a5fa',
    bg: 'rgba(96,165,250,0.12)',
  },
};

const FarmIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

const CartIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
  </svg>
);

const MailIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2" /><path d="M2 8l10 6 10-6" />
  </svg>
);

const LockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const UserIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
  </svg>
);

const PhoneIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="5" y="2" width="14" height="20" rx="2" /><line x1="12" y1="18" x2="12.01" y2="18" />
  </svg>
);

const EyeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const ArrowIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
  </svg>
);

const ShieldIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

export default function LoginPage() {
  const { login, register, currentUser } = useApp();
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const initRole = roleConfig[params.get('role')] ? params.get('role') : 'farmer';
  const [role, setRole] = useState(initRole);
  const [tab, setTab] = useState('login');
  
  const [email, setEmail] = useState(roleConfig[initRole].email);
  const [password, setPassword] = useState(roleConfig[initRole].pass);
  
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setTimeout(() => setMounted(true), 50);
  }, []);

  useEffect(() => {
    if (currentUser) {
      const map = { admin: '/dashboard/admin', farmer: '/dashboard/farmer', customer: '/dashboard/customer' };
      navigate(map[currentUser.role] || '/');
    }
  }, [currentUser, navigate]);

  const handleRoleChange = (newRole) => {
    setRole(newRole);
    setEmail(roleConfig[newRole].email);
    setPassword(roleConfig[newRole].pass);
    setError('');
  };

  const handleLogin = () => {
    setLoading(true);
    setError('');
    setTimeout(async () => {
      const result = await login(email, password);
      if (result.success) {
        setSuccess(true);
        setTimeout(() => {
          const map = { admin: '/dashboard/admin', farmer: '/dashboard/farmer', customer: '/dashboard/customer' };
          navigate(map[result.user.role] || '/');
        }, 800);
      } else {
        setError(result.message || 'Invalid credentials.');
        setLoading(false);
      }
    }, 1000);
  };

  const handleRegister = () => {
    if (!firstName || !lastName || !regEmail || !regPhone || !regPassword) {
      setError('Please fill all fields');
      return;
    }
    setLoading(true);
    setError('');
    
    setTimeout(async () => {
      const userData = {
        name: `${firstName} ${lastName}`,
        email: regEmail,
        phone: regPhone,
        password: regPassword,
        role: role
      };
      
      const result = await register(userData);
      if (result.success) {
        setSuccess(true);
        setTimeout(() => {
          const map = { admin: '/dashboard/admin', farmer: '/dashboard/farmer', customer: '/dashboard/customer' };
          navigate(map[result.user.role] || '/');
        }, 800);
      } else {
        setError(result.message || 'Registration failed.');
        setLoading(false);
      }
    }, 1000);
  };

  const switchTab = (newTab) => {
    setTab(newTab);
    setError('');
    setSuccess(false);
  };

  const cfg = roleConfig[role];

  return (
    <div className={`lp-page ${mounted ? 'lp-mounted' : ''}`}>
      {/* LEFT PANEL */}
      <div className="lp-left">
        <div className="lp-left-glow lp-left-glow-1" />
        <div className="lp-left-glow lp-left-glow-2" />
        <div className="lp-left-inner">
          <div className="lp-brand">
            <div className="lp-brand-logo">
              <svg viewBox="0 0 32 32" fill="none">
                <path d="M16 4C11 4 7 7.5 7 12c0 2.5 1.2 4.5 3 6L8 28h16l-2-10c1.8-1.5 3-3.5 3-6 0-4.5-4-8-9-8z" fill="#22c55e" opacity="0.9"/>
                <path d="M12 11.5c0-2.2 1.8-4 4-4s4 1.8 4 4" stroke="#86efac" strokeWidth="1.5" strokeLinecap="round"/>
                <circle cx="16" cy="11.5" r="1.5" fill="#bbf7d0"/>
              </svg>
            </div>
            <h1 className="lp-brand-name">PoultrySmart</h1>
            <p className="lp-brand-tagline">India's #1 Poultry Farm<br />Management Platform</p>
          </div>

          <div className="lp-role-label">Select your portal</div>
          <div className="lp-roles">
            {Object.entries(roleConfig).map(([key, c]) => (
              <button
                key={key}
                className={`lp-role-btn ${role === key ? 'active' : ''}`}
                onClick={() => handleRoleChange(key)}
                style={{ '--role-color': c.color, '--role-bg': c.bg }}
              >
                <div className="lp-role-icon">
                  {key === 'farmer' ? <FarmIcon /> : <CartIcon />}
                </div>
                <div className="lp-role-info">
                  <strong>{key.charAt(0).toUpperCase() + key.slice(1)}</strong>
                  <span>{c.desc}</span>
                </div>
                <div className={`lp-role-tick ${role === key ? 'show' : ''}`}>
                  <CheckIcon />
                </div>
              </button>
            ))}
          </div>

          <div className="lp-stats">
            {[['2.4k', 'Active Farms'], ['18k', 'Daily Orders'], ['98%', 'Uptime']].map(([n, l]) => (
              <div className="lp-stat" key={l}>
                <span className="lp-stat-num">{n}</span>
                <span className="lp-stat-lbl">{l}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="lp-right">
        <div className="lp-right-inner">
          <div className="lp-tabs">
            <button className={`lp-tab ${tab === 'login' ? 'active' : ''}`} onClick={() => switchTab('login')}>Sign In</button>
            <button className={`lp-tab ${tab === 'register' ? 'active' : ''}`} onClick={() => switchTab('register')}>Register</button>
            <div className="lp-tab-slider" style={{ transform: `translateX(${tab === 'login' ? '0%' : '100%'})` }} />
          </div>

          {tab === 'login' ? (
            <div className="lp-form-section lp-fade-in" key="login">
              <div className="lp-form-head">
                <div className="lp-portal-badge" style={{ color: cfg.color, background: cfg.bg }}>
                  {cfg.label}
                </div>
                <h2 className="lp-form-title">Welcome back 👋</h2>
                <p className="lp-form-sub">Sign in to access your dashboard</p>
              </div>

              <div className="lp-demo-box">
                <span className="lp-demo-dot" />
                <span>Use your registered account credentials</span>
              </div>

              {error && (
                <div className="lp-error">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  <span>{error}</span>
                </div>
              )}

              <div className="lp-field">
                <label>Email Address</label>
                <div className="lp-input-wrap">
                  <span className="lp-input-icon"><MailIcon /></span>
                  <input
                    className="lp-input"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="lp-field">
                <label>Password</label>
                <div className="lp-input-wrap">
                  <span className="lp-input-icon"><LockIcon /></span>
                  <input
                    className="lp-input lp-input-pass"
                    type={showPass ? 'text' : 'password'}
                    placeholder="Your password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleLogin()}
                  />
                  <button className="lp-eye-btn" onClick={() => setShowPass(s => !s)} type="button">
                    {showPass ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
              </div>

              <button
                className={`lp-submit-btn ${loading ? 'loading' : ''} ${success ? 'success' : ''}`}
                onClick={handleLogin}
                disabled={loading || success}
              >
                {success ? (
                  <><span className="lp-btn-icon"><CheckIcon /></span><span>Signed In!</span></>
                ) : loading ? (
                  <><span className="lp-spinner" /><span>Signing in…</span></>
                ) : (
                  <><span>Sign In</span><span className="lp-btn-arrow"><ArrowIcon /></span></>
                )}
              </button>
            </div>
          ) : (
            <div className="lp-form-section lp-fade-in" key="register">
              <div className="lp-form-head">
                <div className="lp-portal-badge" style={{ color: '#22c55e', background: 'rgba(34,197,94,0.1)' }}>
                  New Account
                </div>
                <h2 className="lp-form-title">Join PoultrySmart 🚀</h2>
                <p className="lp-form-sub">Register your farm or account today</p>
              </div>

              {error && (
                <div className="lp-error">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  <span>{error}</span>
                </div>
              )}

              <div className="lp-field-row">
                <div className="lp-field">
                  <label>First Name</label>
                  <div className="lp-input-wrap">
                    <span className="lp-input-icon"><UserIcon /></span>
                    <input className="lp-input" type="text" placeholder="Ravi" value={firstName} onChange={e => setFirstName(e.target.value)} />
                  </div>
                </div>
                <div className="lp-field">
                  <label>Last Name</label>
                  <div className="lp-input-wrap">
                    <span className="lp-input-icon"><UserIcon /></span>
                    <input className="lp-input" type="text" placeholder="Kumar" value={lastName} onChange={e => setLastName(e.target.value)} />
                  </div>
                </div>
              </div>

              <div className="lp-field">
                <label>Email Address</label>
                <div className="lp-input-wrap">
                  <span className="lp-input-icon"><MailIcon /></span>
                  <input className="lp-input" type="email" placeholder="your@email.com" value={regEmail} onChange={e => setRegEmail(e.target.value)} />
                </div>
              </div>

              <div className="lp-field">
                <label>Mobile Number</label>
                <div className="lp-input-wrap">
                  <span className="lp-input-icon"><PhoneIcon /></span>
                  <input className="lp-input" type="tel" placeholder="9876543210" value={regPhone} onChange={e => setRegPhone(e.target.value)} />
                </div>
              </div>

              <div className="lp-field">
                <label>Password</label>
                <div className="lp-input-wrap">
                  <span className="lp-input-icon"><LockIcon /></span>
                  <input className="lp-input" type={showPass ? 'text' : 'password'} placeholder="Create a strong password" value={regPassword} onChange={e => setRegPassword(e.target.value)} />
                  <button className="lp-eye-btn" onClick={() => setShowPass(s => !s)} type="button">
                    {showPass ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
              </div>

              <button
                className={`lp-submit-btn ${loading ? 'loading' : ''} ${success ? 'success' : ''}`}
                onClick={handleRegister}
                disabled={loading || success}
              >
                {success ? (
                  <><span className="lp-btn-icon"><CheckIcon /></span><span>Account Created!</span></>
                ) : loading ? (
                  <><span className="lp-spinner" /><span>Creating…</span></>
                ) : (
                  <><span>Create Account</span><span className="lp-btn-arrow"><ArrowIcon /></span></>
                )}
              </button>
            </div>
          )}

          <div className="lp-footer">
            <span className="lp-footer-secure">
              <ShieldIcon />
              Secure · PoultrySmart Auth
            </span>
            <Link to="/" className="lp-back-link">← Back to Home</Link>
          </div>
        </div>
      </div>
    </div>
  );
}