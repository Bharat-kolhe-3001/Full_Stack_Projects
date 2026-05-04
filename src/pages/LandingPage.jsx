import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import './LandingPage.css';

const testimonials = [
  { text: '"PoultrySmart ने माझ्या शेतीत क्रांती केली. आता मी माझ्या अंड्यांचे उत्पन्न रोज tracking करतो आणि थेट ग्राहकांना विकतो."', author: 'Ravi Kumar', role: 'Nashik Farm — 5,000 birds', initials: 'RK' },
  { text: '"The financial tracking feature saved me hours every month. I can now see my profits and losses clearly and make better decisions."', author: 'Sunita Devi', role: 'Amravati Poultry Hub — 3,200 birds', initials: 'SD' },
  { text: '"Vaccination reminders and health alerts have reduced my flock mortality by 40%. This app pays for itself in one week!"', author: 'Mohammed Ali', role: 'Aurangabad Agro Farm — 8,000 birds', initials: 'MA' },
];

const features = [
  { icon: '📊', title: 'Live Dashboard', desc: 'Real-time egg counts, bird health alerts, mortality tracking, and financial summaries — all visible at a glance.', list: ['Daily egg production logs', 'Mortality & health alerts', 'Animated counter stats'], bg: 'linear-gradient(135deg,#fbbf24,#f59e0b)' },
  { icon: '💰', title: 'Financial Tracking', desc: 'Record income, expenses, and auto-calculate profit/loss. Generate reports in seconds for any time period.', list: ['Income vs expense charts', 'Monthly P&L report', 'Category-wise breakdown'], bg: 'linear-gradient(135deg,#34d399,#10b981)' },
  { icon: '🛒', title: 'Direct Sales', desc: 'List your eggs and poultry products. Customers order directly — no middlemen, better prices for farmers.', list: ['Product listings', 'Order management', 'UPI & COD payments'], bg: 'linear-gradient(135deg,#818cf8,#6366f1)' },
  { icon: '🏥', title: 'Health Management', desc: 'Track vaccinations, medication schedules, and get automated alerts when health actions are due.', list: ['Vaccination reminders', 'Vet visit logs', 'Disease outbreak alerts'], bg: 'linear-gradient(135deg,#f87171,#ef4444)' },
  { icon: '🌐', title: 'Bilingual Interface', desc: 'Switch seamlessly between English, Hindi, and Marathi. Designed for Indian farmers first.', list: ['English / हिंदी / मराठी', 'Farmer-friendly UI', 'Large tap targets'], bg: 'linear-gradient(135deg,#38bdf8,#0ea5e9)' },
  { icon: '📱', title: 'Mobile First', desc: 'Works perfectly on any smartphone. No app install needed — just open the browser and start managing.', list: ['Fully responsive', 'Offline data storage', 'Works on 4G/2G'], bg: 'linear-gradient(135deg,#fb923c,#f97316)' },
];

function useCountUp(target, duration = 1800) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        let start = 0;
        const t0 = performance.now();
        const tick = (now) => {
          const p = Math.min((now - t0) / duration, 1);
          const v = Math.round(target * (1 - Math.pow(1 - p, 3)));
          setCount(v);
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
        observer.disconnect();
      }
    }, { threshold: 0.3 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration]);
  return [count, ref];
}

function StatItem({ target, label, prefix = '', suffix = '' }) {
  const [count, ref] = useCountUp(target);
  const fmt = (n) => {
    if (n >= 10000000) return (n / 10000000).toFixed(1) + ' Cr';
    if (n >= 100000) return (n / 100000).toFixed(1) + ' L';
    if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
    return n.toLocaleString('en-IN');
  };
  return (
    <div className="stat-item" ref={ref}>
      <span className="stat-num">{prefix}{fmt(count)}{suffix}</span>
      <span className="stat-desc">{label}</span>
    </div>
  );
}

