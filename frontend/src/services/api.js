import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      if (!window.location.pathname.includes('/login')) window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    if (response.data.access_token) localStorage.setItem('auth_token', response.data.access_token);
    return response.data;
  },
  register: async (data) => (await api.post('/auth/register', data)).data,
  getCurrentUser: async () => (await api.get('/auth/me')).data,
  getAllUsers: async (role) => (await api.get('/auth/users', { params: { role } })).data,
  updateProfile: async (data) => (await api.put('/auth/me', data)).data,
  changePassword: async (data) => (await api.post('/auth/change-password', data)).data,
  logout: () => localStorage.removeItem('auth_token'),
};

export const propertyAPI = {
  getAll: async (params) => (await api.get('/properties/', { params })).data,
  
  // ✅ NEW: Get Owner's Listings
  getMyListings: async () => (await api.get('/properties/my-listings')).data, 
  
  getOne: async (id) => (await api.get(`/properties/${id}`)).data,
  create: async (data) => (await api.post('/properties/', data)).data,
  update: async (id, data) => (await api.put(`/properties/${id}`, data)).data,
  updateStatus: async (id, status) => (await api.put(`/properties/${id}/status`, null, { params: { status_update: status } })).data,
  delete: async (id) => (await api.delete(`/properties/${id}`)).data,
  
  uploadImages: async (formData) => {
    const response = await api.post('/properties/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  }
};

export const bookingAPI = {
  create: async (data) => (await api.post('/bookings/', data)).data,
  checkAvailability: async (data) => (await api.post('/bookings/check-availability', data)).data,
  getAll: async () => (await api.get('/bookings/')).data,
  getMyBookings: async () => (await api.get('/bookings/my-bookings')).data,
  
  // ✅ NEW: Get Owner's Received Bookings
  getOwnerBookings: async () => (await api.get('/bookings/owner-bookings')).data,
  
  getOne: async (id) => (await api.get(`/bookings/${id}`)).data,
  updateStatus: async (id, status) => (await api.put(`/bookings/${id}`, { status })).data,
  cancel: async (id) => (await api.delete(`/bookings/${id}`)).data,
  getOccupiedDates: async (id) => (await api.get(`/bookings/property/${id}/occupied`)).data,
};

export const paymentsAPI = {
  getAll: async () => (await api.get('/payments/')).data,
  getMethods: async () => (await api.get('/payments/methods')).data,
  createIntent: async (data) => (await api.post('/payments/create-intent', data)).data,
  confirm: async (data) => (await api.post('/payments/confirm', data)).data, 
  getMyPayments: async () => (await api.get('/payments/my-payments')).data,
  getBookingPayments: async (id) => (await api.get(`/payments/booking/${id}`)).data,
  uploadReceipt: async (formData) => {
    const response = await api.post('/payments/upload-receipt', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },
  review: async (id, action) => (await api.put(`/payments/${id}/review`, null, { 
    params: { action } 
  })).data,
};

export const reportsAPI = {
  getDashboardStats: async () => (await api.get('/reports/dashboard')).data,
};

// ✅ NEW: Audit API
export const auditAPI = {
  getLogs: async (params) => (await api.get('/audit/logs', { params })).data,
  getUserActivity: async (userId) => (await api.get(`/audit/user/${userId}`)).data,
};

export default api;