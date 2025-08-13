import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Typography, 
  Form, 
  Input, 
  Button, 
  Space, 
  Tag, 
  Row,
  Col,
  Statistic,
  Alert,
  Select,
  Checkbox,
  message
} from 'antd';
import { 
  UserOutlined, 
  MailOutlined, 
  SafetyOutlined, 
  DollarOutlined,
  CheckCircleOutlined,
  EditOutlined,
  SaveOutlined
} from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import { useChat } from '../contexts/ChatContext';

const { Title, Text } = Typography;
const { Option } = Select;

const Profile = () => {
  const { user, updateProfile, verifyEmail } = useAuth();
  const { sessions } = useChat();
  const [form] = Form.useForm();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      form.setFieldsValue({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        preferences: user.preferences
      });
    }
  }, [user, form]);

  const handleUpdateProfile = async (values) => {
    try {
      setLoading(true);
      await updateProfile(values);
      setEditing(false);
      message.success('Profile updated successfully!');
    } catch (error) {
      console.error('Update profile error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyEmail = async () => {
    try {
      await verifyEmail();
      message.success('Email verification sent!');
    } catch (error) {
      console.error('Email verification error:', error);
    }
  };

  const getAccountStatus = () => {
    if (user?.isVerified) {
      return { status: 'success', text: 'Verified Account', icon: <CheckCircleOutlined /> };
    } else if (user?.isEduEmail) {
      return { status: 'warning', text: 'Pending Verification', icon: <SafetyOutlined /> };
    } else {
      return { status: 'error', text: 'Unverified Account', icon: <SafetyOutlined /> };
    }
  };

  const accountStatus = getAccountStatus();

  return (
    <div className="fade-in">
      {/* Profile Header */}
      <Card className="neu-card" style={{ marginBottom: '24px' }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} md={16}>
            <Space direction="vertical">
              <Title level={2} style={{ color: '#C8102E', margin: 0 }}>
                <UserOutlined /> Profile
              </Title>
              <Text type="secondary">
                Manage your account and housing preferences
              </Text>
            </Space>
          </Col>
          <Col xs={24} md={8} style={{ textAlign: 'right' }}>
            <Space direction="vertical">
              <Tag color={accountStatus.status} icon={accountStatus.icon}>
                {accountStatus.text}
              </Tag>
              {user?.isEduEmail && (
                <Tag color="green">
                  .edu Email
                </Tag>
              )}
            </Space>
          </Col>
        </Row>
      </Card>

      <Row gutter={[24, 24]}>
        {/* Profile Information */}
        <Col xs={24} lg={16}>
          <Card className="neu-card" title="Profile Information">
            {!user?.isVerified && (
              <Alert
                message="Email Verification Required"
                description="Please verify your email address to access all features."
                type="warning"
                showIcon
                action={
                  <Button size="small" onClick={handleVerifyEmail}>
                    Verify Email
                  </Button>
                }
                style={{ marginBottom: '16px' }}
              />
            )}

            <Form
              form={form}
              layout="vertical"
              onFinish={handleUpdateProfile}
              disabled={!editing}
            >
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="firstName"
                    label="First Name"
                    rules={[{ required: true, message: 'Please enter your first name!' }]}
                  >
                    <Input 
                      prefix={<UserOutlined />} 
                      placeholder="First Name"
                      className="neu-input"
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="lastName"
                    label="Last Name"
                    rules={[{ required: true, message: 'Please enter your last name!' }]}
                  >
                    <Input 
                      prefix={<UserOutlined />} 
                      placeholder="Last Name"
                      className="neu-input"
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                name="email"
                label="Email Address"
              >
                <Input 
                  prefix={<MailOutlined />} 
                  placeholder="Email"
                  disabled
                  className="neu-input"
                />
              </Form.Item>

              <Form.Item>
                <Space>
                  {editing ? (
                    <>
                      <Button 
                        type="primary" 
                        htmlType="submit"
                        loading={loading}
                        icon={<SaveOutlined />}
                        className="neu-button-primary"
                      >
                        Save Changes
                      </Button>
                      <Button 
                        onClick={() => setEditing(false)}
                      >
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <Button 
                      type="primary" 
                      icon={<EditOutlined />}
                      onClick={() => setEditing(true)}
                      className="neu-button-primary"
                    >
                      Edit Profile
                    </Button>
                  )}
                </Space>
              </Form.Item>
            </Form>
          </Card>
        </Col>

        {/* Account Stats */}
        <Col xs={24} lg={8}>
          <Card className="neu-card" title="Account Statistics">
            <Space direction="vertical" style={{ width: '100%' }}>
              <Statistic
                title="Chat Sessions"
                value={sessions.length}
                prefix={<UserOutlined />}
                valueStyle={{ color: '#C8102E' }}
              />
              <Statistic
                title="Account Status"
                value={user?.isVerified ? 'Verified' : 'Unverified'}
                valueStyle={{ 
                  color: user?.isVerified ? '#52c41a' : '#ff4d4f',
                  fontSize: '16px'
                }}
              />
              <Statistic
                title="Member Since"
                value={user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                valueStyle={{ fontSize: '16px' }}
              />
            </Space>
          </Card>
        </Col>
      </Row>

      {/* Housing Preferences */}
      <Card className="neu-card" title="Housing Preferences" style={{ marginTop: '24px' }}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleUpdateProfile}
          disabled={!editing}
        >
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12}>
              <Form.Item
                name={['preferences', 'budget', 'min']}
                label="Minimum Budget"
              >
                <Input 
                  prefix={<DollarOutlined />} 
                  placeholder="Min Budget"
                  type="number"
                  className="neu-input"
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name={['preferences', 'budget', 'max']}
                label="Maximum Budget"
              >
                <Input 
                  prefix={<DollarOutlined />} 
                  placeholder="Max Budget"
                  type="number"
                  className="neu-input"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12}>
              <Form.Item
                name={['preferences', 'location']}
                label="Preferred Location"
              >
                <Select placeholder="Select location" className="neu-input">
                  <Option value="Boston">Boston</Option>
                  <Option value="Cambridge">Cambridge</Option>
                  <Option value="Somerville">Somerville</Option>
                  <Option value="Brookline">Brookline</Option>
                  <Option value="Allston-Brighton">Allston-Brighton</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name={['preferences', 'roomType']}
                label="Room Type"
              >
                <Select placeholder="Select room type" className="neu-input">
                  <Option value="single">Single Room</Option>
                  <Option value="double">Double Room</Option>
                  <Option value="studio">Studio</Option>
                  <Option value="1BR">1 Bedroom</Option>
                  <Option value="2BR">2 Bedroom</Option>
                  <Option value="3BR+">3+ Bedroom</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name={['preferences', 'amenities']}
            label="Preferred Amenities"
          >
            <Checkbox.Group>
              <Row gutter={[16, 8]}>
                <Col xs={24} sm={12}>
                  <Checkbox value="wifi">WiFi</Checkbox>
                </Col>
                <Col xs={24} sm={12}>
                  <Checkbox value="laundry">Laundry</Checkbox>
                </Col>
                <Col xs={24} sm={12}>
                  <Checkbox value="kitchen">Kitchen</Checkbox>
                </Col>
                <Col xs={24} sm={12}>
                  <Checkbox value="parking">Parking</Checkbox>
                </Col>
                <Col xs={24} sm={12}>
                  <Checkbox value="gym">Gym</Checkbox>
                </Col>
                <Col xs={24} sm={12}>
                  <Checkbox value="ac">Air Conditioning</Checkbox>
                </Col>
                <Col xs={24} sm={12}>
                  <Checkbox value="furnished">Furnished</Checkbox>
                </Col>
                <Col xs={24} sm={12}>
                  <Checkbox value="utilities_included">Utilities Included</Checkbox>
                </Col>
              </Row>
            </Checkbox.Group>
          </Form.Item>
        </Form>
      </Card>

      {/* Account Security */}
      <Card className="neu-card" title="Account Security" style={{ marginTop: '24px' }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12}>
            <Card size="small" title="Email Verification">
              <Space direction="vertical">
                <Text>
                  Status: {user?.isVerified ? 'Verified' : 'Not Verified'}
                </Text>
                {!user?.isVerified && (
                  <Button 
                    type="primary" 
                    size="small"
                    onClick={handleVerifyEmail}
                    className="neu-button-primary"
                  >
                    Verify Email
                  </Button>
                )}
              </Space>
            </Card>
          </Col>
          <Col xs={24} sm={12}>
            <Card size="small" title="Account Type">
              <Space direction="vertical">
                <Text>
                  Type: {user?.isEduEmail ? 'Student (.edu)' : 'Regular'}
                </Text>
                {user?.isEduEmail && (
                  <Tag color="green">Educational Email</Tag>
                )}
              </Space>
            </Card>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default Profile; 