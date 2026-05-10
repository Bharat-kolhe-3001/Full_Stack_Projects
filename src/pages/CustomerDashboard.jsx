import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import './CustomerDashboard.css';
import { apiUrl } from '../config/api';
import { toast, OrderSuccessModal } from '../components/Toast';

const navItems = [
  { icon: '🛒', label: 'Shop' },
  { icon: '📦', label: 'My Orders' },
  { icon: '❤️', label: 'Wishlist' },
  { icon: '👤', label: 'Profile' },
];

const ORDER_STEPS = ['confirmed', 'dispatched', 'delivered'];

export default function CustomerDashboard() {
  const {
    currentUser, logout, darkMode, setDarkMode,
    cart, addToCart, removeFromCart, changeQty, clearCart, cartTotal,
    wishlist, addToWishlist, removeFromWishlist, isInWishlist,
  } = useApp();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [activeFilter, setActiveFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [cartOpen, setCartOpen] = useState(false);
  const [addedItems, setAddedItems] = useState({});
  const [wishedItems, setWishedItems] = useState({});
  const [productsData, setProductsData] = useState([]);
  const [ordersData, setOrdersData] = useState([]);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [successOrder, setSuccessOrder] = useState(null);

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'customer') navigate('/login');
  }, [currentUser, navigate]);

  useEffect(() => {
    if (!currentUser?.id) return;
    const fetchData = async () => {
      try {
        const [productsRes, ordersRes] = await Promise.all([
          fetch(apiUrl('/api/data/products?active=true')),
          fetch(apiUrl(`/api/data/orders?customerId=${currentUser.id}`)),
        ]);
        if (productsRes.ok) setProductsData(await productsRes.json());
        if (ordersRes.ok) setOrdersData(await ordersRes.json());
      } catch (err) {
        console.error('Failed to load customer dashboard data', err);
      }
    };
    fetchData();
  }, [currentUser?.id]);

  if (!currentUser || currentUser.role !== 'customer') return null;

  const firstName = currentUser.name.split(' ')[0];
  const myOrders = ordersData.filter(o => o.customerId === currentUser.id);

  let filteredProducts = productsData.filter(p => p.isActive);
  if (activeFilter !== 'all') {
    if (activeFilter === 'fresh') filteredProducts = filteredProducts.filter(p => p.isFreshToday);
    else filteredProducts = filteredProducts.filter(p => p.type === activeFilter);
  }
  if (search) filteredProducts = filteredProducts.filter(p =>
    p.name.toLowerCase().includes(search) || p.description.toLowerCase().includes(search)
  );

  const handleAddToCart = (product) => {
    addToCart(product);
    setAddedItems(prev => ({ ...prev, [product.id]: true }));
    setTimeout(() => setAddedItems(prev => ({ ...prev, [product.id]: false })), 1500);
  };

  const handleWishlist = (product) => {
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
      setWishedItems(prev => ({ ...prev, [product.id]: true }));
      setTimeout(() => setWishedItems(prev => ({ ...prev, [product.id]: false })), 600);
    }
  };

  const handleCheckout = async () => {
    if (!currentUser?.id || cart.length === 0 || placingOrder) return;
    setPlacingOrder(true);
    try {
      const payload = {
        customerId: currentUser.id,
        items: cart.map(item => ({
          productId: item.productId,
          name: item.name,
          qty: item.qty,
          price: item.price,
        })),
        totalAmount: cartTotal + 40,
        deliveryAddress: '14/A, Shivaji Nagar, Pune 411005',
        paymentMethod: 'COD',
        paymentStatus: 'pending',
      };

      const res = await fetch(apiUrl('/api/data/orders'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) throw new Error(data.message || 'Order failed');

      setOrdersData(prev => [data.order, ...prev]);
      clearCart();
      setCartOpen(false);
      setSuccessOrder(data.order);
    } catch (error) {
      toast.error('Order Failed', error.message || 'Please try again.');
    } finally {
      setPlacingOrder(false);
    }
  };

  const handleLogout = () => { logout(); navigate('/login'); };

  const badgeClass = (badge) => badge === 'Organic' ? 'organic' : badge === 'Top Seller' ? 'topseller' : 'fresh';

  return (
    <div className="customer-page">
      {/* SUCCESS MODAL */}
      {successOrder && (
        <OrderSuccessModal
          orderId={successOrder.id}
          onContinue={() => setSuccessOrder(null)}
          onTrack={() => { setSuccessOrder(null); setActiveTab(1); }}
        />
      )}
      {/* NAVBAR */}
      <nav className="cust-navbar">
        <div className="cust-nav-brand">🐔 PoultrySmart</div>
        <div className="cust-nav-actions">
          <div className="cust-user-chip">
            <div className="cust-avatar">{firstName[0]}</div>
            <span>{firstName}</span>
          </div>
          <button className="icon-btn-c" onClick={() => setDarkMode(d => !d)} title="Dark mode">{darkMode ? '☀️' : '🌙'}</button>
          <button className="icon-btn-c wishlist-btn" onClick={() => setActiveTab(2)} title="Wishlist">
            ❤️
            {wishlist.length > 0 && <span className="cart-badge-c wishlist-badge">{wishlist.length}</span>}
          </button>
          <button className="icon-btn-c cart-btn" onClick={() => setCartOpen(true)} title="Cart">
            🛒
            {cart.length > 0 && <span className="cart-badge-c">{cart.length}</span>}
          </button>
          <button className="logout-btn-c" onClick={handleLogout}>Logout</button>
        </div>
      </nav>

      {/* TABS */}
      <div className="cust-tabs">
        {navItems.map((item, i) => (
          <button key={i} className={`cust-tab-btn ${activeTab === i ? 'active' : ''}`} onClick={() => setActiveTab(i)}>
            <span>{item.icon}</span> {item.label}
            {i === 2 && wishlist.length > 0 && <span className="tab-badge">{wishlist.length}</span>}
          </button>
        ))}
      </div>

      {/* ─── TAB 0: SHOP ─── */}
      {activeTab === 0 && (
        <>
          <div className="shop-hero">
            <h1>🥚 Fresh from Verified Farms</h1>
            <p>Order directly from certified poultry farms — no middlemen, better prices</p>
            <div className="search-bar">
              <input type="text" placeholder="Search eggs, chicken, organic…" value={search} onChange={e => setSearch(e.target.value.toLowerCase())} />
              <button>🔍 Search</button>
            </div>
          </div>

          <div className="shop-wrap">
            <div className="filter-row">
              <span className="filter-label">Filter:</span>
              {[['all', 'All Products'], ['eggs', '🥚 Eggs'], ['chicken', '🐔 Chicken'], ['organic', '🌿 Organic'], ['fresh', '⚡ Fresh Today']].map(([val, label]) => (
                <button key={val} className={`filter-chip ${activeFilter === val ? 'active' : ''}`} onClick={() => setActiveFilter(val)}>{label}</button>
              ))}
            </div>

            <div className="products-grid">
              {filteredProducts.length === 0
                ? <div className="no-products">No products found 🔍</div>
                : filteredProducts.map(p => (
                  <div key={p.id} className="product-card">
                    <div className="card-img">
                      <span className="card-emoji">{p.emoji}</span>
                      <span className={`card-badge ${badgeClass(p.badge)}`}>{p.badge}</span>
                      <button
                        className={`wish-btn ${isInWishlist(p.id) ? 'wished' : ''} ${wishedItems[p.id] ? 'wish-pop' : ''}`}
                        onClick={() => handleWishlist(p)}
                        title={isInWishlist(p.id) ? 'Remove from Wishlist' : 'Add to Wishlist'}
                      >
                        {isInWishlist(p.id) ? '❤️' : '🤍'}
                      </button>
                    </div>
                    <div className="card-body">
                      <div className="card-farm">{p.farmName} {p.isOrganic ? '🌿' : ''}</div>
                      <div className="card-name">{p.name}</div>
                      <div className="card-desc">{p.description}</div>
                      <div className="card-meta">
                        <div className="card-price">₹{p.pricePerUnit} <span>/{p.unit}</span></div>
                        <div className="card-rating">★ {p.rating} <span>({p.reviewCount})</span></div>
                      </div>
                      <div className="card-stock">📦 {p.stock} {p.unit}s in stock</div>
                      <button className={`btn-add-cart ${addedItems[p.id] ? 'added' : ''}`} onClick={() => handleAddToCart(p)}>
                        {addedItems[p.id] ? '✓ Added!' : '🛒 Add to Cart'}
                      </button>
                    </div>
                  </div>
                ))
              }
            </div>
          </div>
        </>
      )}

      {/* ─── TAB 1: MY ORDERS ─── */}
      {activeTab === 1 && (
        <div className="shop-wrap">
          <div className="section-title-c">📦 My Orders</div>
          {myOrders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 20px' }}>
              <div style={{ fontSize: '64px', marginBottom: '16px' }}>📦</div>
              <h2>No orders yet</h2>
              <p style={{ color: 'var(--text3)', marginTop: '8px', marginBottom: '20px' }}>Your order history will appear here.</p>
              <button className="btn-add-cart" style={{ width: 'auto', padding: '10px 24px' }} onClick={() => setActiveTab(0)}>Start Shopping</button>
            </div>
          ) : (
            <div className="orders-list">
              {myOrders.map(o => {
                const stepIdx = ORDER_STEPS.indexOf(o.status);
                return (
                  <div key={o.id} className="order-card">
                    <div className="order-card-top">
                      <div>
                        <div className="order-id">{o.id}</div>
                        <div className="order-product">{o.items.map(i => `${i.qty}× ${i.name}`).join(', ')}</div>
                        <div className="order-date">{new Date(o.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div className="order-amount">₹{o.totalAmount.toLocaleString('en-IN')}</div>
                        <span className={`badge ${o.status}`}>{o.status}</span>
                        <div className="order-payment">{o.paymentMethod}</div>
                      </div>
                    </div>
                    {stepIdx >= 0 && (
                      <div className="order-tracker">
                        {ORDER_STEPS.map((step, si) => (
                          <div key={step} className={`tracker-step ${si <= stepIdx ? 'done' : ''}`}>
                            <div className="tracker-dot">{si <= stepIdx ? '✓' : si + 1}</div>
                            <div className="tracker-label">{step.charAt(0).toUpperCase() + step.slice(1)}</div>
                            {si < ORDER_STEPS.length - 1 && <div className={`tracker-line ${si < stepIdx ? 'done' : ''}`} />}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ─── TAB 2: WISHLIST ─── */}
      {activeTab === 2 && (
        <div className="shop-wrap">
          <div className="section-title-c">❤️ My Wishlist {wishlist.length > 0 && `(${wishlist.length})`}</div>
          {wishlist.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '100px 20px' }}>
              <div style={{ fontSize: '64px', marginBottom: '20px' }}>❤️</div>
              <h2>Your Wishlist is Empty</h2>
              <p style={{ color: 'var(--text3)', marginTop: '10px', marginBottom: '24px' }}>Save your favorite farm-fresh products here.</p>
              <button className="btn-add-cart" style={{ width: 'auto', padding: '10px 24px' }} onClick={() => setActiveTab(0)}>Start Shopping</button>
            </div>
          ) : (
            <>
              <div className="products-grid">
                {wishlist.map(p => (
                  <div key={p.id} className="product-card">
                    <div className="card-img">
                      <span className="card-emoji">{p.emoji}</span>
                      <span className={`card-badge ${badgeClass(p.badge)}`}>{p.badge}</span>
                      <button className="wish-btn wished" onClick={() => removeFromWishlist(p.id)} title="Remove from Wishlist">❤️</button>
                    </div>
                    <div className="card-body">
                      <div className="card-farm">{p.farmName} {p.isOrganic ? '🌿' : ''}</div>
                      <div className="card-name">{p.name}</div>
                      <div className="card-desc">{p.description}</div>
                      <div className="card-meta">
                        <div className="card-price">₹{p.pricePerUnit} <span>/{p.unit}</span></div>
                        <div className="card-rating">★ {p.rating} <span>({p.reviewCount})</span></div>
                      </div>
                      <div className="card-stock">📦 {p.stock} {p.unit}s in stock</div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button className={`btn-add-cart ${addedItems[p.id] ? 'added' : ''}`} onClick={() => handleAddToCart(p)} style={{ flex: 1 }}>
                          {addedItems[p.id] ? '✓ Added!' : '🛒 Add to Cart'}
                        </button>
                        <button
                          className="btn-add-cart"
                          style={{ flex: '0 0 40px', background: '#ef4444' }}
                          onClick={() => removeFromWishlist(p.id)}
                          title="Remove"
                        >🗑️</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ textAlign: 'center', marginTop: '8px' }}>
                <button className="btn-add-cart" style={{ width: 'auto', padding: '10px 24px', background: '#ef4444' }} onClick={() => { wishlist.forEach(p => removeFromWishlist(p.id)); }}>
                  Clear All
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* ─── TAB 3: PROFILE ─── */}
      {activeTab === 3 && (
        <ProfileTab currentUser={currentUser} myOrders={myOrders} />
      )}

      {/* CART DRAWER */}
      {cartOpen && <div className="cart-overlay-c" onClick={() => setCartOpen(false)} />}
      <div className={`cart-drawer ${cartOpen ? 'open' : ''}`}>
        <div className="cart-header-c">
          <h3>🛒 Your Cart</h3>
          <button className="cart-close-c" onClick={() => setCartOpen(false)}>✕</button>
        </div>
        <div className="cart-body-c">
          {cart.length === 0
            ? <div className="cart-empty-c">🛒<br /><br />Your cart is empty.<br />Add some fresh produce!</div>
            : cart.map(item => (
              <div key={item.productId} className="cart-item-c">
                <div className="ci-emoji-c">{item.emoji || '📦'}</div>
                <div className="ci-info-c">
                  <div className="ci-name-c">{item.name}</div>
                  <div className="ci-farm-c">{item.farmName}</div>
                  <div className="ci-price-c">₹{item.price} / {item.unit}</div>
                  <div className="ci-qty-c">
                    <button className="qty-btn-c" onClick={() => changeQty(item.productId, -1)}>−</button>
                    <span>{item.qty}</span>
                    <button className="qty-btn-c" onClick={() => changeQty(item.productId, 1)}>+</button>
                    <button className="ci-remove" onClick={() => removeFromCart(item.productId)}>Remove</button>
                  </div>
                </div>
              </div>
            ))
          }
        </div>
        {cart.length > 0 && (
          <div className="cart-footer-c">
            <div className="cart-total-c">
              <span>Subtotal</span>
              <span>₹{cartTotal.toLocaleString('en-IN')}</span>
            </div>
            <div className="cart-delivery">+ ₹40 delivery • Free above ₹500</div>
            <button className="btn-checkout-c" onClick={handleCheckout} disabled={placingOrder}>
              {placingOrder ? 'Placing Order...' : 'Proceed to Pay →'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Profile Sub-component ─── */
function ProfileTab({ currentUser, myOrders }) {
  const { darkMode, setDarkMode } = useApp();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(currentUser.name);
  const [phone, setPhone] = useState(currentUser.phone || '');
  const [address, setAddress] = useState('14/A, Shivaji Nagar, Pune 411005');
  const [saved, setSaved] = useState(false);
  const [orderNotif, setOrderNotif] = useState(true);
  const [emailPromo, setEmailPromo] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setEditing(false);
    toast.success('Profile Updated', 'Your changes have been saved.');
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="shop-wrap">
      <div className="section-title-c">👤 Profile Settings</div>
      {saved && (
        <div className="profile-toast">✅ Profile updated successfully!</div>
      )}
      <div className="profile-grid">
        {/* Avatar card */}
        <div className="profile-avatar-card">
          <div className="profile-big-avatar">{name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}</div>
          <div className="profile-name-display">{name}</div>
          <div className="profile-role-badge">Customer</div>
          <div className="profile-email-display">{currentUser.email}</div>
          <div className="profile-stats">
            <div className="profile-stat">
              <div className="ps-val">{myOrders.length}</div>
              <div className="ps-label">Orders</div>
            </div>
            <div className="profile-stat">
              <div className="ps-val">{myOrders.filter(o => o.status === 'delivered').length}</div>
              <div className="ps-label">Delivered</div>
            </div>
          </div>
        </div>

        {/* Edit form */}
        <div className="profile-form-card">
          <div className="profile-form-header">
            <h3>Personal Information</h3>
            {!editing && (
              <button className="btn-edit-profile" onClick={() => setEditing(true)}>✏️ Edit Profile</button>
            )}
          </div>
          <div className="profile-fields">
            <div className="profile-field">
              <label>Full Name</label>
              {editing
                ? <input className="profile-input" value={name} onChange={e => setName(e.target.value)} />
                : <div className="profile-value">{name}</div>
              }
            </div>
            <div className="profile-field">
              <label>Email Address</label>
              <div className="profile-value">{currentUser.email} <span className="verified-chip">✓ Verified</span></div>
            </div>
            <div className="profile-field">
              <label>Phone Number</label>
              {editing
                ? <input className="profile-input" value={phone} onChange={e => setPhone(e.target.value)} placeholder="Enter phone number" />
                : <div className="profile-value">{phone || '—'}</div>
              }
            </div>
            <div className="profile-field">
              <label>Delivery Address</label>
              {editing
                ? <textarea className="profile-input profile-textarea" value={address} onChange={e => setAddress(e.target.value)} rows={2} />
                : <div className="profile-value">{address}</div>
              }
            </div>
            {editing && (
              <div className="profile-btn-row">
                <button className="btn-add-cart" style={{ flex: 1 }} onClick={handleSave}>💾 Save Changes</button>
                <button className="btn-add-cart" style={{ flex: 1, background: '#94a3b8' }} onClick={() => setEditing(false)}>Cancel</button>
              </div>
            )}
          </div>

          {/* Preferences */}
          <div className="profile-prefs">
            <h4>Preferences</h4>
            <div className="pref-row">
              <span>🔔 Order Notifications</span>
              <label className="toggle-switch">
                <input type="checkbox" checked={orderNotif} onChange={e => { setOrderNotif(e.target.checked); toast.info('Preference Saved', e.target.checked ? 'Order notifications enabled.' : 'Order notifications disabled.'); }} />
                <span className="toggle-slider" />
              </label>
            </div>
            <div className="pref-row">
              <span>📧 Email Promotions</span>
              <label className="toggle-switch">
                <input type="checkbox" checked={emailPromo} onChange={e => { setEmailPromo(e.target.checked); toast.info('Preference Saved', e.target.checked ? 'Promotional emails enabled.' : 'Promotional emails disabled.'); }} />
                <span className="toggle-slider" />
              </label>
            </div>
            <div className="pref-row">
              <span>🌙 Dark Mode</span>
              <label className="toggle-switch">
                <input type="checkbox" checked={darkMode} onChange={() => setDarkMode(d => !d)} />
                <span className="toggle-slider" />
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
