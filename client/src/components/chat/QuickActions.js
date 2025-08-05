import React from 'react';
import { Button, Space, Typography } from 'antd';
import { 
    HomeOutlined, 
    SearchOutlined, 
    UploadOutlined, 
    QuestionCircleOutlined,
    DollarOutlined,
    EnvironmentOutlined,
    TeamOutlined
} from '@ant-design/icons';
import './QuickActions.css';

const { Text } = Typography;

const QuickActions = ({ onAction }) => {
    const quickActions = [
        {
            key: 'find-housing',
            icon: <HomeOutlined />,
            label: 'Find Housing',
            prompt: 'I\'m looking for housing near Northeastern University. What options do you recommend?',
            color: '#C8102E'
        },
        {
            key: 'upload-whatsapp',
            icon: <UploadOutlined />,
            label: 'Upload WhatsApp',
            prompt: 'I have a WhatsApp chat file with housing messages. Can you help me extract housing listings from it?',
            color: '#1890ff'
        },
        {
            key: 'budget-options',
            icon: <DollarOutlined />,
            label: 'Budget Options',
            prompt: 'What are the best housing options for students on a budget near NEU?',
            color: '#52c41a'
        },
        {
            key: 'roommate-finder',
            icon: <TeamOutlined />,
            label: 'Find Roommates',
            prompt: 'I\'m looking for roommates for next semester. How can I find compatible roommates?',
            color: '#722ed1'
        },
        {
            key: 'neighborhoods',
            icon: <EnvironmentOutlined />,
            label: 'Best Areas',
            prompt: 'What are the best neighborhoods for students near Northeastern University?',
            color: '#fa8c16'
        },
        {
            key: 'housing-tips',
            icon: <QuestionCircleOutlined />,
            label: 'Housing Tips',
            prompt: 'What should I know about finding housing as a Northeastern student?',
            color: '#13c2c2'
        }
    ];

    const handleActionClick = (action) => {
        if (onAction) {
            onAction(action);
        }
    };

    return (
        <div className="quick-actions">
            <div className="quick-actions-header">
                <Text strong>Quick Actions</Text>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                    Get started with common queries
                </Text>
            </div>
            
            <div className="quick-actions-grid">
                {quickActions.map((action) => (
                    <Button
                        key={action.key}
                        icon={action.icon}
                        size="small"
                        onClick={() => handleActionClick(action)}
                        style={{
                            backgroundColor: action.color,
                            borderColor: action.color,
                            color: 'white',
                            height: 'auto',
                            padding: '8px 12px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '4px',
                            borderRadius: '8px',
                            minHeight: '60px'
                        }}
                        className="quick-action-button"
                    >
                        <div style={{ fontSize: '16px' }}>
                            {action.icon}
                        </div>
                        <Text style={{ color: 'white', fontSize: '11px', textAlign: 'center' }}>
                            {action.label}
                        </Text>
                    </Button>
                ))}
            </div>
        </div>
    );
};

export default QuickActions; 