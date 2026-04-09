import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor - handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  changePassword: (data) => api.put('/auth/change-password', data),
};

// Users
export const userAPI = {
  getAll: (params) => api.get('/users', { params }),
  getById: (id) => api.get(`/users/${id}`),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
  resetPassword: (id) => api.post(`/users/${id}/reset-password`),
};

// Students
export const studentAPI = {
  getAll: (params) => api.get('/students', { params }),
  getById: (id) => api.get(`/students/${id}`),
  create: (data) => api.post('/students', data),
  update: (id, data) => api.put(`/students/${id}`, data),
  delete: (id) => api.delete(`/students/${id}`),
  getMyChildren: () => api.get('/students/my-children'),
};

// Classes
export const classAPI = {
  getAll: (params) => api.get('/classes', { params }),
  getById: (id) => api.get(`/classes/${id}`),
  create: (data) => api.post('/classes', data),
  update: (id, data) => api.put(`/classes/${id}`, data),
  delete: (id) => api.delete(`/classes/${id}`),
  getMyClasses: () => api.get('/classes/my-classes'),
};

// Attendance
export const attendanceAPI = {
  getDashboard: (params) => api.get('/attendance/dashboard', { params }),
  manualAttendance: (data) => api.post('/attendance/manual', data),
  getStudentHistory: (studentId, params) => api.get(`/attendance/student/${studentId}`, { params }),
  getSchoolReport: (params) => api.get('/attendance/report', { params }),
  getChildAttendance: (studentId, params) => api.get(`/attendance/child/${studentId}`, { params }),
};

// Leave Requests
export const leaveAPI = {
  create: (data) => api.post('/leaves', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getAll: (params) => api.get('/leaves', { params }),
  review: (id, data) => api.put(`/leaves/${id}/review`, data),
  getMyRequests: () => api.get('/leaves/my-requests'),
};

// Notifications
export const notificationAPI = {
  getAll: (params) => api.get('/notifications', { params }),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
  send: (data) => api.post('/notifications/send', data),
  sendToClass: (data) => api.post('/notifications/send-class', data),
};

// Time Rules
export const timeRuleAPI = {
  getAll: (params) => api.get('/time-rules', { params }),
  create: (data) => api.post('/time-rules', data),
  update: (id, data) => api.put(`/time-rules/${id}`, data),
  delete: (id) => api.delete(`/time-rules/${id}`),
};

// Face Data
export const faceDataAPI = {
  getAll: (params) => api.get('/face-data', { params }),
  upload: (data) => api.post('/face-data', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: (id) => api.delete(`/face-data/${id}`),
  setPrimary: (id) => api.put(`/face-data/${id}/primary`),
};

// Scores
export const scoreAPI = {
  getAll: (params) => api.get('/scores', { params }),
  create: (data) => api.post('/scores', data),
  update: (id, data) => api.put(`/scores/${id}`, data),
  delete: (id) => api.delete(`/scores/${id}`),
};

export default api;
