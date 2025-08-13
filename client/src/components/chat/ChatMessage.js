import React from 'react';
import { Avatar, Typography, Space, Card, Tag, Button, Alert } from 'antd';
import { FileTextOutlined } from '@ant-design/icons';
import { formatDistanceToNow } from 'date-fns';
import HousingCard from '../housing/HousingCard';
import { chatAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import huskyAvatar from '../../assets/husky-ai-avatar.jpg';
import './ChatMessage.css';

const { Text, Paragraph } = Typography;

// Helper function to get response type colors
const getResponseTypeColor = (responseType) => {
    switch (responseType) {
        case 'housing_general':
        case 'housing_search':
        case 'housing_extraction':
            return '#10B981'; // Green
        case 'neighborhood_info':
            return '#3B82F6'; // Blue
        case 'budget_advice':
            return '#F59E0B'; // Yellow
        case 'roommate_advice':
            return '#8B5CF6'; // Purple
        case 'greeting':
            return '#06B6D4'; // Cyan
        case 'general_guidance':
            return '#6B7280'; // Gray
        case 'error':
            return '#EF4444'; // Red
        default:
            return '#6B7280'; // Gray
    }
};

// Husky icon component
const HuskyIcon = () => (
  <img 
    src={huskyAvatar} 
    alt="RoomScout AI Husky Avatar"
    style={{
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      borderRadius: '50%',
      display: 'block'
    }}
    onError={(e) => {
      console.log('Chat message husky image failed to load');
      e.target.style.display = 'none';
    }}
  />
);

const ChatMessage = ({ message, user, onSuggestionClick, onPaginationClick }) => {
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
                    style={{ 
                        backgroundColor: '#374151',
                        border: '2px solid #e5e7eb',
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: '16px'
                    }}
                    size="large"
                >
                    {message.sender?.charAt(0)?.toUpperCase() || 'U'}
                </Avatar>
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
                        <Paragraph style={{ margin: 0, color: '#374151', whiteSpace: 'pre-line' }}>
                            {message.content}
                        </Paragraph>
                        
                        {/* Render housing listings if available */}
                        {message.data && message.data.listings && message.data.listings.length > 0 && (
                            <div className="housing-listings" style={{ marginTop: '16px' }}>
                                <Text strong style={{ display: 'block', marginBottom: '12px', color: '#374151' }}>
                                    🏠 Available Listings ({message.data.count} found):
                                </Text>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {message.data.listings.slice(0, 3).map((listing, index) => (
                                        <Card 
                                            key={index}
                                            size="small" 
                                            style={{ 
                                                borderColor: '#E5E7EB',
                                                backgroundColor: '#FFFFFF',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s ease'
                                            }}
                                            hoverable
                                            onClick={() => {
                                                // Navigate to listing detail page
                                                window.location.href = `/housing/${listing._id}`;
                                            }}
                                        >
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                <div style={{ flex: 1 }}>
                                                    <Text strong style={{ color: '#374151', fontSize: '14px' }}>
                                                        {listing.title}
                                                    </Text>
                                                    <br />
                                                    <Text style={{ color: '#6B7280', fontSize: '12px' }}>
                                                        📍 {listing.location?.neighborhood || 'Boston'} • {listing.propertyType} • {listing.bedrooms}BR • {listing.bathrooms}BA
                                                    </Text>
                                                    {listing.amenities && listing.amenities.length > 0 && (
                                                        <div style={{ marginTop: '4px' }}>
                                                            <Text style={{ color: '#6B7280', fontSize: '11px' }}>
                                                                ✨ {listing.amenities.slice(0, 2).join(', ')}
                                                            </Text>
                                                        </div>
                                                    )}
                                                </div>
                                                <div style={{ textAlign: 'right' }}>
                                                    <Text strong style={{ color: '#C8102E', fontSize: '16px' }}>
                                                        ${listing.price?.toLocaleString() || '0'}/month
                                                    </Text>
                                                </div>
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                                {message.data.listings.length > 3 && (
                                    <div style={{ marginTop: '8px', textAlign: 'center' }}>
                                        <Text style={{ color: '#6B7280', fontSize: '12px' }}>
                                            ... and {message.data.listings.length - 3} more listings available
                                        </Text>
                                    </div>
                                )}
                            </div>
                        )}
                        
                        {/* Render suggestions if available */}
                        {message.suggestions && message.suggestions.length > 0 && (
                            <div className="message-suggestions" style={{ marginTop: '12px' }}>
                                <Text style={{ color: '#6B7280', fontSize: '12px', display: 'block', marginBottom: '8px' }}>
                                    💡 Quick actions:
                                </Text>
                                <Space size="small" wrap>
                                    {message.suggestions.map((suggestion, index) => (
                                        <Button
                                            key={index}
                                            size="small"
                                            type="default"
                                            style={{
                                                backgroundColor: '#F3F4F6',
                                                borderColor: '#D1D5DB',
                                                color: '#374151',
                                                borderRadius: '16px',
                                                fontSize: '12px',
                                                height: '28px',
                                                padding: '0 12px'
                                            }}
                                            onClick={() => {
                                                // Check if this is a pagination suggestion
                                                if (suggestion.toLowerCase().includes('page') || 
                                                    suggestion.toLowerCase().includes('next') || 
                                                    suggestion.toLowerCase().includes('previous')) {
                                                    if (onPaginationClick && message.data) {
                                                        // Extract page number from suggestion
                                                        const pageMatch = suggestion.match(/page (\d+)/i);
                                                        const page = pageMatch ? parseInt(pageMatch[1]) : 
                                                                   suggestion.toLowerCase().includes('next') ? 
                                                                   (message.data.page || 1) + 1 : 
                                                                   suggestion.toLowerCase().includes('previous') ? 
                                                                   (message.data.page || 1) - 1 : 1;
                                                        
                                                        onPaginationClick(message.data.search_criteria, page, message.data.limit || 3);
                                                    }
                                                } else if (onSuggestionClick) {
                                                    onSuggestionClick(suggestion);
                                                }
                                            }}
                                        >
                                            {suggestion}
                                        </Button>
                                    ))}
                                </Space>
                            </div>
                        )}

                        {/* Render response type indicator */}
                        {message.responseType && (
                            <div className="message-type-indicator" style={{ marginTop: '8px' }}>
                                <Tag 
                                    style={{ 
                                        backgroundColor: getResponseTypeColor(message.responseType),
                                        color: '#FFFFFF',
                                        border: 'none',
                                        fontSize: '10px',
                                        borderRadius: '12px'
                                    }}
                                >
                                    {message.responseType.replace('_', ' ').toUpperCase()}
                                </Tag>
                            </div>
                        )}
                        
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