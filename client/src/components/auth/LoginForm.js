import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, Divider, Alert, Checkbox } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const { Title, Text } = Typography;

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
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #C8102E 0%, #A00020 100%)',
      padding: '20px'
    }}>
      <Card 
        className="neu-card"
        style={{ 
          width: '100%', 
          maxWidth: '450px',
          boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)',
          borderRadius: '12px',
          border: 'none',
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <Title level={2} style={{ 
            color: '#C8102E', 
            marginBottom: '8px',
            fontWeight: '600',
            fontSize: '28px'
          }}>
            RoomScout AI
          </Title>
          <Text style={{ 
            color: '#666',
            fontSize: '14px',
            fontWeight: '400'
          }}>
            Smart Housing Assistant
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
              prefix={<MailOutlined style={{ color: '#999' }} />}
              placeholder="Email address"
              className="neu-input"
              style={{
                height: '48px',
                borderRadius: '8px',
                border: '1px solid #e1e5e9',
                fontSize: '14px'
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
              prefix={<LockOutlined style={{ color: '#999' }} />}
              placeholder="Password"
              className="neu-input"
              style={{
                height: '48px',
                borderRadius: '8px',
                border: '1px solid #e1e5e9',
                fontSize: '14px'
              }}
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: '24px' }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '16px'
            }}>
              <Checkbox 
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{ color: '#666' }}
              >
                Remember me
              </Checkbox>
              <Link to="/forgot-password" style={{ color: '#C8102E', fontSize: '14px' }}>
                Forgot password?
              </Link>
            </div>
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              className="neu-button-primary"
              style={{ 
                width: '100%', 
                height: '48px',
                backgroundColor: '#C8102E',
                borderColor: '#C8102E',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '500',
                boxShadow: '0 2px 8px rgba(200, 16, 46, 0.3)',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#B00020';
                e.target.style.boxShadow = '0 4px 12px rgba(200, 16, 46, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#C8102E';
                e.target.style.boxShadow = '0 2px 8px rgba(200, 16, 46, 0.3)';
              }}
            >
              Sign In
            </Button>
          </Form.Item>
        </Form>

        <Divider style={{ margin: '24px 0', color: '#999' }}>
          <Text style={{ color: '#666', fontSize: '14px' }}>
            Don't have an account?
          </Text>
        </Divider>

        <div style={{ textAlign: 'center' }}>
          <Link to="/register">
            <Button 
              type="link" 
              className="neu-button-secondary"
              style={{ 
                color: '#C8102E',
                fontSize: '14px',
                fontWeight: '500',
                padding: '8px 16px',
                borderRadius: '6px',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = 'rgba(200, 16, 46, 0.05)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent';
              }}
            >
              Create Account
            </Button>
          </Link>
        </div>

        <div style={{ 
          marginTop: '24px', 
          padding: '16px', 
          backgroundColor: 'rgba(200, 16, 46, 0.05)', 
          borderRadius: '8px',
          border: '1px solid rgba(200, 16, 46, 0.1)'
        }}>
          <Text style={{ 
            fontSize: '12px',
            color: '#666',
            lineHeight: '1.4'
          }}>
            <strong style={{ color: '#C8102E' }}>Welcome back!</strong> Sign in to access your personalized housing recommendations and chat with our AI assistant.
          </Text>
        </div>
      </Card>
    </div>
  );
};

export default LoginForm; 