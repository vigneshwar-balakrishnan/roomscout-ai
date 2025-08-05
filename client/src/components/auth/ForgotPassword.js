import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, Divider, Alert } from 'antd';
import { MailOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';

const { Title, Text } = Typography;

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
            Reset Password
          </Title>
          <Text style={{ 
            color: '#666',
            fontSize: '14px',
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
              backgroundColor: 'rgba(82, 196, 26, 0.1)',
              borderRadius: '8px',
              border: '1px solid rgba(82, 196, 26, 0.2)'
            }}>
              <MailOutlined style={{ 
                fontSize: '48px', 
                color: '#52c41a',
                marginBottom: '16px'
              }} />
              <Title level={4} style={{ color: '#52c41a', marginBottom: '8px' }}>
                Email Sent!
              </Title>
              <Text style={{ color: '#666', fontSize: '14px' }}>
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
                    backgroundColor: '#C8102E',
                    borderColor: '#C8102E',
                    borderRadius: '8px',
                    height: '40px',
                    padding: '0 24px'
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
                  Send Reset Email
                </Button>
              </Form.Item>
            </Form>

            <Divider style={{ margin: '24px 0', color: '#999' }}>
              <Text style={{ color: '#666', fontSize: '14px' }}>
                Remember your password?
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
                  Back to Login
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
                <strong style={{ color: '#C8102E' }}>Need help?</strong> If you don't receive the email within a few minutes, check your spam folder or contact our support team.
              </Text>
            </div>
          </>
        )}
      </Card>
    </div>
  );
};

export default ForgotPassword; 