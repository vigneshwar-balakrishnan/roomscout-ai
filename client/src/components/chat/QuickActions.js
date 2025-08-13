import React from 'react';
import { 
    HomeOutlined, 
    UploadOutlined, 
    DollarOutlined,
    EnvironmentOutlined,
    TeamOutlined,
    BulbOutlined
} from '@ant-design/icons';
import './QuickActions.css';



const QuickActions = ({ onAction }) => {
    const quickActions = [
        {
            key: 'find-housing',
            icon: <HomeOutlined />,
            label: 'Find Housing',
            description: 'Discover available listings',
            prompt: 'Show me the best housing options near Northeastern University. I\'m looking for apartments or rooms that are close to campus and within my budget.',
            gradient: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
            iconColor: '#ffffff'
        },
        {
            key: 'budget-options',
            icon: <DollarOutlined />,
            label: 'Budget Options',
            description: 'Affordable student housing',
            prompt: 'I\'m a student on a tight budget. Can you show me the most affordable housing options near Northeastern University? I need something under $2000 per month.',
            gradient: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
            iconColor: '#ffffff'
        },
        {
            key: 'best-areas',
            icon: <EnvironmentOutlined />,
            label: 'Best Areas',
            description: 'Top neighborhoods for students',
            prompt: 'What are the best neighborhoods for Northeastern students? I want to know about safety, convenience, and student-friendly areas around campus.',
            gradient: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
            iconColor: '#ffffff'
        },
        {
            key: 'roommate-finder',
            icon: <TeamOutlined />,
            label: 'Find Roommates',
            description: 'Connect with potential roommates',
            prompt: 'I\'m looking for roommates for next semester. Can you help me understand the roommate search process and what to look for in potential roommates?',
            gradient: 'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)',
            iconColor: '#ffffff'
        },
        {
            key: 'housing-tips',
            icon: <BulbOutlined />,
            label: 'Housing Tips',
            description: 'Expert advice for students',
            prompt: 'I\'m new to finding housing in Boston. What are the most important things I should know about renting as a Northeastern student?',
            gradient: 'linear-gradient(135deg, #06b6d4 0%, #22d3ee 100%)',
            iconColor: '#ffffff'
        },
        {
            key: 'upload-whatsapp',
            icon: <UploadOutlined />,
            label: 'Upload WhatsApp',
            description: 'Extract listings from chat',
            prompt: 'I have a WhatsApp chat file with housing messages. Can you help me extract and analyze housing listings from the chat?',
            gradient: 'linear-gradient(135deg, #ef4444 0%, #f87171 100%)',
            iconColor: '#ffffff'
        }
    ];

    const handleActionClick = (action) => {
        if (onAction) {
            onAction(action);
        }
    };

    return (
        <div className="quick-actions-container">
            <div className="quick-actions-grid">
                {quickActions.map((action, index) => (
                    <div
                        key={action.key}
                        className={`quick-action-button ${action.key}`}
                        data-action={action.key}
                        onClick={() => handleActionClick(action)}
                        style={{
                            background: action.gradient,
                            cursor: 'pointer'
                        }}
                    >
                        <div className="quick-action-icon" style={{ color: action.iconColor }}>
                            {action.icon}
                        </div>
                        <div className="quick-action-text" style={{ color: action.iconColor }}>
                            {action.label}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default QuickActions; 