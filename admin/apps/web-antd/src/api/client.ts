import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_GLOB_API_URL ?? 'http://127.0.0.1:3100/api',
  timeout: 15000,
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('cat_robot_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('cat_robot_token');
      if (window.location.pathname !== '/login') window.location.assign('/login');
    }
    return Promise.reject(error);
  },
);
