import axios from 'axios';

// Keep API requests on the current origin by default. Vite proxies this path
// locally and Vercel forwards it to Render through frontend/vercel.json.
// VITE_API_URL can still be used when an explicit API URL is required.
const apiBaseUrl = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach Authorization token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for handling auth errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token if invalid/expired
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    return Promise.reject(error);
  }
);

export default api;
