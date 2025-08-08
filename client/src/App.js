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
    colorPrimary: '#667eea', // Modern blue-purple gradient
    colorSuccess: '#22c55e',
    colorWarning: '#f59e0b',
    colorError: '#ef4444',
    colorInfo: '#0ea5e9',
    borderRadius: 16,
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    fontSize: 14,
    fontWeight: 500,
  },
  algorithm: theme.defaultAlgorithm,
  components: {
    Button: {
      borderRadius: 20,
      fontWeight: 600,
      boxShadow: '0 4px 12px rgba(102, 126, 234, 0.15)',
      border: 'none',
      height: 'auto',
      padding: '12px 24px',
      fontSize: 14,
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    },
    Card: {
      borderRadius: 20,
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
      border: '1px solid rgba(102, 126, 234, 0.1)',
    },
    Input: {
      borderRadius: 16,
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
      border: '2px solid rgba(102, 126, 234, 0.1)',
      padding: '12px 16px',
      fontSize: 14,
      transition: 'all 0.3s ease',
    },
    Select: {
      borderRadius: 16,
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
    },
    Modal: {
      borderRadius: 20,
      boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
    },
    Drawer: {
      borderRadius: 20,
    },
    Menu: {
      borderRadius: 12,
      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
    },
    Dropdown: {
      borderRadius: 12,
      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
    },
    Tooltip: {
      borderRadius: 8,
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    },
    Notification: {
      borderRadius: 16,
      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
    },
    Alert: {
      borderRadius: 16,
      border: '1px solid rgba(102, 126, 234, 0.1)',
    },
    Tag: {
      borderRadius: 8,
      fontSize: 12,
      fontWeight: 500,
    },
    Avatar: {
      borderRadius: 12,
    },
    Badge: {
      borderRadius: 8,
    },
    Progress: {
      borderRadius: 8,
    },
    Slider: {
      borderRadius: 8,
    },
    Switch: {
      borderRadius: 12,
    },
    Checkbox: {
      borderRadius: 4,
    },
    Radio: {
      borderRadius: 4,
    },
    Rate: {
      fontSize: 16,
    },
    Upload: {
      borderRadius: 16,
    },
    Table: {
      borderRadius: 12,
      headerBg: 'rgba(102, 126, 234, 0.05)',
    },
    Pagination: {
      borderRadius: 12,
    },
    Steps: {
      borderRadius: 12,
    },
    Timeline: {
      borderRadius: 12,
    },
    Tabs: {
      borderRadius: 12,
    },
    Collapse: {
      borderRadius: 12,
    },
    Descriptions: {
      borderRadius: 12,
    },
    List: {
      borderRadius: 12,
    },
    Comment: {
      borderRadius: 12,
    },
    Statistic: {
      borderRadius: 12,
    },
    Result: {
      borderRadius: 16,
    },
    Empty: {
      borderRadius: 16,
    },
    Skeleton: {
      borderRadius: 8,
    },
    Spin: {
      borderRadius: 8,
    },
    Anchor: {
      borderRadius: 8,
    },
    BackTop: {
      borderRadius: 12,
    },
    Affix: {
      borderRadius: 12,
    },
    Anchor: {
      borderRadius: 8,
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