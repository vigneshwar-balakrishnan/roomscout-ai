import React, { useState } from 'react';
import { Form, Input, Button, Typography, Divider, Checkbox, Row, Col } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, HomeOutlined, SearchOutlined, MessageOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const { Title, Text, Paragraph } = Typography;

const LoginForm = () => {
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const result = await login(values.email, values.password);
      if (result.success) {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex',
      background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 50%, #1e40af 100%)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background Pattern */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
        opacity: 0.3
      }} />
      
      <Row style={{ width: '100%', height: '100vh' }}>
        {/* Left Side - Hero Section */}
        <Col xs={0} lg={14} style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'center', 
          padding: '60px',
          color: 'white',
          position: 'relative',
          zIndex: 2
        }}>
          <div style={{ maxWidth: '600px' }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              marginBottom: '32px',
              fontSize: '48px',
              fontWeight: '700'
            }}>
              <HomeOutlined style={{ marginRight: '16px', color: '#fbbf24' }} />
              RoomScout AI
            </div>
            
            <Title level={1} style={{ 
              color: 'white', 
              marginBottom: '24px',
              fontSize: '56px',
              fontWeight: '800',
              lineHeight: '1.1'
            }}>
              Find Your Perfect
              <br />
              <span style={{ color: '#fbbf24' }}>Housing Match</span>
            </Title>
            
            <Paragraph style={{ 
              fontSize: '20px', 
              color: 'rgba(255, 255, 255, 0.9)',
              marginBottom: '40px',
              lineHeight: '1.6'
            }}>
              Powered by AI to help Northeastern students discover the best housing options in Boston. 
              Get personalized recommendations, chat with our AI assistant, and find your ideal home.
            </Paragraph>
            
            <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <SearchOutlined style={{ fontSize: '24px', color: '#fbbf24' }} />
                <Text style={{ color: 'white', fontSize: '16px' }}>Smart Search</Text>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <MessageOutlined style={{ fontSize: '24px', color: '#fbbf24' }} />
                <Text style={{ color: 'white', fontSize: '16px' }}>AI Assistant</Text>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <HomeOutlined style={{ fontSize: '24px', color: '#fbbf24' }} />
                <Text style={{ color: 'white', fontSize: '16px' }}>Verified Listings</Text>
              </div>
            </div>
          </div>
        </Col>
        
        {/* Right Side - Login Form */}
        <Col xs={24} lg={10} style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          padding: '40px',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          position: 'relative',
          zIndex: 2
        }}>
          <div style={{ width: '100%', maxWidth: '400px' }}>
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
              <Title level={2} style={{ 
                color: '#1e3a8a', 
                marginBottom: '8px',
                fontWeight: '700',
                fontSize: '32px'
              }}>
                Welcome Back
              </Title>
              <Text style={{ 
                color: '#6b7280',
                fontSize: '16px',
                fontWeight: '400'
              }}>
                Sign in to access your personalized housing recommendations
              </Text>
            </div>

            <Form
              name="login"
              onFinish={onFinish}
              autoComplete="off"
              layout="vertical"
              size="large"
              style={{ marginBottom: '24px' }}
            >
              <Form.Item
                name="email"
                rules={[
                  { required: true, message: 'Please enter your email!' },
                  { type: 'email', message: 'Please enter a valid email!' }
                ]}
              >
                <Input
                  prefix={<MailOutlined style={{ color: '#9ca3af' }} />}
                  placeholder="Email address"
                  style={{
                    height: '56px',
                    borderRadius: '12px',
                    border: '2px solid #e5e7eb',
                    fontSize: '16px',
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(10px)',
                    transition: 'all 0.3s ease'
                  }}
                />
              </Form.Item>

              <Form.Item
                name="password"
                rules={[
                  { required: true, message: 'Please enter your password!' },
                  { min: 6, message: 'Password must be at least 6 characters!' }
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined style={{ color: '#9ca3af' }} />}
                  placeholder="Password"
                  style={{
                    height: '56px',
                    borderRadius: '12px',
                    border: '2px solid #e5e7eb',
                    fontSize: '16px',
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(10px)',
                    transition: 'all 0.3s ease'
                  }}
                />
              </Form.Item>

              <Form.Item>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  marginBottom: '24px'
                }}>
                  <Checkbox 
                    checked={rememberMe} 
                    onChange={(e) => setRememberMe(e.target.checked)}
                    style={{ color: '#6b7280' }}
                  >
                    Remember me
                  </Checkbox>
                  <Link 
                    to="/forgot-password" 
                    style={{ 
                      color: '#1e3a8a', 
                      textDecoration: 'none',
                      fontWeight: '500',
                      fontSize: '14px'
                    }}
                  >
                    Forgot password?
                  </Link>
                </div>
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  style={{
                    width: '100%',
                    height: '56px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
                    border: 'none',
                    fontSize: '16px',
                    fontWeight: '600',
                    boxShadow: '0 8px 24px rgba(30, 58, 138, 0.25)',
                    transition: 'all 0.3s ease'
                  }}
                >
                  Sign In
                </Button>
              </Form.Item>
            </Form>

            <Divider style={{ color: '#9ca3af', fontSize: '14px' }}>
              Don't have an account?
            </Divider>

            <Button
              type="default"
              style={{
                width: '100%',
                height: '56px',
                borderRadius: '12px',
                border: '2px solid #1e3a8a',
                color: '#1e3a8a',
                fontSize: '16px',
                fontWeight: '600',
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(10px)',
                transition: 'all 0.3s ease'
              }}
            >
              <Link to="/register" style={{ color: 'inherit', textDecoration: 'none' }}>
                Create Account
              </Link>
            </Button>

            <div style={{ 
              marginTop: '32px', 
              padding: '20px',
              background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
              borderRadius: '12px',
              border: '1px solid #f59e0b'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <UserOutlined style={{ color: '#92400e', fontSize: '16px' }} />
                <Text style={{ color: '#92400e', fontWeight: '600', fontSize: '14px' }}>
                  Demo Account
                </Text>
              </div>
              <Text style={{ color: '#92400e', fontSize: '14px', lineHeight: '1.5' }}>
                Email: ramsamy@test.com<br />
                Password: password123
              </Text>
            </div>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default LoginForm; 