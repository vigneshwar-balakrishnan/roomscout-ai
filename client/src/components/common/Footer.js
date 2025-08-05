import React from 'react';
import { Layout, Typography, Space, Divider } from 'antd';
import { 
  GithubOutlined, 
  LinkedinOutlined, 
  MailOutlined,
  HomeOutlined
} from '@ant-design/icons';

const { Footer: AntFooter } = Layout;
const { Text, Link } = Typography;

const Footer = () => {
  return (
    <AntFooter className="neu-footer" style={{ 
      textAlign: 'center',
      padding: '24px 50px'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          {/* Main Footer Content */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ textAlign: 'left' }}>
              <Text style={{ color: 'white', fontSize: '16px', fontWeight: 'bold' }}>
                RoomScout AI
              </Text>
              <br />
              <Text style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '12px' }}>
                Northeastern University Housing Assistant
              </Text>
            </div>

            <div style={{ textAlign: 'center' }}>
              <Space size="large">
                <Link href="https://northeastern.edu" target="_blank" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  <HomeOutlined /> Northeastern University
                </Link>
                <Link href="mailto:support@roomscout-ai.com" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  <MailOutlined /> Contact Support
                </Link>
              </Space>
            </div>

            <div style={{ textAlign: 'right' }}>
              <Space size="middle">
                <Link href="https://github.com/roomscout-ai" target="_blank" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  <GithubOutlined style={{ fontSize: '18px' }} />
                </Link>
                <Link href="https://linkedin.com/company/roomscout-ai" target="_blank" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  <LinkedinOutlined style={{ fontSize: '18px' }} />
                </Link>
              </Space>
            </div>
          </div>

          <Divider style={{ borderColor: 'rgba(255, 255, 255, 0.2)', margin: '16px 0' }} />

          {/* Footer Links */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
            <div>
              <Space size="large">
                <Link href="/privacy" style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '12px' }}>
                  Privacy Policy
                </Link>
                <Link href="/terms" style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '12px' }}>
                  Terms of Service
                </Link>
                <Link href="/help" style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '12px' }}>
                  Help Center
                </Link>
              </Space>
            </div>

            <div>
              <Text style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '12px' }}>
                © 2024 RoomScout AI. All rights reserved.
              </Text>
            </div>
          </div>

          {/* Northeastern University Disclaimer */}
          <div style={{ 
            backgroundColor: 'rgba(255, 255, 255, 0.1)', 
            padding: '12px', 
            borderRadius: '6px',
            marginTop: '16px'
          }}>
            <Text style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '11px' }}>
              <strong>Disclaimer:</strong> RoomScout AI is a student project and is not officially affiliated with Northeastern University. 
              This platform is designed to assist Northeastern students in finding housing options in the Boston area.
            </Text>
          </div>
        </Space>
      </div>
    </AntFooter>
  );
};

export default Footer; 