import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const login = (matricule, password) =>
  API.post('/auth/login', { matricule, password });
export const getMe = () => API.get('/auth/me');
export const changePassword = (ancien_mdp, nouveau_mdp) =>
  API.put('/auth/change-password', { ancien_mdp, nouveau_mdp });
export const createUser = (data) => API.post('/auth/register', data);
export const listUsers = () => API.get('/auth/users');
export const updateUser = (id, data) => API.put(`/auth/users/${id}`, data);
export const deleteUser = (id) => API.delete(`/auth/users/${id}`);

export const createIncident = (data) => API.post('/incidents', data);
export const listIncidents = (params = {}) =>
  API.get('/incidents', { params });
export const getIncident = (id) => API.get(`/incidents/${id}`);
export const updateIncident = (id, data) => API.put(`/incidents/${id}`, data);
export const deleteIncident = (id) => API.delete(`/incidents/${id}`);
export const uploadPhoto = (formData) => API.post('/uploads', formData, { headers: { 'Content-Type': 'multipart/form-data' }});
export const getSites = () => API.get('/incidents/referentiels/sites');
export const getBrigades = () => API.get('/incidents/referentiels/brigades');

export const getDashboard = (params = {}) =>
  API.get('/stats/dashboard', { params });
export const getIncidentsCritiques = () =>
  API.get('/stats/en-attente-critique');

// FORAGES
export const listForages = () => API.get('/forages');
export const getForagesCarte = () => API.get('/forages/carte');
export const getForage = (id) => API.get(`/forages/${id}`);

export const exportExcel = (params = {}) =>
  API.get('/export/excel', { params, responseType: 'blob' });