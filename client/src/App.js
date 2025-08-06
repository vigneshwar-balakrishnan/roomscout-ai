import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, theme } from 'antd';
import { AuthProvider } from './contexts/AuthContext';
import { ChatProvider } from './contexts/ChatContext';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Pages
import Dashboard from './pages/Dashboard';
import Resources from './pages/Resources';
import Chat from './pages/Chat';
import Profile from './pages/Profile';
import HousingDetail from './pages/HousingDetail';
import LoginForm from './components/auth/LoginForm';
import RegisterForm from './components/auth/RegisterForm';
import ForgotPassword from './components/auth/ForgotPassword';

// Components
import Header from './components/common/Header';
import Footer from './components/common/Footer';

// Styles
import './neu-theme.css';

// Northeastern University Theme Configuration
const neuTheme = {
  token: {
    colorPrimary: '#1e3a8a', // Midnight blue instead of red
    colorSuccess: '#10b981',
    colorWarning: '#f59e0b',
    colorError: '#ef4444',
    colorInfo: '#3b82f6',
    borderRadius: 12,
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  },
  algorithm: theme.defaultAlgorithm,
  components: {
    Button: {
      borderRadius: 12,
      fontWeight: 600,
      boxShadow: '0 4px 12px rgba(30, 58, 138, 0.15)',
    },
    Card: {
      borderRadius: 16,
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
    },
    Input: {
      borderRadius: 12,
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
    },
    Select: {
      borderRadius: 12,
    },
    Modal: {
      borderRadius: 16,
    },
  },
};

function App() {
  return (
    <ConfigProvider theme={neuTheme}>
      <AuthProvider>
        <ChatProvider>
          <Router>
            <div className="app">
              <Header />
              <main className="main-content">
                <Routes>
                  {/* Public Routes */}
                  <Route path="/login" element={<LoginForm />} />
                  <Route path="/register" element={<RegisterForm />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  
                  {/* Protected Routes */}
                  <Route 
                    path="/dashboard" 
                    element={
                      <ProtectedRoute>
                        <Dashboard />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/resources" 
                    element={
                      <ProtectedRoute>
                        <Resources />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/chat" 
                    element={
                      <ProtectedRoute>
                        <Chat />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/profile" 
                    element={
                      <ProtectedRoute>
                        <Profile />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/housing/:id" 
                    element={
                      <ProtectedRoute>
                        <HousingDetail />
                      </ProtectedRoute>
                    } 
                  />
                  
                  {/* Default Route */}
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                </Routes>
              </main>
              <Footer />
            </div>
          </Router>
        </ChatProvider>
      </AuthProvider>
    </ConfigProvider>
  );
}

export default App; 