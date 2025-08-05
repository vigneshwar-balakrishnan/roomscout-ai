import React from 'react';
import { Avatar, Typography, Space, Card, Tag, Button, Progress, Alert } from 'antd';
import { RobotOutlined, UserOutlined, FileTextOutlined, CheckCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { formatDistanceToNow } from 'date-fns';
import HousingCard from '../housing/HousingCard';
import './ChatMessage.css';

const { Text, Paragraph } = Typography;

const ChatMessage = ({ message, user }) => {
    const isUser = message.type === 'user';
    const isAI = message.type === 'ai';
    const isSystem = message.type === 'system';
    const isError = message.type === 'error';
    const isSuccess = message.type === 'success';
    const isUpload = message.type === 'upload';

    const renderAvatar = () => {
        if (isUser) {
            return (
                <Avatar 
                    icon={<UserOutlined />} 
                    style={{ backgroundColor: '#1890ff' }}
                    size="large"
                />
            );
        } else if (isAI) {
            return (
                <Avatar 
                    icon={<RobotOutlined />} 
                    style={{ backgroundColor: '#C8102E' }}
                    size="large"
                />
            );
        } else {
            return (
                <Avatar 
                    icon={<FileTextOutlined />} 
                    style={{ backgroundColor: '#52c41a' }}
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
                        <Paragraph style={{ margin: 0, color: '#000' }}>
                            {message.content}
                        </Paragraph>
                    </div>
                );

            case 'ai':
                return (
                    <div className="message-content ai-message">
                        <Paragraph style={{ margin: 0, color: '#000' }}>
                            {message.content}
                        </Paragraph>
                        
                        {/* Render housing results if available */}
                        {message.housingResults && message.housingResults.length > 0 && (
                            <div className="housing-results">
                                <Text strong style={{ display: 'block', marginBottom: '8px' }}>
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
                                        <Tag color="blue">
                                            Confidence: {(message.metadata.confidence * 100).toFixed(1)}%
                                        </Tag>
                                    )}
                                    {message.metadata.processingTime && (
                                        <Tag color="green">
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
                                    <Tag color="blue">
                                        Messages: {message.stats.totalMessages}
                                    </Tag>
                                    <Tag color="green">
                                        Housing: {message.stats.housingMessages}
                                    </Tag>
                                    <Tag color="orange">
                                        Extracted: {message.stats.extractedListings}
                                    </Tag>
                                    <Tag color="purple">
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
                        <Card size="small" style={{ margin: 0 }}>
                            <Space align="center">
                                <FileTextOutlined style={{ color: '#1890ff' }} />
                                <div>
                                    <Text strong>{message.fileName}</Text>
                                    <br />
                                    <Text type="secondary">{message.content}</Text>
                                </div>
                            </Space>
                        </Card>
                    </div>
                );

            default:
                return (
                    <div className="message-content">
                        <Paragraph style={{ margin: 0 }}>
                            {message.content}
                        </Paragraph>
                    </div>
                );
        }
    };

    const renderTimestamp = () => {
        return (
            <Text type="secondary" style={{ fontSize: '11px' }}>
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
                        <Text strong style={{ color: isUser ? '#1890ff' : '#C8102E' }}>
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