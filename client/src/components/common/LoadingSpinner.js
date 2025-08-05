import React from 'react';
import { Spin, Typography } from 'antd';

const { Text } = Typography;

const LoadingSpinner = ({ 
  size = 'large', 
  text = 'Loading...', 
  fullScreen = false,
  className = ''
}) => {
  const spinnerContent = (
    <div style={{ textAlign: 'center' }}>
      <Spin 
        size={size} 
        className={`neu-spinner ${className}`}
        style={{ marginBottom: '16px' }}
      />
      {text && (
        <Text type="secondary" style={{ fontSize: '14px' }}>
          {text}
        </Text>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999
      }}>
        {spinnerContent}
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '40px 20px'
    }}>
      {spinnerContent}
    </div>
  );
};

export default LoadingSpinner; 