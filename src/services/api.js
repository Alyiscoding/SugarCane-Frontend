import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor for adding auth token
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

// Auth API endpoints
export const authAPI = {
  login: (credentials) => api.post('/api/auth/login', credentials),
  register: (userData) => api.post('/api/auth/register', userData),
  forgotPassword: (email) => api.post('/api/auth/forgot-password', { email }),
  getProfile: () => api.get('/api/auth/me'),
  updateProfile: (userData) => api.put('/api/auth/profile', userData),
  deleteAccount: () => api.delete('/api/auth/delete-account'),
  changePassword: (oldPassword, newPassword) => api.post('/api/auth/change-password', { oldPassword, newPassword })
};

// Fields API endpoints
export const fieldsAPI = {
  getAllFields: () => api.get('/api/slots'),
  getField: (id) => api.get(`/api/slots/${id}`),
  createField: (fieldData) => api.post('/api/slots', fieldData),
  updateField: (id, fieldData) => api.put(`/api/slots/${id}`, fieldData),
  deleteField: (id) => api.delete(`/api/slots/${id}`),
  getPredictions: () => api.get('/api/predictions'),
  runPrediction: (fieldId) => api.post(`/api/predictions/${fieldId}`),
  runFlaskPrediction: (fieldId, userId) => axios.post('http://localhost:5001/predict', { slot_id: fieldId, user_id: userId }),
// runPrediction: (fieldId) => api.post('/predict', { slot_id: fieldId }),
  createSlot: (slotData) => api.post('/api/slots', slotData),
  updateSlot: (id, slotData) => api.put(`/api/slots/${id}`, slotData)
};

// Feedback API endpoints
export const feedbackAPI = {
  submitFeedback: (feedbackData) => api.post('/api/feedback', feedbackData),
  getFeedback: () => api.get('/api/feedback')
};

export default api;