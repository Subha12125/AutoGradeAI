import axios from 'axios';

const rawBaseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const cleanBaseURL = rawBaseURL.replace(/\/+$/, '');
const baseURL = cleanBaseURL.endsWith('/api') ? cleanBaseURL : `${cleanBaseURL}/api`;

const api = axios.create({
  baseURL,
});

let activeSlowTimers = new Map();

const clearSlowTimer = (config) => {
  if (config?._requestId && activeSlowTimers.has(config._requestId)) {
    clearTimeout(activeSlowTimers.get(config._requestId));
    activeSlowTimers.delete(config._requestId);
  }
  if (activeSlowTimers.size === 0 && typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('backend-cold-start', { detail: { active: false } }));
  }
};

// Add a request interceptor to add the auth token & track latency
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Don't override content-type for FormData
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }

    // Detect slow responses (e.g. Render free tier cold-start after 15m idle)
    if (typeof window !== 'undefined' && !config.url?.includes('/health')) {
      const requestId = Math.random().toString(36).substring(7);
      config._requestId = requestId;
      const timer = setTimeout(() => {
        window.dispatchEvent(new CustomEvent('backend-cold-start', { detail: { active: true } }));
      }, 2500);
      activeSlowTimers.set(requestId, timer);
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Add a response interceptor to handle errors globally
api.interceptors.response.use(
  (response) => {
    clearSlowTimer(response.config);
    return response;
  },
  (error) => {
    clearSlowTimer(error.config);
    if (error.response?.status === 401) {
      const isAuthEndpoint = error.config?.url?.includes('/auth/login') || error.config?.url?.includes('/auth/register');
      const hadToken = error.config?.headers?.Authorization;
      // Only clear token and redirect to login if it was a protected resource that rejected our token
      if (hadToken && !isAuthEndpoint) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Automatic warmup ping to wake up free-tier backend in background on initial client load
if (typeof window !== 'undefined') {
  setTimeout(() => {
    api.get('/health').catch(() => {});
  }, 200);
}

export default api;
