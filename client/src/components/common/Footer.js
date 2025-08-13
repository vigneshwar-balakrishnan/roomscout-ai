import React from 'react';
import { Layout, Typography, Space } from 'antd';
import { 
  GithubOutlined, 
  LinkedinOutlined, 
  MailOutlined
} from '@ant-design/icons';

const { Footer: AntFooter } = Layout;
const { Text, Link } = Typography;

const Footer = () => {
  return (
    <AntFooter className="neu-footer" style={{ 
      textAlign: 'center',
      padding: '16px 24px',
      background: 'linear-gradient(135deg, var(--neutral-800) 0%, var(--neutral-900) 100%)',
      borderTop: '1px solid var(--neutral-700)'
    }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <Space direction="vertical" size="small" style={{ width: '100%' }}>
          {/* Minimal Brand & Links */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            flexWrap: 'wrap',
            gap: '16px'
          }}>
            <div style={{ textAlign: 'left' }}>
              <Text style={{ 
                color: 'var(--neutral-100)', 
                fontSize: '14px', 
                fontWeight: '600',
                letterSpacing: '0.5px'
              }}>
                RoomScout AI
              </Text>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <Link 
                href="mailto:balakrishnan.vi@northeastern.edu" 
                style={{ 
                  color: 'var(--neutral-300)',
                  fontSize: '12px',
                  transition: 'color 0.2s ease'
                }}
                onMouseEnter={(e) => e.target.style.color = 'var(--primary-400)'}
                onMouseLeave={(e) => e.target.style.color = 'var(--neutral-300)'}
              >
                <MailOutlined style={{ marginRight: '4px' }} />
                Support
              </Link>
              
              <Link 
                href="https://github.com/vigu/roomscout-ai" 
                target="_blank" 
                style={{ 
                  color: 'var(--neutral-300)',
                  fontSize: '12px',
                  transition: 'color 0.2s ease'
                }}
                onMouseEnter={(e) => e.target.style.color = 'var(--primary-400)'}
                onMouseLeave={(e) => e.target.style.color = 'var(--neutral-300)'}
              >
                <GithubOutlined style={{ marginRight: '4px' }} />
                GitHub
              </Link>
              
              <Link 
                href="https://linkedin.com/in/vigneshwar-balakrishnan" 
                target="_blank" 
                style={{ 
                  color: 'var(--neutral-300)',
                  fontSize: '12px',
                  transition: 'color 0.2s ease'
                }}
                onMouseEnter={(e) => e.target.style.color = 'var(--primary-400)'}
                onMouseLeave={(e) => e.target.style.color = 'var(--primary-400)'}
              >
                <LinkedinOutlined style={{ marginRight: '4px' }} />
                LinkedIn
              </Link>
            </div>
          </div>

          {/* Crafted with love - centered */}
          <div style={{ 
            textAlign: 'center',
            marginTop: '8px'
          }}>
            <Text style={{ 
              color: 'var(--neutral-500)', 
              fontSize: '10px',
              letterSpacing: '0.2px'
            }}>
              Crafted with ❤️ by Vigneshwar Balakrishnan
            </Text>
          </div>

          {/* Minimal Copyright */}
          <div style={{ 
            borderTop: '1px solid var(--neutral-700)', 
            paddingTop: '12px',
            marginTop: '8px'
          }}>
            <Text style={{ 
              color: 'var(--neutral-400)', 
              fontSize: '11px',
              letterSpacing: '0.3px'
            }}>
              © 2024 RoomScout AI • Northeastern University Student Project
            </Text>
          </div>
        </Space>
      </div>
    </AntFooter>
  );
};

export default Footer; 