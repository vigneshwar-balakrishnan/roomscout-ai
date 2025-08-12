import React, { useState } from 'react';
import { Form, Input, Button, Typography, Divider, Row, Col } from 'antd';
import { MailOutlined, ArrowLeftOutlined, HomeOutlined, SearchOutlined, MessageOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';

const { Title, Text, Paragraph } = Typography;

const ForgotPassword = () => {
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      setEmailSent(true);
    } catch (error) {
      console.error('Password reset error:', error);
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
              Reset Your
              <br />
              <span style={{ color: '#fbbf24' }}>Password</span>
            </Title>
            
            <Paragraph style={{ 
              fontSize: '20px', 
              color: 'rgba(255, 255, 255, 0.9)',
              marginBottom: '40px',
              lineHeight: '1.6'
            }}>
              Don't worry! We'll help you get back into your account. 
              Enter your email and we'll send you reset instructions.
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
        
        {/* Right Side - Forgot Password Form */}
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
                Reset Password
              </Title>
              <Text style={{ 
                color: '#6b7280',
                fontSize: '16px',
                fontWeight: '400'
              }}>
                Enter your email to receive reset instructions
              </Text>
            </div>

            {emailSent ? (
              <div style={{ textAlign: 'center' }}>
                <div style={{ 
                  marginBottom: '24px',
                  padding: '20px',
                  background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
                  borderRadius: '12px',
                  border: '1px solid #10b981'
                }}>
                  <MailOutlined style={{ 
                    fontSize: '48px', 
                    color: '#10b981',
                    marginBottom: '16px'
                  }} />
                  <Title level={4} style={{ color: '#10b981', marginBottom: '8px' }}>
                    Email Sent!
                  </Title>
                  <Text style={{ color: '#065f46', fontSize: '14px' }}>
                    We've sent password reset instructions to your email address.
                    Please check your inbox and follow the link to reset your password.
                  </Text>
                </div>
                
                <div style={{ marginTop: '24px' }}>
                  <Link to="/login">
                    <Button 
                      type="primary"
                      icon={<ArrowLeftOutlined />}
                      style={{ 
                        background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
                        borderColor: '#1e3a8a',
                        borderRadius: '12px',
                        height: '48px',
                        padding: '0 24px',
                        fontSize: '16px',
                        fontWeight: '600',
                        boxShadow: '0 8px 24px rgba(30, 58, 138, 0.25)',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      Back to Login
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <>
                <Form
                  name="forgotPassword"
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
                      Send Reset Email
                    </Button>
                  </Form.Item>
                </Form>

                <Divider style={{ color: '#9ca3af', fontSize: '14px' }}>
                  Remember your password?
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
                    Back to Login
                  </Link>
                </Button>

                <div style={{ 
                  marginTop: '32px', 
                  padding: '20px',
                  background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
                  borderRadius: '12px',
                  border: '1px solid #3b82f6'
                }}>
                  <Text style={{ 
                    fontSize: '14px',
                    color: '#1e40af',
                    lineHeight: '1.5'
                  }}>
                    <strong style={{ color: '#1e3a8a' }}>Need help?</strong> If you don't receive the email within a few minutes, check your spam folder or contact our support team.
                  </Text>
                </div>
              </>
            )}
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default ForgotPassword; 