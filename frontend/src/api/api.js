import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // Vite uses import.meta.env
});

// Interceptor to add the auth token to every request
api.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('user'));
  if (user && user.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
});

export default api;