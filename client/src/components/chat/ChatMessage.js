import React from 'react';
import { Avatar, Typography, Space, Card, Tag, Button, Alert } from 'antd';
import { UserOutlined, FileTextOutlined } from '@ant-design/icons';
import { formatDistanceToNow } from 'date-fns';
import HousingCard from '../housing/HousingCard';
import { chatAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import './ChatMessage.css';

const { Text, Paragraph } = Typography;

// Husky icon component
const HuskyIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" fill="#1e3a8a"/>
    <path d="M8 9c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2z" fill="white"/>
    <path d="M12 13c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" fill="white"/>
    <path d="M7 8c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z" fill="#3b82f6"/>
    <path d="M17 8c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z" fill="#3b82f6"/>
  </svg>
);

const ChatMessage = ({ message, user }) => {
    const { user: authUser } = useAuth();
    const isUser = message.type === 'user';
    const isAI = message.type === 'ai';
    const isListing = message.type === 'listing';

    // Handle saving extracted listing to dashboard
    const handleSaveListing = async (listing) => {
        try {
            const response = await chatAPI.saveExtractedListing({
                listing,
                userId: authUser?.id
            });

            if (response.data.success) {
                console.log('Listing saved to dashboard!');
            } else {
                console.error('Failed to save listing');
            }
        } catch (error) {
            console.error('Error saving listing:', error);
        }
    };

    const renderAvatar = () => {
        if (isUser) {
            return (
                <Avatar 
                    icon={<UserOutlined />} 
                    style={{ 
                        backgroundColor: '#374151',
                        border: '2px solid #e5e7eb'
                    }}
                    size="large"
                />
            );
        } else if (isAI || isListing) {
            return (
                <Avatar 
                    icon={<HuskyIcon />}
                    style={{ 
                        backgroundColor: '#1e3a8a',
                        border: '2px solid #3b82f6',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                    size="large"
                />
            );
        } else {
            return (
                <Avatar 
                    icon={<FileTextOutlined />} 
                    style={{ 
                        backgroundColor: '#6B7280',
                        border: '2px solid #d1d5db'
                    }}
                    size="large"
                />
            );
        }
    };

    const renderMessageContent = () => {
        switch (message.type) {
            case 'user':
                return (
                    <div className="message-content user-message">
                        <Paragraph style={{ margin: 0, color: '#374151' }}>
                            {message.content}
                        </Paragraph>
                    </div>
                );

            case 'ai':
                return (
                    <div className="message-content ai-message">
                        <Paragraph style={{ margin: 0, color: '#374151' }}>
                            {message.content}
                        </Paragraph>
                        
                        {/* Render housing results if available */}
                        {message.housingResults && message.housingResults.length > 0 && (
                            <div className="housing-results">
                                <Text strong style={{ display: 'block', marginBottom: '8px', color: '#374151' }}>
                                    Found {message.housingResults.length} housing option{message.housingResults.length > 1 ? 's' : ''}:
                                </Text>
                                {message.housingResults.map((listing, index) => (
                                    <div key={index} className="housing-preview">
                                        <HousingCard 
                                            listing={listing}
                                            compact={true}
                                            showActions={false}
                                        />
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Render metadata if available */}
                        {message.metadata && (
                            <div className="message-metadata">
                                <Space size="small">
                                    {message.metadata.confidence && (
                                        <Tag style={{ backgroundColor: '#F3F4F6', color: '#374151', border: '1px solid #E5E7EB' }}>
                                            Confidence: {(message.metadata.confidence * 100).toFixed(1)}%
                                        </Tag>
                                    )}
                                    {message.metadata.processingTime && (
                                        <Tag style={{ backgroundColor: '#DBEAFE', color: '#1E40AF', border: 'none' }}>
                                            Processed in {message.metadata.processingTime.toFixed(2)}s
                                        </Tag>
                                    )}
                                </Space>
                            </div>
                        )}
                    </div>
                );

            case 'system':
                return (
                    <div className="message-content system-message">
                        <Alert
                            message={message.content}
                            type="info"
                            showIcon
                            style={{ margin: 0 }}
                        />
                    </div>
                );

            case 'error':
                return (
                    <div className="message-content error-message">
                        <Alert
                            message={message.content}
                            type="error"
                            showIcon
                            style={{ margin: 0 }}
                        />
                    </div>
                );

            case 'success':
                return (
                    <div className="message-content success-message">
                        <Alert
                            message={message.content}
                            type="success"
                            showIcon
                            style={{ margin: 0 }}
                        />
                        
                        {/* Show stats if available */}
                        {message.stats && (
                            <div className="upload-stats">
                                <Space size="small" style={{ marginTop: '8px' }}>
                                    <Tag style={{ backgroundColor: '#F3F4F6', color: '#374151', border: '1px solid #E5E7EB' }}>
                                        Messages: {message.stats.totalMessages}
                                    </Tag>
                                    <Tag style={{ backgroundColor: '#D1FAE5', color: '#065F46', border: 'none' }}>
                                        Housing: {message.stats.housingMessages}
                                    </Tag>
                                    <Tag style={{ backgroundColor: '#FEF3C7', color: '#92400E', border: 'none' }}>
                                        Extracted: {message.stats.extractedListings}
                                    </Tag>
                                    <Tag style={{ backgroundColor: '#DBEAFE', color: '#1E40AF', border: 'none' }}>
                                        Rate: {message.stats.housingDetectionRate}%
                                    </Tag>
                                </Space>
                            </div>
                        )}
                    </div>
                );

            case 'upload':
                return (
                    <div className="message-content upload-message">
                        <Card size="small" style={{ margin: 0, background: '#F9FAFB', border: '1px solid #E5E7EB' }}>
                            <Space align="center">
                                <FileTextOutlined style={{ color: '#6B7280' }} />
                                <div>
                                    <Text strong style={{ color: '#374151' }}>{message.fileName}</Text>
                                    <br />
                                    <Text style={{ color: '#6B7280' }}>{message.content}</Text>
                                </div>
                            </Space>
                        </Card>
                    </div>
                );

            case 'listing':
                return (
                    <div className="message-content listing-message">
                        <Card 
                            size="small" 
                            style={{ 
                                margin: 0, 
                                borderColor: '#E5E7EB',
                                backgroundColor: '#FFFFFF'
                            }}
                        >
                            <div style={{ whiteSpace: 'pre-line' }}>
                                <Text strong style={{ color: '#374151', fontSize: '14px' }}>
                                    {message.content}
                                </Text>
                            </div>
                            
                            {/* Show confidence if available */}
                            {message.listing && message.listing.confidence && (
                                <div style={{ marginTop: '8px' }}>
                                    <Tag style={{ backgroundColor: '#F3F4F6', color: '#374151', border: '1px solid #E5E7EB' }}>
                                        AI Confidence: {Math.round(message.listing.confidence * 100)}%
                                    </Tag>
                                </div>
                            )}

                            {/* Save button for extracted listings */}
                            {message.canSave && message.listing && (
                                <div style={{ marginTop: '12px' }}>
                                    <Button
                                        type="primary"
                                        size="small"
                                        style={{ 
                                            background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
                                            borderColor: '#1e3a8a',
                                            borderRadius: '8px',
                                            fontWeight: 600
                                        }}
                                        onClick={() => handleSaveListing(message.listing)}
                                    >
                                        💾 Save to Dashboard
                                    </Button>
                                </div>
                            )}
                        </Card>
                    </div>
                );

            case 'info':
                return (
                    <div className="message-content info-message">
                        <Alert
                            message={message.content}
                            type="info"
                            showIcon
                            style={{ margin: 0 }}
                        />
                    </div>
                );

            default:
                return (
                    <div className="message-content">
                        <Paragraph style={{ margin: 0, color: '#374151' }}>
                            {message.content}
                        </Paragraph>
                    </div>
                );
        }
    };

    const renderTimestamp = () => {
        return (
            <Text style={{ color: '#9CA3AF', fontSize: '11px' }}>
                {formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })}
            </Text>
        );
    };

    return (
        <div className={`chat-message ${message.type}`}>
            <div className="message-container">
                {!isUser && (
                    <div className="message-avatar">
                        {renderAvatar()}
                    </div>
                )}
                
                <div className="message-body">
                    <div className="message-header">
                        <Text strong style={{ color: isUser ? '#374151' : '#1e3a8a' }}>
                            {message.sender}
                        </Text>
                        {renderTimestamp()}
                    </div>
                    
                    {renderMessageContent()}
                </div>
                
                {isUser && (
                    <div className="message-avatar">
                        {renderAvatar()}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChatMessage; 