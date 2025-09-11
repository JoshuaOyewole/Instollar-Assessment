import axios from 'axios';
import { cookieUtils } from './cookies';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = cookieUtils.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Auth API
export const authAPI = {
  register: (userData: any) => api.post('/auth/register', userData),
  login: (credentials: any) => api.post('/auth/login', credentials),
  getMe: () => api.get('/auth/me'),
};

// Jobs API
export const jobsAPI = {
  getAll: () => api.get('/jobs'),
  getById: (id: string) => api.get(`/jobs/${id}`),
  create: (jobData: any) => api.post('/jobs', jobData),
  delete: (id: string) => api.delete(`/jobs/${id}`),
};

//USERS API
export const usersAPI = {
  getAll: (params?: { role?: 'talent' | 'admin' }) => api.get('/users', { params }),
  getAllTalents: () => api.get('/users?role=talent'),
  getAllAdmins: () => api.get('/users?role=admin'),
  updateProfile: (userData: any) => api.put('/users/profile', userData),
};
// Matches API
export const matchesAPI = {
  create: (matchData: any) => api.post('/matches', matchData),
  apply: (jobId: string) => api.post('/matches/apply', { jobId }),
  getMyMatches: () => api.get('/matches/my-matches'),
  getAll: () => api.get('/matches'),
};

// Applications API
export const applicationsAPI = {
  apply: (jobId: string) => api.post('/applications/apply', { jobId}),
  getMyApplications: () => api.get('/applications/my-applications'),
  checkStatus: (jobId: string) => api.get(`/applications/check/${jobId}`),
  getAll: (params?: any) => api.get('/applications', { params }),
  getStats: () => api.get('/applications/stats'),
  review: (applicationId: string, status: string) => 
    api.patch(`/applications/${applicationId}/review`, { status}),
};

export default api;
