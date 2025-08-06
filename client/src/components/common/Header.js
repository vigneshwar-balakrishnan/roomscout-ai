import React, { useState } from 'react';
import { Layout, Menu, Button, Avatar, Dropdown, Typography } from 'antd';
import { 
  HomeOutlined, 
  MessageOutlined, 
  BookOutlined, 
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
  DownOutlined
} from '@ant-design/icons';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import NotificationCenter from './NotificationCenter';

const { Header: AntHeader } = Layout;
const { Text } = Typography;

const Header = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedKey, setSelectedKey] = useState(location.pathname);

  const handleMenuClick = ({ key }) => {
    setSelectedKey(key);
    navigate(key);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Profile',
      onClick: () => navigate('/profile')
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Settings'
    },
    {
      type: 'divider'
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      onClick: handleLogout
    }
  ];

  const menuItems = [
    {
      key: '/dashboard',
      icon: <HomeOutlined />,
      label: 'Dashboard'
    },
    {
      key: '/chat',
      icon: <MessageOutlined />,
      label: 'AI Chat'
    },
    {
      key: '/resources',
      icon: <BookOutlined />,
      label: 'Resources'
    }
  ];

  if (!isAuthenticated) {
    return null; // Don't show header for unauthenticated users
  }

  return (
    <AntHeader className="neu-header" style={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'space-between',
      padding: '0 24px',
      height: '64px'
    }}>
      {/* Logo and Brand */}
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Link to="/dashboard" className="neu-logo">
          RoomScout AI
        </Link>
        <Text style={{ 
          color: 'rgba(255, 255, 255, 0.8)', 
          marginLeft: '8px',
          fontSize: '12px'
        }}>
          Northeastern University
        </Text>
      </div>

      {/* Navigation Menu */}
      <Menu
        mode="horizontal"
        selectedKeys={[selectedKey]}
        onClick={handleMenuClick}
        items={menuItems}
        style={{
          background: 'transparent',
          border: 'none',
          flex: 1,
          justifyContent: 'center'
        }}
        className="neu-nav"
      />

      {/* User Menu */}
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {/* Notification Center */}
        <NotificationCenter />
        
        {user?.isEduEmail && (
          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            padding: '4px 8px',
            borderRadius: '4px',
            marginRight: '12px'
          }}>
            <Text style={{ color: 'white', fontSize: '12px' }}>
              .edu Verified
            </Text>
          </div>
        )}
        
        <Dropdown
          menu={{ items: userMenuItems }}
          placement="bottomRight"
          trigger={['click']}
        >
          <Button 
            type="text" 
            style={{ 
              color: 'white', 
              display: 'flex', 
              alignItems: 'center',
              height: '40px'
            }}
          >
            <Avatar 
              size="small" 
              style={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                marginRight: '8px'
              }}
            >
              {user?.firstName?.charAt(0) || 'U'}
            </Avatar>
            <Text style={{ color: 'white', marginRight: '4px' }}>
              {user?.firstName || 'User'}
            </Text>
            <DownOutlined style={{ color: 'white' }} />
          </Button>
        </Dropdown>
      </div>
    </AntHeader>
  );
};

export default Header; 