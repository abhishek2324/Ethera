import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
});

// Attach JWT token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('ethera_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authAPI = {
  signup: (data: { name: string; email: string; password: string; role?: string }) =>
    API.post('/auth/signup', data),
  login: (data: { email: string; password: string }) =>
    API.post('/auth/login', data),
  getMe: () => API.get('/auth/me'),
  getUsers: () => API.get('/auth/users'),
};

// Project API
export const projectAPI = {
  create: (data: { title: string; description?: string; members?: string[] }) =>
    API.post('/projects', data),
  getAll: () => API.get('/projects'),
  getOne: (id: string) => API.get(`/projects/${id}`),
  update: (id: string, data: { title?: string; description?: string; members?: string[] }) =>
    API.put(`/projects/${id}`, data),
  delete: (id: string) => API.delete(`/projects/${id}`),
};

// Task API
export const taskAPI = {
  create: (data: {
    title: string;
    description?: string;
    priority?: string;
    status?: string;
    dueDate?: string;
    assignedTo?: string;
    projectId: string;
  }) => API.post('/tasks', data),
  getAll: (params?: Record<string, string>) => API.get('/tasks', { params }),
  getOne: (id: string) => API.get(`/tasks/${id}`),
  update: (id: string, data: Record<string, unknown>) => API.put(`/tasks/${id}`, data),
  delete: (id: string) => API.delete(`/tasks/${id}`),
};

// Dashboard API
export const dashboardAPI = {
  get: () => API.get('/dashboard'),
};

export default API;
