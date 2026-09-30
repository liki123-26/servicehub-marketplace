import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach Authorization Bearer Token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('servicehub_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Interceptor for API errors
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.message || 'An unexpected error occurred. Please try again.';
    return Promise.reject({
      status: error.response?.status,
      message,
      data: error.response?.data
    });
  }
);

export default api;
