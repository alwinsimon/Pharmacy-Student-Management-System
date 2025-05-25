import axios from 'axios';

// In production, use relative URLs since frontend and backend are served from the same domain
// In development, use localhost:5000
const API_URL = process.env.NODE_ENV === 'production' 
  ? '' // Use relative URLs in production
  : (process.env.REACT_APP_API_URL || 'http://localhost:5000');

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for auth token
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

// Add response interceptor for token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If error is 401 and not already retrying
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        // Try to refresh token
        const refreshToken = localStorage.getItem('refreshToken');
        const response = await axios.post(`${API_URL}/api/auth/refresh-token`, {
          refreshToken,
        });
        
        // Store new tokens
        const { token, refreshToken: newRefreshToken } = response.data;
        localStorage.setItem('token', token);
        localStorage.setItem('refreshToken', newRefreshToken);
        
        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return api(originalRequest);
      } catch (refreshError) {
        // If refresh fails, log out
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

// Auth Services
export const authService = {
  login: (credentials) => api.post('/api/auth/login', credentials),
  register: (userData) => api.post('/api/auth/register', userData),
  logout: (refreshToken) => api.post('/api/auth/logout', { refreshToken }),
  refreshToken: (refreshToken) => api.post('/api/auth/refresh-token', { refreshToken }),
};

// User Services
export const userService = {
  getCurrentUser: () => api.get('/api/users/me'),
  updateProfile: (userData) => api.put('/api/users/me', userData),
  uploadProfilePicture: (formData) => api.post('/api/users/me/profile-picture', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  getAllUsers: () => api.get('/api/users'),
  getUserById: (id) => api.get(`/api/users/${id}`),
};

// Case Services
export const caseService = {
  getAllCases: () => api.get('/api/cases'),
  getCaseById: (id) => api.get(`/api/cases/${id}`),
  createCase: (caseData) => api.post('/api/cases', caseData),
  updateCase: (id, caseData) => api.put(`/api/cases/${id}`, caseData),
  deleteCase: (id) => api.delete(`/api/cases/${id}`),
  submitCase: (id) => api.post(`/api/cases/${id}/submit`),
  evaluateCase: (id, evaluation) => api.post(`/api/cases/${id}/evaluate`, evaluation),
  addComment: (id, comment) => api.post(`/api/cases/${id}/comments`, comment),
  uploadAttachment: (id, formData) => api.post(`/api/cases/${id}/attachments`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  generatePdf: (id) => api.get(`/api/cases/${id}/pdf`, { responseType: 'blob' }),
};

// Query Services
export const queryService = {
  getAllQueries: () => api.get('/api/queries'),
  getQueryById: (id) => api.get(`/api/queries/${id}`),
  createQuery: (queryData) => api.post('/api/queries', queryData),
  updateQuery: (id, queryData) => api.put(`/api/queries/${id}`, queryData),
  deleteQuery: (id) => api.delete(`/api/queries/${id}`),
  assignQuery: (id, studentIds) => api.post(`/api/queries/${id}/assign`, { studentIds }),
  respondToQuery: (id, response) => api.post(`/api/queries/${id}/respond`, response),
  evaluateResponse: (id, evaluation) => api.post(`/api/queries/${id}/evaluate`, evaluation),
  generatePdf: (id) => api.get(`/api/queries/${id}/pdf`, { responseType: 'blob' }),
};

// Test Services
export const testService = {
  getAllTests: () => api.get('/api/tests'),
  getTestById: (id) => api.get(`/api/tests/${id}`),
  createTest: (testData) => api.post('/api/tests', testData),
  updateTest: (id, testData) => api.put(`/api/tests/${id}`, testData),
  deleteTest: (id) => api.delete(`/api/tests/${id}`),
  getTestQuestions: (id) => api.get(`/api/tests/${id}/questions`),
  startTest: (id) => api.post(`/api/tests/${id}/start`),
  submitTest: (id, answers) => api.post(`/api/tests/${id}/submit`, answers),
  getTestResults: (id) => api.get(`/api/tests/${id}/results`),
  getClassResults: (id) => api.get(`/api/tests/${id}/class-results`),
  generatePdf: (id) => api.get(`/api/tests/${id}/pdf`, { responseType: 'blob' }),
};

export default api; 