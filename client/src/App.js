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
    colorPrimary: '#C8102E',
    colorSuccess: '#52c41a',
    colorWarning: '#faad14',
    colorError: '#ff4d4f',
    colorInfo: '#1890ff',
    borderRadius: 6,
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  },
  algorithm: theme.defaultAlgorithm,
  components: {
    Button: {
      borderRadius: 6,
      fontWeight: 500,
    },
    Card: {
      borderRadius: 8,
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    },
    Input: {
      borderRadius: 6,
    },
    Select: {
      borderRadius: 6,
    },
    Modal: {
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