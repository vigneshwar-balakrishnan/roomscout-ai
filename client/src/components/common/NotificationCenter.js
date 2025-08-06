import React, { useState, useEffect } from 'react';
import { 
  Badge, 
  Popover, 
  List, 
  Button, 
  Typography, 
  Space, 
  Empty, 
  Spin,
  Tag,
  message,
  Divider
} from 'antd';
import { 
  BellOutlined, 
  CheckOutlined, 
  DeleteOutlined,
  SettingOutlined,
  EyeOutlined
} from '@ant-design/icons';
import { notificationAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const { Text, Title } = Typography;

const NotificationCenter = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);

  // Load notifications
  const loadNotifications = async () => {
    try {
      setLoading(true);
      const response = await notificationAPI.getNotifications();
      setNotifications(response.data.notifications || []);
      
      // Get unread count
      const unreadResponse = await notificationAPI.getUnreadCount();
      setUnreadCount(unreadResponse.data.count || 0);
    } catch (error) {
      console.error('Error loading notifications:', error);
      message.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    try {
      await notificationAPI.markAsRead(notificationId);
      setNotifications(prev => 
        prev.map(notif => 
          notif._id === notificationId 
            ? { ...notif, isRead: true }
            : notif
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      await notificationAPI.markAllAsRead();
      setNotifications(prev => prev.map(notif => ({ ...notif, isRead: true })));
      setUnreadCount(0);
      message.success('All notifications marked as read');
    } catch (error) {
      console.error('Error marking all as read:', error);
      message.error('Failed to mark all as read');
    }
  };

  // Delete notification
  const deleteNotification = async (notificationId) => {
    try {
      await notificationAPI.deleteNotification(notificationId);
      setNotifications(prev => prev.filter(notif => notif._id !== notificationId));
      message.success('Notification deleted');
    } catch (error) {
      console.error('Error deleting notification:', error);
      message.error('Failed to delete notification');
    }
  };

  // Get notification icon based on type
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'new_listing':
        return '🏠';
      case 'price_change':
        return '💰';
      case 'availability_change':
        return '📅';
      case 'new_message':
        return '💬';
      case 'roommate_match':
        return '👥';
      case 'system_alert':
        return '⚠️';
      default:
        return '📢';
    }
  };

  // Get notification color based on priority
  const getNotificationColor = (priority) => {
    switch (priority) {
      case 'urgent':
        return '#ff4d4f';
      case 'high':
        return '#fa8c16';
      case 'medium':
        return '#1890ff';
      case 'low':
        return '#52c41a';
      default:
        return '#1890ff';
    }
  };

  // Format notification time
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  // Load notifications when popover opens
  useEffect(() => {
    if (visible) {
      loadNotifications();
    }
  }, [visible]);

  // Auto-refresh unread count
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const response = await notificationAPI.getUnreadCount();
        setUnreadCount(response.data.count || 0);
      } catch (error) {
        console.error('Error refreshing unread count:', error);
      }
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const notificationContent = (
    <div style={{ width: 400, maxHeight: 500 }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        padding: '8px 0',
        borderBottom: '1px solid #f0f0f0'
      }}>
        <Title level={5} style={{ margin: 0 }}>
          Notifications {unreadCount > 0 && `(${unreadCount} unread)`}
        </Title>
        <Space>
          {unreadCount > 0 && (
            <Button 
              size="small" 
              type="link" 
              onClick={markAllAsRead}
            >
              Mark all read
            </Button>
          )}
          <Button 
            size="small" 
            type="link" 
            icon={<SettingOutlined />}
            onClick={() => {/* TODO: Open notification settings */}}
          >
            Settings
          </Button>
        </Space>
      </div>
      
      <div style={{ maxHeight: 400, overflowY: 'auto' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <Spin />
          </div>
        ) : notifications.length === 0 ? (
          <Empty 
            description="No notifications" 
            style={{ padding: '20px' }}
          />
        ) : (
          <List
            dataSource={notifications}
            renderItem={(notification) => (
              <List.Item
                style={{
                  padding: '12px 0',
                  backgroundColor: notification.isRead ? 'transparent' : '#f6ffed',
                  borderBottom: '1px solid #f0f0f0'
                }}
                actions={[
                  !notification.isRead && (
                    <Button
                      type="link"
                      size="small"
                      icon={<CheckOutlined />}
                      onClick={() => markAsRead(notification._id)}
                    >
                      Mark read
                    </Button>
                  ),
                  <Button
                    type="link"
                    size="small"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => deleteNotification(notification._id)}
                  >
                    Delete
                  </Button>
                ].filter(Boolean)}
              >
                <List.Item.Meta
                  avatar={
                    <div style={{ fontSize: '20px' }}>
                      {getNotificationIcon(notification.type)}
                    </div>
                  }
                  title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Text strong={!notification.isRead}>
                        {notification.title}
                      </Text>
                      <Tag color={getNotificationColor(notification.priority)} size="small">
                        {notification.priority}
                      </Tag>
                      {!notification.isRead && (
                        <div style={{ 
                          width: '8px', 
                          height: '8px', 
                          borderRadius: '50%', 
                          backgroundColor: '#1890ff' 
                        }} />
                      )}
                    </div>
                  }
                  description={
                    <div>
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        {formatTime(notification.createdAt)}
                      </Text>
                      <br />
                      <Text>{notification.message}</Text>
                      {notification.data?.listingId && (
                        <div style={{ marginTop: '8px' }}>
                          <Button 
                            type="link" 
                            size="small" 
                            icon={<EyeOutlined />}
                            onClick={() => {/* TODO: Navigate to listing */}}
                          >
                            View Listing
                          </Button>
                        </div>
                      )}
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        )}
      </div>
    </div>
  );

  return (
    <Popover
      content={notificationContent}
      title={null}
      trigger="click"
      placement="bottomRight"
      visible={visible}
      onVisibleChange={setVisible}
      overlayStyle={{ width: 400 }}
    >
      <Badge count={unreadCount} offset={[-5, 5]}>
        <Button 
          type="text" 
          icon={<BellOutlined />} 
          size="large"
          style={{ color: unreadCount > 0 ? '#1890ff' : undefined }}
        />
      </Badge>
    </Popover>
  );
};

export default NotificationCenter; 