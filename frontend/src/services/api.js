import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (userData) => api.post('/user/register', userData),
  login: (credentials) => api.post('/user/login', credentials),
  getProfile: () => api.get('/user/profile'),
  updateProfile: (profileData) => api.put('/user/profile', profileData),
};

// AI Chat API
export const aiAPI = {
  askQuestion: (data) => api.post('/ai/ask', data),
  chat: (data) => api.post('/ai/chat', data),
  getChatHistory: (sessionId, limit = 50) => api.get('/ai/chat/history', { 
    params: { session_id: sessionId, limit } 
  }),
  getChatSessions: () => api.get('/ai/chat/sessions'),
  deleteChatSession: (sessionId) => api.delete(`/ai/chat/session/${sessionId}`),
};

export const aiService = {
  getConceptMap: async (topic) => {
    const response = await api.get('/ai/concept-map', { params: { topic } });
    return response.data;
  }
};

// Quiz API
export const quizAPI = {
  generate: (data) => api.post('/quiz/generate', data),
  submit: (data) => api.post('/quiz/submit', data),
  getAttempts: () => api.get('/quiz/attempts'),
  getTopicStats: (topic) => api.get('/quiz/topic-stats', { params: { topic } }),
  getWeakTopics: () => api.get('/quiz/weak-topics'),
  getAdaptivePath: () => api.get('/quiz/adaptive-path'),
  getAvailableTopics: () => api.get('/quiz/available-topics'),
};

// Progress API
export const progressAPI = {
  getProgress: (userId) => api.get(`/progress/${userId}`),
  getRecommendations: (data) => api.post('/progress/recommend', data),
  getAnalytics: (days) => api.get('/progress/analytics', { params: { days } }),
  getWeakTopics: () => api.get('/progress/weak-topics'),
  getSkillLevels: () => api.get('/progress/skill-levels'),
  getStudyStreak: () => api.get('/progress/study-streak'),
  getPersona: () => api.get('/progress/persona'),
  getPredictedScore: (topic) => api.get('/progress/predict-score', { params: { topic } }),
  getProactiveInsight: () => api.get('/progress/proactive-insight'),
};

export const adminAPI = {
  getUsers: () => api.get('/admin/dashboard'),
  deleteUser: (userId) => api.delete(`/admin/users/${userId}`),
  updateUserRole: (userId, role) => api.put(`/admin/users/${userId}/role`, { role }),
  getAnalytics: () => api.get('/admin/analytics'),
  getActivities: (limit = 20) => api.get('/admin/activities', { params: { limit } }),
  addTopic: (topicData) => api.post('/admin/topics', topicData),
  getTopics: () => api.get('/admin/topics'),
  deleteTopic: (topicId) => api.delete(`/admin/topics/${topicId}`),
  uploadContent: (formData) => api.post('/admin/content/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getConfig: () => api.get('/admin/config'),
  updateConfig: (configData) => api.put('/admin/config', configData),
  testKeys: () => api.post('/admin/test-keys'),
};

export default api;
