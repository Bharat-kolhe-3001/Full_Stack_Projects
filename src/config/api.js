const rawBaseUrl = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000').trim();

export const API_BASE_URL = rawBaseUrl.endsWith('/')
  ? rawBaseUrl.slice(0, -1)
  : rawBaseUrl;

export const apiUrl = (path) => `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;

