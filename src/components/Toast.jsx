import { useState, useCallback, useEffect } from 'react';
import './Toast.css';

/* ─── Toast Store (singleton outside React) ─── */
let _toastFn = null;
export const toast = {
  success: (title, msg) => _toastFn?.('success', title, msg),
  error:   (title, msg) => _toastFn?.('error',   title, msg),
  info:    (title, msg) => _toastFn?.('info',    title, msg),
  warning: (title, msg) => _toastFn?.('warning', title, msg),
};

const ICONS = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' };

/* ─── ToastContainer — mount once in App ─── */
export function ToastContainer() {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((type, title, msg) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, type, title, msg }]);
    setTimeout(() => {
      setToasts(prev => prev.map(t => t.id === id ? { ...t, exiting: true } : t));
      setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 320);
    }, 3500);
  }, []);

  useEffect(() => { _toastFn = addToast; return () => { _toastFn = null; }; }, [addToast]);

  const remove = (id) => {
    setToasts(prev => prev.map(t => t.id === id ? { ...t, exiting: true } : t));
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 320);
  };

  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`toast ${t.type} ${t.exiting ? 'exiting' : ''}`}>
          <span className="toast-icon">{ICONS[t.type]}</span>
          <div className="toast-body">
            <div className="toast-title">{t.title}</div>
            {t.msg && <div className="toast-msg">{t.msg}</div>}
          </div>
          <button className="toast-close" onClick={() => remove(t.id)}>✕</button>
        </div>
      ))}
    </div>
  );
}

/* ─── ConfirmDialog ─── */
export function ConfirmDialog({ icon = '⚠️', title, message, confirmLabel = 'Confirm', confirmClass = 'danger', onConfirm, onCancel }) {
  return (
    <div className="confirm-overlay" onClick={onCancel}>
      <div className="confirm-box" onClick={e => e.stopPropagation()}>
        <div className="confirm-icon">{icon}</div>
        <div className="confirm-title">{title}</div>
        <div className="confirm-msg">{message}</div>
        <div className="confirm-actions">
          <button className="confirm-btn cancel" onClick={onCancel}>Cancel</button>
          <button className={`confirm-btn ${confirmClass}`} onClick={onConfirm}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}

/* ─── OrderSuccessModal ─── */
export function OrderSuccessModal({ orderId, onTrack, onContinue }) {
  return (
    <div className="success-modal-overlay">
      <div className="success-modal">
        <div className="success-check">✓</div>
        <h2>Order Placed! 🎉</h2>
        <p>Your fresh produce is on its way from a verified farm.</p>
        <div className="success-order-id">{orderId}</div>
        <p style={{ fontSize: '13px' }}>Expected delivery within <strong>24 hours</strong> · COD</p>
        <div className="success-modal-actions">
          <button className="success-modal-btn secondary" onClick={onContinue}>Continue Shopping</button>
          <button className="success-modal-btn primary" onClick={onTrack}>Track Order →</button>
        </div>
      </div>
    </div>
  );
}

/* ─── OrderDetailModal (Admin) ─── */
export function OrderDetailModal({ order, users, onClose }) {
  if (!order) return null;
  const customer = users?.find(u => u.id === order.customerId);
  return (
    <div className="detail-modal-overlay" onClick={onClose}>
      <div className="detail-modal" onClick={e => e.stopPropagation()}>
        <div className="detail-modal-header">
          <h3>📦 Order Details — {order.id}</h3>
          <button className="detail-modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="detail-modal-body">
          <div className="detail-row"><label>Order ID</label><span>{order.id}</span></div>
          <div className="detail-row"><label>Customer</label><span>{customer?.name || order.customerId}</span></div>
          <div className="detail-row"><label>Date</label><span>{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span></div>
          <div className="detail-row"><label>Status</label><span className={`badge ${order.status}`}>{order.status}</span></div>
          <div className="detail-row"><label>Payment</label><span>{order.paymentMethod} · {order.paymentStatus}</span></div>
          <div className="detail-row"><label>Delivery Address</label><span style={{ textAlign: 'right', maxWidth: '60%' }}>{order.deliveryAddress || '—'}</span></div>
          <div className="detail-items-title">Items Ordered</div>
          {order.items?.map((item, i) => (
            <div key={i} className="detail-item-row">
              <span>{item.qty}× {item.name}</span>
              <span>₹{((item.price || 0) * (item.qty || 1)).toLocaleString('en-IN')}</span>
            </div>
          ))}
          <div className="detail-row" style={{ marginTop: '8px', fontWeight: '700' }}>
            <label>Total Amount</label>
            <span style={{ color: '#16a34a', fontSize: '16px' }}>₹{order.totalAmount?.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
