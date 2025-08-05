import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { message } from 'antd';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [tokenExpiry, setTokenExpiry] = useState(null);
  const [refreshToken, setRefreshToken] = useState(localStorage.getItem('refreshToken'));

  // Token refresh interval (5 minutes before expiry)
  const REFRESH_THRESHOLD = 5 * 60 * 1000; // 5 minutes in milliseconds

  // Parse JWT token to get expiry
  const parseToken = useCallback((token) => {
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return new Date(payload.exp * 1000);
    } catch (error) {
      console.error('Token parsing error:', error);
      return null;
    }
  }, []);

  // Check if token is expired or about to expire
  const isTokenExpired = useCallback((expiry) => {
    if (!expiry) return true;
    const now = new Date();
    const timeUntilExpiry = expiry.getTime() - now.getTime();
    return timeUntilExpiry <= REFRESH_THRESHOLD;
  }, []);

  // Refresh token automatically
  const refreshAuthToken = useCallback(async () => {
    if (!refreshToken) return false;
    
    try {
      const response = await api.post('/auth/refresh', { refreshToken });
      const { token: newToken, refreshToken: newRefreshToken } = response.data;
      
      localStorage.setItem('token', newToken);
      localStorage.setItem('refreshToken', newRefreshToken);
      setToken(newToken);
      setRefreshToken(newRefreshToken);
      setTokenExpiry(parseToken(newToken));
      
      return true;
    } catch (error) {
      console.error('Token refresh failed:', error);
      // Clear invalid tokens
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      setToken(null);
      setRefreshToken(null);
      setTokenExpiry(null);
      setUser(null);
      return false;
    }
  }, [refreshToken, parseToken]);

  // Set up automatic token refresh
  useEffect(() => {
    if (!tokenExpiry) return;

    const checkTokenExpiry = () => {
      if (isTokenExpired(tokenExpiry)) {
        refreshAuthToken();
      }
    };

    // Check immediately
    checkTokenExpiry();

    // Set up interval to check every minute
    const interval = setInterval(checkTokenExpiry, 60 * 1000);

    return () => clearInterval(interval);
  }, [tokenExpiry, isTokenExpired, refreshAuthToken]);

  // Check if user is authenticated on app load
  useEffect(() => {
    const checkAuth = async () => {
      if (token) {
        try {
          // Check if token is expired
          const expiry = parseToken(token);
          if (isTokenExpired(expiry)) {
            // Try to refresh token
            const refreshed = await refreshAuthToken();
            if (!refreshed) {
              throw new Error('Token expired and refresh failed');
            }
          }

          const response = await api.get('/auth/me');
          setUser(response.data.user);
          setTokenExpiry(parseToken(token));
        } catch (error) {
          console.error('Auth check failed:', error);
          // Clear invalid session
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          setToken(null);
          setRefreshToken(null);
          setTokenExpiry(null);
          setUser(null);
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, [token, parseToken, isTokenExpired, refreshAuthToken]);

  // Set auth token in axios headers
  useEffect(() => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common['Authorization'];
    }
  }, [token]);

  // Enhanced error handling with user-friendly messages
  const handleAuthError = (error, defaultMessage) => {
    let userMessage = defaultMessage;
    
    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 400:
          userMessage = data.error || 'Please check your input and try again';
          break;
        case 401:
          userMessage = 'Invalid credentials. Please check your email and password';
          break;
        case 403:
          userMessage = 'Access denied. Please contact support if this persists';
          break;
        case 404:
          userMessage = 'Service not found. Please try again later';
          break;
        case 429:
          userMessage = 'Too many requests. Please wait a moment and try again';
          break;
        case 500:
          userMessage = 'Server error. Please try again in a few minutes';
          break;
        default:
          userMessage = data.error || defaultMessage;
      }
    } else if (error.request) {
      userMessage = 'Network error. Please check your connection and try again';
    } else {
      userMessage = error.message || defaultMessage;
    }

    return userMessage;
  };

  const login = async (email, password) => {
    setAuthLoading(true);
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token: newToken, refreshToken: newRefreshToken, user: userData } = response.data;
      
      localStorage.setItem('token', newToken);
      localStorage.setItem('refreshToken', newRefreshToken);
      setToken(newToken);
      setRefreshToken(newRefreshToken);
      setUser(userData);
      setTokenExpiry(parseToken(newToken));
      
      message.success('Welcome back! You have been successfully logged in.');
      return { success: true };
    } catch (error) {
      const errorMessage = handleAuthError(error, 'Login failed. Please try again.');
      message.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setAuthLoading(false);
    }
  };

  const register = async (userData) => {
    setAuthLoading(true);
    try {
      const response = await api.post('/auth/register', userData);
      const { token: newToken, refreshToken: newRefreshToken, user: newUser } = response.data;
      
      localStorage.setItem('token', newToken);
      localStorage.setItem('refreshToken', newRefreshToken);
      setToken(newToken);
      setRefreshToken(newRefreshToken);
      setUser(newUser);
      setTokenExpiry(parseToken(newToken));
      
      message.success('Account created successfully! Welcome to RoomScout AI.');
      return { success: true };
    } catch (error) {
      const errorMessage = handleAuthError(error, 'Registration failed. Please try again.');
      message.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setAuthLoading(false);
    }
  };

  const logout = async () => {
    setAuthLoading(true);
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    }
    
    // Clear all auth data
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    setToken(null);
    setRefreshToken(null);
    setTokenExpiry(null);
    setUser(null);
    message.success('You have been successfully logged out.');
    setAuthLoading(false);
  };

  const updateProfile = async (profileData) => {
    setAuthLoading(true);
    try {
      const response = await api.put('/auth/profile', profileData);
      setUser(response.data.user);
      message.success('Profile updated successfully!');
      return { success: true };
    } catch (error) {
      const errorMessage = handleAuthError(error, 'Profile update failed. Please try again.');
      message.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setAuthLoading(false);
    }
  };

  const verifyEmail = async () => {
    setAuthLoading(true);
    try {
      const response = await api.post('/auth/verify-email');
      setUser(response.data.user);
      message.success('Email verified successfully!');
      return { success: true };
    } catch (error) {
      const errorMessage = handleAuthError(error, 'Email verification failed. Please try again.');
      message.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setAuthLoading(false);
    }
  };

  const forgotPassword = async (email) => {
    setAuthLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      message.success('Password reset email sent! Please check your inbox.');
      return { success: true };
    } catch (error) {
      const errorMessage = handleAuthError(error, 'Failed to send reset email. Please try again.');
      message.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setAuthLoading(false);
    }
  };

  const resetPassword = async (token, newPassword) => {
    setAuthLoading(true);
    try {
      await api.post('/auth/reset-password', { token, newPassword });
      message.success('Password reset successfully! You can now log in with your new password.');
      return { success: true };
    } catch (error) {
      const errorMessage = handleAuthError(error, 'Password reset failed. Please try again.');
      message.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setAuthLoading(false);
    }
  };

  const value = {
    user,
    loading,
    authLoading,
    isAuthenticated: !!user,
    isVerified: user?.isVerified || false,
    token,
    tokenExpiry,
    login,
    register,
    logout,
    updateProfile,
    verifyEmail,
    forgotPassword,
    resetPassword,
    refreshAuthToken
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 