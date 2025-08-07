import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
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

// Auth API endpoints
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  refresh: (refreshToken) => api.post('/auth/refresh', { refreshToken }),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, newPassword) => api.post('/auth/reset-password', { token, newPassword }),
  getProfile: () => api.get('/auth/me'),
  updateProfile: (profileData) => api.put('/auth/profile', profileData),
  verifyEmail: () => api.post('/auth/verify-email'),
  logout: () => api.post('/auth/logout'),
  test: () => api.get('/auth/test'),
};

// Housing API endpoints
export const housingAPI = {
  // Get all listings with pagination, search, and filters
  getListings: (params = {}) => {
    const {
      page = 1,
      limit = 12,
      search = '',
      sortBy = 'createdAt',
      sortOrder = 'desc',
      priceMin,
      priceMax,
      location = [],
      propertyType = [],
      roomType = [],
      bedrooms = [],
      bathrooms = [],
      amenities = [],
      northeasternFeatures = [],
      rentType = [],
      genderPreference,
      moveInDate,
      ...otherFilters
    } = params;

    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      sortBy,
      sortOrder,
      ...otherFilters
    });

    if (search) queryParams.append('search', search);
    if (priceMin !== undefined) queryParams.append('priceMin', priceMin.toString());
    if (priceMax !== undefined) queryParams.append('priceMax', priceMax.toString());
    if (location.length > 0) location.forEach(loc => queryParams.append('location', loc));
    if (propertyType.length > 0) propertyType.forEach(type => queryParams.append('propertyType', type));
    if (roomType.length > 0) roomType.forEach(type => queryParams.append('roomType', type));
    if (bedrooms.length > 0) bedrooms.forEach(bed => queryParams.append('bedrooms', bed.toString()));
    if (bathrooms.length > 0) bathrooms.forEach(bath => queryParams.append('bathrooms', bath.toString()));
    if (amenities.length > 0) amenities.forEach(amenity => queryParams.append('amenities', amenity));
    if (northeasternFeatures.length > 0) northeasternFeatures.forEach(feature => queryParams.append('northeasternFeatures', feature));
    if (rentType.length > 0) rentType.forEach(type => queryParams.append('rentType', type));
    if (genderPreference) queryParams.append('genderPreference', genderPreference);
    if (moveInDate) queryParams.append('moveInDate', moveInDate);

    return api.get(`/housing?${queryParams.toString()}`);
  },

  // Get single listing by ID
  getListing: (id) => api.get(`/housing/${id}`),

  // Create new listing
  createListing: (listingData) => api.post('/housing', listingData),

  // Update listing
  updateListing: (id, listingData) => api.put(`/housing/${id}`, listingData),

  // Delete listing
  deleteListing: (id) => api.delete(`/housing/${id}`),

  // Save/unsave listing (toggle favorite)
  saveListing: (id) => api.post(`/housing/${id}/save`),
  unsaveListing: (id) => api.delete(`/housing/${id}/save`),

  // Get user's saved listings
  getSavedListings: () => api.get('/housing/saved'),

  // Get user's created listings
  getMyListings: () => api.get('/housing/my-listings'),

  // Contact listing owner
  contactListing: (id, message) => api.post(`/housing/${id}/contact`, { message }),

  // Add listing interaction (view, like, etc.)
  addInteraction: (id, interactionType) => api.post(`/housing/${id}/interaction`, { interactionType }),

  // Get listing statistics
  getListingStats: (id) => api.get(`/housing/${id}/stats`),

  // Upload listing images
  uploadImages: (id, formData) => api.post(`/housing/${id}/images`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),

  // Delete listing image
  deleteImage: (id, imageId) => api.delete(`/housing/${id}/images/${imageId}`),

  // Get housing statistics
  getHousingStats: () => api.get('/housing/stats'),

  // Get popular searches
  getPopularSearches: () => api.get('/housing/popular-searches'),

  // Get search suggestions
  getSearchSuggestions: (query) => api.get(`/housing/search-suggestions?q=${encodeURIComponent(query)}`),
};

// Chat API endpoints
export const chatAPI = {
  // New conversational chat endpoint
  chatQuery: (messageData) => api.post('/chat/chat-query', messageData),
  
  // Legacy send message endpoint (redirects to chat-query)
  sendMessage: (messageData) => api.post('/chat/send-message', messageData),
  
  uploadFile: (formData) => api.post('/chat/upload-file', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    timeout: 300000, // 5 minutes timeout for file processing
  }),
  saveExtractedListing: (listingData) => api.post('/chat/save-extracted-listing', listingData),
  getExtractedListings: () => api.get('/chat/extracted-listings'),
  getChatSessions: () => api.get('/chat/sessions'),
  getChatSession: (sessionId) => api.get(`/chat/session/${sessionId}`),
  deleteChatSession: (sessionId) => api.delete(`/chat/session/${sessionId}`),
  
  // Health check for Python API
  getPythonHealth: () => api.get('/chat/python-health'),
};

// Upload API endpoints
export const uploadAPI = {
  uploadFile: (formData) => api.post('/upload/file', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  getUploadSessions: () => api.get('/upload/sessions'),
  getUploadSession: (sessionId) => api.get(`/upload/sessions/${sessionId}`),
  retryProcessing: (sessionId) => api.post(`/upload/sessions/${sessionId}/retry`),
};

// Analytics API endpoints
export const analyticsAPI = {
  trackEvent: (eventData) => api.post('/analytics/events', eventData),
  getUserAnalytics: () => api.get('/analytics/user'),
  getHousingAnalytics: () => api.get('/analytics/housing'),
  getSearchAnalytics: () => api.get('/analytics/search'),
};

// Notification API endpoints
export const notificationAPI = {
  getNotifications: () => api.get('/notifications'),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  markAsRead: (notificationId) => api.put(`/notifications/${notificationId}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
  deleteNotification: (notificationId) => api.delete(`/notifications/${notificationId}`),
  updatePreferences: (preferences) => api.put('/notifications/preferences', preferences),
  getPreferences: () => api.get('/notifications/preferences'),
};

// Roommate API endpoints
export const roommateAPI = {
  getProfile: () => api.get('/roommate/profile'),
  updateProfile: (profileData) => api.put('/roommate/profile', profileData),
  getMatches: () => api.get('/roommate/matches'),
  likeMatch: (matchId) => api.post(`/roommate/matches/${matchId}/like`),
  dislikeMatch: (matchId) => api.post(`/roommate/matches/${matchId}/dislike`),
  getCompatibility: (matchId) => api.get(`/roommate/matches/${matchId}/compatibility`),
};

// Message API endpoints
export const messageAPI = {
  getConversations: () => api.get('/messages/conversations'),
  getConversation: (conversationId) => api.get(`/messages/conversations/${conversationId}`),
  sendMessage: (conversationId, message) => api.post(`/messages/conversations/${conversationId}/messages`, message),
  markAsRead: (conversationId) => api.put(`/messages/conversations/${conversationId}/read`),
  getUnreadCount: () => api.get('/messages/unread-count'),
};

export default api; 