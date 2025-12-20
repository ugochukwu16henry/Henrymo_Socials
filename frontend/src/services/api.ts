import axios from 'axios';

// Use environment variable for API URL, fallback to /api for same-origin
const getBaseURL = () => {
  // In production, if VITE_API_URL is set, use it; otherwise use relative /api
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  // Use relative path for same-origin requests (works when frontend is served by backend)
  return '/api';
};

const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Load token from storage on initialization
const loadTokenFromStorage = () => {
  try {
    const stored = localStorage.getItem('auth-storage');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.state?.token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${parsed.state.token}`;
        return parsed.state.token;
      }
    }
  } catch (e) {
    // Ignore parse errors
  }
  return null;
};

// Initialize token on module load
loadTokenFromStorage();

// Request interceptor - ensure token is always up to date
api.interceptors.request.use(
  (config) => {
    // Always get the latest token from storage
    const token = loadTokenFromStorage();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear auth and redirect to login
      localStorage.removeItem('auth-storage');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

