import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const isMemberRoute = window.location.pathname.startsWith('/member');
  const token = isMemberRoute 
    ? localStorage.getItem('memberToken') 
    : localStorage.getItem('token');
    
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !error.config.url.includes('/login')) {
      const isMemberRoute = window.location.pathname.startsWith('/member');
      if (isMemberRoute) {
        localStorage.removeItem('memberToken');
        localStorage.removeItem('memberUser');
        window.location.href = '/member/login';
      } else {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/admin/login';
      }
    }
    if (error.response?.data?.message) {
      error.message = error.response.data.message;
    }
    return Promise.reject(error);
  }
);

export default api;