export default function LandingPage() {
  const { darkMode, setDarkMode } = useApp();
  const [menuOpen, setMenuOpen] = useState(false);
  const [slide, setSlide] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setSlide(s => (s + 1) % testimonials.length), 4000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (menuOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMenuOpen(false);
  };

  return (
    <div className="landing">
      {/* NAVBAR */}
      <nav className="lp-nav" id="navbar">
        <div className="nav-inner">
          <Link to="/" className="nav-brand">
            <span className="brand-icon">🐔</span>
            <span className="brand-name">PoultrySmart</span>
          </Link>
          <ul className="nav-links">
            <li><button onClick={() => scrollTo('features')}>Features</button></li>
            <li><button onClick={() => scrollTo('how-it-works')}>How It Works</button></li>
            <li><button onClick={() => scrollTo('testimonials')}>Testimonials</button></li>
            <li><button onClick={() => scrollTo('stats')}>Impact</button></li>
          </ul>
          <div className="nav-actions">
            <button className="icon-btn" onClick={() => setDarkMode(d => !d)} aria-label="Toggle dark mode">
              {darkMode ? '☀️' : '🌙'}
            </button>
            <Link to="/login" className="btn-outline">Sign In</Link>
            <Link to="/login" className="btn-primary btn-ripple">Get Started Free</Link>
          </div>
          <button className={`hamburger ${menuOpen ? 'open' : ''}`} onClick={() => setMenuOpen(o => !o)} aria-label="Open menu">
            <span /><span /><span />
          </button>
        </div>
      </nav>

      {/* MOBILE NAV */}
      <div className={`mobile-nav ${menuOpen ? 'open' : ''}`}>
        <button className="mobile-close" onClick={() => setMenuOpen(false)}>✕</button>
        <ul>
          <li><button onClick={() => scrollTo('features')}>Features</button></li>
          <li><button onClick={() => scrollTo('how-it-works')}>How It Works</button></li>
          <li><button onClick={() => scrollTo('testimonials')}>Testimonials</button></li>
          <li><Link to="/login" className="btn-primary" onClick={() => setMenuOpen(false)}>Get Started</Link></li>
        </ul>
      </div>
      {menuOpen && <div className="mobile-overlay" onClick={() => setMenuOpen(false)} />}

      {/* HERO */}
      <section className="hero-wrap" id="home">
        <div className="hero-bg" />
        <div className="hero-overlay" />
        <div className="hero-particles">
          {Array.from({ length: 25 }).map((_, i) => (
            <div key={i} className="particle" style={{
              left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`,
              width: `${3 + Math.random() * 6}px`, height: `${3 + Math.random() * 6}px`,
              animationDelay: `${Math.random() * 8}s`, animationDuration: `${6 + Math.random() * 8}s`
            }} />
          ))}
        </div>
        <div className="hero-content">
          <div className="hero-badge">🏆 Trusted by 12,400+ Farms Across India</div>
          <h1 className="hero-title">Smarter Farms.<br /><span className="gradient-text">Better Profits.</span></h1>
          <p className="hero-subtitle">
            The all-in-one platform to manage your flock, track egg production, record finances, and sell directly to customers — in English, Hindi & Marathi.
          </p>
          <div className="hero-cta">
            <Link to="/login" className="btn-hero btn-ripple">🚀 Start Managing Free</Link>
            <button className="btn-hero-ghost" onClick={() => scrollTo('features')}>See How It Works ↓</button>
          </div>
          <div className="hero-roles">
            <span>Login as:</span>
            <Link to="/login?role=farmer" className="role-chip">🌾 Farmer</Link>
            <Link to="/login?role=customer" className="role-chip">🛒 Customer</Link>
          </div>
        </div>
        <div className="hero-mockup">
          <div className="mockup-card">
            <div className="mockup-header">
              <div className="mockup-dots"><span /><span /><span /></div>
              <span className="mockup-title">Ravi's Green Farm — Live Dashboard</span>
            </div>
            <div className="mockup-stats">
              <div className="mockup-stat"><span className="mstat-icon">🥚</span><span className="mstat-val">4,280</span><span className="mstat-label">Eggs Today</span></div>
              <div className="mockup-stat"><span className="mstat-icon">🐔</span><span className="mstat-val">4,948</span><span className="mstat-label">Live Birds</span></div>
              <div className="mockup-stat green"><span className="mstat-icon">💰</span><span className="mstat-val">₹91K</span><span className="mstat-label">This Month</span></div>
            </div>
            <div className="mockup-chart">
              <svg viewBox="0 0 260 80" fill="none">
                <polyline points="0,70 30,55 60,62 90,40 120,45 150,28 180,32 210,18 240,22 260,10" stroke="url(#cg)" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                <defs><linearGradient id="cg" x1="0" y1="0" x2="260" y2="0"><stop offset="0%" stopColor="#22c55e" /><stop offset="100%" stopColor="#16a34a" /></linearGradient></defs>
              </svg>
              <span className="chart-label">📈 Egg production trending up 12% this week</span>
            </div>
          </div>
        </div>
        <div className="scroll-indicator"><div className="scroll-arrow" /></div>
      </section>

      {/* STATS */}
      <section className="stats-section" id="stats">
        <div className="container">
          <div className="stats-grid">
            <StatItem target={48200000} label="Eggs Tracked Platform-wide" />
            <StatItem target={12400} label="Verified Farms Registered" suffix="+ Farms" />
            <StatItem target={3100000} label="Orders Fulfilled" suffix="+ Orders" />
            <StatItem target={24} label="Farmer Income Generated" prefix="₹" suffix="Cr+ Revenue" />
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="features-section" id="features">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Why PoultrySmart?</span>
            <h2 className="section-title">Everything Your Farm Needs</h2>
            <p className="section-sub">From flock management to direct customer sales — all in one powerful, easy-to-use platform.</p>
          </div>
          <div className="features-grid">
            {features.map((f, i) => (
              <div key={i} className="feature-card">
                <div className="feat-icon" style={{ background: f.bg }}>{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
                <ul className="feat-list">{f.list.map((item, j) => <li key={j}>✓ {item}</li>)}</ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="how-section" id="how-it-works">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Simple Process</span>
            <h2 className="section-title">Up & Running in 3 Steps</h2>
          </div>
          <div className="steps-grid">
            <div className="step-item">
              <div className="step-num">01</div>
              <div className="step-icon">📝</div>
              <h3>Register Your Farm</h3>
              <p>Sign up as a farmer, add your farm details, and get verified by our team within 24 hours.</p>
            </div>
            <div className="step-connector" />
            <div className="step-item">
              <div className="step-num">02</div>
              <div className="step-icon">📊</div>
              <h3>Record & Track</h3>
              <p>Log daily egg production, feed costs, bird health, and transactions right from your phone.</p>
            </div>
            <div className="step-connector" />
            <div className="step-item">
              <div className="step-num">03</div>
              <div className="step-icon">💸</div>
              <h3>Sell & Earn More</h3>
              <p>List your products, receive orders directly, and get paid — no commission, no middlemen.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ROLE CARDS */}
      <section className="roles-section">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">For Everyone</span>
            <h2 className="section-title">Your Role, Your Dashboard</h2>
          </div>
          <div className="roles-grid">

            <div className="role-card farmer-card">
              <div className="role-icon">🌾</div>
              <h3>Farmer</h3>
              <p>Track your flocks, record production, manage finances, and list products for sale.</p>
              <Link to="/login?role=farmer" className="role-btn">Farmer Login →</Link>
              <div className="role-cred">ravi@farm.in / farmer123</div>
            </div>
            <div className="role-card customer-card">
              <div className="role-icon">🛒</div>
              <h3>Customer</h3>
              <p>Browse fresh eggs and poultry from verified farms near you. Order online, pay easily.</p>
              <Link to="/login?role=customer" className="role-btn">Shop Now →</Link>
              <div className="role-cred">priya@gmail.com / customer123</div>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="testimonials-section" id="testimonials">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Real Stories</span>
            <h2 className="section-title">Farmers Love PoultrySmart</h2>
          </div>
          <div className="testimonial-carousel">
            <div className="carousel-track" style={{ transform: `translateX(-${slide * 100}%)` }}>
              {testimonials.map((t, i) => (
                <div key={i} className="testimonial-slide">
                  <div className="testi-card">
                    <div className="testi-stars">★★★★★</div>
                    <p>{t.text}</p>
                    <div className="testi-author">
                      <div className="testi-avatar">{t.initials}</div>
                      <div><strong>{t.author}</strong><span>{t.role}</span></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="carousel-controls">
              <button className="carousel-btn" onClick={() => setSlide(s => (s - 1 + testimonials.length) % testimonials.length)}>←</button>
              <div className="carousel-dots">
                {testimonials.map((_, i) => <span key={i} className={`carousel-dot ${i === slide ? 'active' : ''}`} onClick={() => setSlide(i)} />)}
              </div>
              <button className="carousel-btn" onClick={() => setSlide(s => (s + 1) % testimonials.length)}>→</button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-card">
            <h2>Ready to Transform Your Farm?</h2>
            <p>Join 12,400+ farmers already using PoultrySmart. Free forever for basic plan.</p>
            <div className="cta-btns">
              <Link to="/login?role=farmer" className="btn-hero btn-ripple">🌾 Register as Farmer</Link>
              <Link to="/login?role=customer" className="btn-hero-ghost">🛒 Browse Products</Link>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="site-footer">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-brand">
              <div className="nav-brand"><span className="brand-icon">🐔</span><span className="brand-name">PoultrySmart</span></div>
              <p>India's most trusted poultry farm management and marketplace platform.</p>
            </div>
            <div className="footer-col">
              <h4>Platform</h4>
              <ul>
                <li><Link to="/login?role=farmer">For Farmers</Link></li>
                <li><Link to="/login?role=customer">For Customers</Link></li>

              </ul>
            </div>
            <div className="footer-col">
              <h4>Resources</h4>
              <ul>
                <li><a href="#">Poultry Guides</a></li>
                <li><a href="#">Market Prices</a></li>
                <li><a href="#">Disease Library</a></li>
              </ul>
            </div>
            <div className="footer-col">
              <h4>Contact</h4>
              <ul>
                <li>📞 1800-XXX-XXXX (Toll Free)</li>
                <li>📧 support@poultrysmart.in</li>
                <li>🕐 Mon–Sat 9am–6pm</li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <p>© 2026 PoultrySmart. Made with ❤️ for Indian Farmers.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
