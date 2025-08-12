import React, { useState } from 'react';
import { Form, Input, Button, Typography, Divider, Checkbox, Row, Col } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, HomeOutlined, SearchOutlined, MessageOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const { Title, Text, Paragraph } = Typography;

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
              Join Our
              <br />
              <span style={{ color: '#fbbf24' }}>Housing Community</span>
            </Title>
            
            <Paragraph style={{ 
              fontSize: '20px', 
              color: 'rgba(255, 255, 255, 0.9)',
              marginBottom: '40px',
              lineHeight: '1.6'
            }}>
              Create your account and start your journey to finding the perfect housing in Boston. 
              Get access to AI-powered recommendations, verified listings, and personalized assistance.
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
        
        {/* Right Side - Registration Form */}
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
                Create Account
              </Title>
              <Text style={{ 
                color: '#6b7280',
                fontSize: '16px',
                fontWeight: '400'
              }}>
                Join RoomScout AI in just a few steps
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
                    prefix={<UserOutlined style={{ color: '#9ca3af' }} />}
                    placeholder="First Name"
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
                  name="lastName"
                  rules={[
                    { required: true, message: 'Last name is required' },
                    { min: 2, message: 'Last name must be at least 2 characters' }
                  ]}
                  style={{ flex: 1 }}
                >
                  <Input
                    prefix={<UserOutlined style={{ color: '#9ca3af' }} />}
                    placeholder="Last Name"
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
              </div>

              <Form.Item
                name="email"
                rules={[
                  { required: true, message: 'Email is required' },
                  { type: 'email', message: 'Please enter a valid email address' }
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
                  { required: true, message: 'Password is required' },
                  { min: 6, message: 'Password must be at least 6 characters' }
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
                  prefix={<LockOutlined style={{ color: '#9ca3af' }} />}
                  placeholder="Confirm Password"
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

              <Form.Item style={{ marginBottom: '24px' }}>
                <Checkbox 
                  checked={agreeToTerms}
                  onChange={(e) => setAgreeToTerms(e.target.checked)}
                  style={{ color: '#6b7280', fontSize: '14px' }}
                >
                  I agree to the{' '}
                  <Link to="/terms" style={{ color: '#1e3a8a' }}>
                    Terms of Service
                  </Link>
                  {' '}and{' '}
                  <Link to="/privacy" style={{ color: '#1e3a8a' }}>
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
                  style={{
                    width: '100%',
                    height: '56px',
                    borderRadius: '12px',
                    background: agreeToTerms ? 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)' : '#9ca3af',
                    border: 'none',
                    fontSize: '16px',
                    fontWeight: '600',
                    boxShadow: agreeToTerms ? '0 8px 24px rgba(30, 58, 138, 0.25)' : 'none',
                    transition: 'all 0.3s ease',
                    opacity: agreeToTerms ? 1 : 0.6
                  }}
                >
                  Create Account
                </Button>
              </Form.Item>
            </Form>

            <Divider style={{ color: '#9ca3af', fontSize: '14px' }}>
              Already have an account?
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
              <Link to="/login" style={{ color: 'inherit', textDecoration: 'none' }}>
                Sign In
              </Link>
            </Button>

            <div style={{ 
              marginTop: '32px', 
              padding: '20px',
              background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
              borderRadius: '12px',
              border: '1px solid #3b82f6'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <UserOutlined style={{ color: '#1e40af', fontSize: '16px' }} />
                <Text style={{ color: '#1e40af', fontWeight: '600', fontSize: '14px' }}>
                  Secure & Simple
                </Text>
              </div>
              <Text style={{ color: '#1e40af', fontSize: '14px', lineHeight: '1.5' }}>
                Your account is protected with industry-standard security. We'll never share your personal information.
              </Text>
            </div>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default RegisterForm; 