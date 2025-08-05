import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, Divider, Checkbox } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const { Title, Text } = Typography;

const RegisterForm = () => {
  const [loading, setLoading] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const onFinish = async (values) => {
    if (!agreeToTerms) {
      return;
    }
    
    setLoading(true);
    try {
      const result = await register(values);
      if (result.success) {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Registration error:', error);
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
            Join RoomScout AI
          </Title>
          <Text style={{ 
            color: '#666',
            fontSize: '14px',
            fontWeight: '400'
          }}>
            Create your account in just a few steps
          </Text>
        </div>

        <Form
          name="register"
          onFinish={onFinish}
          autoComplete="off"
          layout="vertical"
          size="large"
          style={{ marginBottom: '24px' }}
        >
          <div style={{ display: 'flex', gap: '16px' }}>
            <Form.Item
              name="firstName"
              rules={[
                { required: true, message: 'First name is required' },
                { min: 2, message: 'First name must be at least 2 characters' }
              ]}
              style={{ flex: 1 }}
            >
              <Input
                prefix={<UserOutlined style={{ color: '#999' }} />}
                placeholder="First Name"
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
              name="lastName"
              rules={[
                { required: true, message: 'Last name is required' },
                { min: 2, message: 'Last name must be at least 2 characters' }
              ]}
              style={{ flex: 1 }}
            >
              <Input
                prefix={<UserOutlined style={{ color: '#999' }} />}
                placeholder="Last Name"
                className="neu-input"
                style={{
                  height: '48px',
                  borderRadius: '8px',
                  border: '1px solid #e1e5e9',
                  fontSize: '14px'
                }}
              />
            </Form.Item>
          </div>

          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'Email is required' },
              { type: 'email', message: 'Please enter a valid email address' }
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
              { required: true, message: 'Password is required' },
              { min: 6, message: 'Password must be at least 6 characters' }
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

          <Form.Item
            name="confirmPassword"
            dependencies={['password']}
            rules={[
              { required: true, message: 'Please confirm your password' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Passwords do not match'));
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: '#999' }} />}
              placeholder="Confirm Password"
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
            <Checkbox 
              checked={agreeToTerms}
              onChange={(e) => setAgreeToTerms(e.target.checked)}
              style={{ color: '#666', fontSize: '14px' }}
            >
              I agree to the{' '}
              <Link to="/terms" style={{ color: '#C8102E' }}>
                Terms of Service
              </Link>
              {' '}and{' '}
              <Link to="/privacy" style={{ color: '#C8102E' }}>
                Privacy Policy
              </Link>
            </Checkbox>
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              disabled={!agreeToTerms}
              className="neu-button-primary"
              style={{ 
                width: '100%', 
                height: '48px',
                backgroundColor: agreeToTerms ? '#C8102E' : '#ccc',
                borderColor: agreeToTerms ? '#C8102E' : '#ccc',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '500',
                boxShadow: agreeToTerms ? '0 2px 8px rgba(200, 16, 46, 0.3)' : 'none',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                if (agreeToTerms) {
                  e.target.style.backgroundColor = '#B00020';
                  e.target.style.boxShadow = '0 4px 12px rgba(200, 16, 46, 0.4)';
                }
              }}
              onMouseLeave={(e) => {
                if (agreeToTerms) {
                  e.target.style.backgroundColor = '#C8102E';
                  e.target.style.boxShadow = '0 2px 8px rgba(200, 16, 46, 0.3)';
                }
              }}
            >
              Create Account
            </Button>
          </Form.Item>
        </Form>

        <Divider style={{ margin: '24px 0', color: '#999' }}>
          <Text style={{ color: '#666', fontSize: '14px' }}>
            Already have an account?
          </Text>
        </Divider>

        <div style={{ textAlign: 'center' }}>
          <Link to="/login">
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
              Sign In
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
            <strong style={{ color: '#C8102E' }}>Secure & Simple</strong> Your account is protected with industry-standard security. We'll never share your personal information.
          </Text>
        </div>
      </Card>
    </div>
  );
};

export default RegisterForm; 