import { createContext, useContext, useState, useEffect } from 'react';
import { users, credMap } from '../data/psData';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('ps_user')) || null; } catch { return null; }
  });
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('ps_theme') === 'dark');
  const [lang, setLang] = useState(() => localStorage.getItem('ps_lang') || 'en');
  const [cart, setCart] = useState(() => {
    try { return JSON.parse(localStorage.getItem('ps_cart')) || []; } catch { return []; }
  });
  const [wishlist, setWishlist] = useState(() => {
    try { return JSON.parse(localStorage.getItem('ps_wishlist')) || []; } catch { return []; }
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
    localStorage.setItem('ps_theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  useEffect(() => { localStorage.setItem('ps_lang', lang); }, [lang]);
  useEffect(() => { localStorage.setItem('ps_cart', JSON.stringify(cart)); }, [cart]);
  useEffect(() => { localStorage.setItem('ps_wishlist', JSON.stringify(wishlist)); }, [wishlist]);

  const login = (email, password) => {
    const cred = credMap[email];
    if (cred && cred.pass === password) {
      const user = users.find(u => u.id === cred.userId);
      setCurrentUser(user);
      localStorage.setItem('ps_user', JSON.stringify(user));
      return { success: true, user };
    }
    return { success: false };
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('ps_user');
  };

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(i => i.productId === product.id);
      if (existing) return prev.map(i => i.productId === product.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { productId: product.id, qty: 1, name: product.name, price: product.pricePerUnit, unit: product.unit, farmName: product.farmName, emoji: product.emoji }];
    });
  };

  const removeFromCart = (productId) => setCart(prev => prev.filter(i => i.productId !== productId));

  const changeQty = (productId, delta) => {
    setCart(prev => prev.map(i => i.productId === productId ? { ...i, qty: Math.max(1, i.qty + delta) } : i));
  };

  const clearCart = () => setCart([]);

  const cartTotal = cart.reduce((s, i) => s + i.price * i.qty, 0);

  const addToWishlist = (product) => {
    setWishlist(prev => prev.find(p => p.id === product.id) ? prev : [...prev, product]);
  };
  const removeFromWishlist = (productId) => setWishlist(prev => prev.filter(p => p.id !== productId));
  const isInWishlist = (productId) => wishlist.some(p => p.id === productId);

  return (
    <AppContext.Provider value={{ currentUser, login, logout, darkMode, setDarkMode, lang, setLang, cart, addToCart, removeFromCart, changeQty, clearCart, cartTotal, wishlist, addToWishlist, removeFromWishlist, isInWishlist }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
