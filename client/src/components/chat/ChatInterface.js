import React, { useState, useEffect, useRef } from 'react';
import { Layout, Input, Button, Upload, Typography, Space, Card, Avatar, Spin, Alert } from 'antd';
import { SendOutlined, UploadOutlined, RobotOutlined, FileTextOutlined } from '@ant-design/icons';
import ChatMessage from './ChatMessage';
import QuickActions from './QuickActions';
import { useAuth } from '../../contexts/AuthContext';
import { socket } from '../../services/socket';
import { chatAPI } from '../../services/api';
import './ChatInterface.css';

const { Content } = Layout;
const { TextArea } = Input;
const { Title, Text } = Typography;

const ChatInterface = () => {
    const { user } = useAuth();
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [uploadStatus, setUploadStatus] = useState(null);
    const [sessionId, setSessionId] = useState(null);
    const messagesEndRef = useRef(null);

    // Initialize chat session
    useEffect(() => {
        if (user) {
            const newSessionId = `chat_${Date.now()}_${user.id}`;
            setSessionId(newSessionId);
            
            // Add welcome message
            setMessages([
                {
                    id: 'welcome',
                    type: 'system',
                    content: `Welcome to RoomScout AI! I can help you find housing by analyzing WhatsApp messages or answering your questions. Try uploading a WhatsApp chat file or ask me about housing options.`,
                    timestamp: new Date(),
                    sender: 'system'
                }
            ]);
        }
    }, [user]);

    // Socket.io connection for real-time updates
    useEffect(() => {
        if (!socket) return;

        socket.on('message', (message) => {
            setMessages(prev => [...prev, message]);
        });

        socket.on('typing', (data) => {
            setIsTyping(data.isTyping);
        });

        socket.on('upload_progress', (data) => {
            setUploadStatus(data);
        });

        return () => {
            socket.off('message');
            socket.off('typing');
            socket.off('upload_progress');
        };
    }, []);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async () => {
        if (!inputValue.trim() || isProcessing) return;

        const userMessage = {
            id: `msg_${Date.now()}`,
            type: 'user',
            content: inputValue.trim(),
            timestamp: new Date(),
            sender: user?.firstName || 'User'
        };

        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setIsProcessing(true);

        try {
            // Use the new conversational chat endpoint
            const response = await chatAPI.chatQuery({
                message: inputValue.trim(),
                context: messages.length > 0 ? messages[messages.length - 1].content : '',
                user_id: user?.id
            });

            if (response.data) {
                const aiMessage = {
                    id: `ai_${Date.now()}`,
                    type: 'ai',
                    content: response.data.response,
                    timestamp: new Date(),
                    sender: 'RoomScout AI',
                    responseType: response.data.type,
                    suggestions: response.data.suggestions || [],
                    data: response.data.data || null
                };

                setMessages(prev => [...prev, aiMessage]);
            } else {
                // Add error message
                const errorMessage = {
                    id: `error_${Date.now()}`,
                    type: 'error',
                    content: 'Sorry, I encountered an error processing your message. Please try again.',
                    timestamp: new Date(),
                    sender: 'system'
                };
                setMessages(prev => [...prev, errorMessage]);
            }
        } catch (error) {
            console.error('Chat error:', error);
            const errorMessage = {
                id: `error_${Date.now()}`,
                type: 'error',
                content: 'Sorry, I encountered an error processing your message. Please try again.',
                timestamp: new Date(),
                sender: 'system'
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleFileUpload = async (file) => {
        if (!file) return;

        setUploadStatus({
            status: 'uploading',
            progress: 0,
            message: 'Uploading file...'
        });

        const uploadMessage = {
            id: `upload_${Date.now()}`,
            type: 'upload',
            content: `Uploading ${file.name}...`,
            timestamp: new Date(),
            sender: 'system',
            fileName: file.name
        };

        setMessages(prev => [...prev, uploadMessage]);

        try {
            const formData = new FormData();
            formData.append('file', file);

            // Update message to show processing
            setMessages(prev => prev.map(msg => 
                msg.id === uploadMessage.id 
                    ? { ...msg, content: `Processing ${file.name} with AI... (this may take a few minutes)` }
                    : msg
            ));

            const response = await chatAPI.uploadFile(formData);

            if (response.data.success) {
                const successMessage = {
                    id: `success_${Date.now()}`,
                    type: 'success',
                    content: `Successfully processed ${file.name}! Found ${response.data.result.stats.housingMessages} housing messages and extracted ${response.data.result.stats.extractedListings} listings.`,
                    timestamp: new Date(),
                    sender: 'system',
                    stats: response.data.result.stats
                };

                setMessages(prev => [...prev, successMessage]);

                // Display extracted housing listings
                if (response.data.result.housingListings && response.data.result.housingListings.length > 0) {
                    response.data.result.housingListings.forEach((listing, index) => {
                        const listingMessage = {
                            id: `listing_${Date.now()}_${index}`,
                            type: 'listing',
                            content: `🏠 **Housing Listing ${index + 1}**\n\n` +
                                (listing.location ? `📍 **Location**: ${listing.location}\n` : '') +
                                (listing.price ? `💰 **Price**: ${listing.price}\n` : '') +
                                (listing.roomType ? `🏘️ **Type**: ${listing.roomType}\n` : '') +
                                (listing.availability ? `📅 **Available**: ${listing.availability}\n` : '') +
                                (listing.contact ? `📞 **Contact**: ${listing.contact}\n` : '') +
                                (listing.amenities ? `✨ **Amenities**: ${listing.amenities}\n` : '') +
                                (listing.confidence ? `🎯 **Confidence**: ${Math.round(listing.confidence * 100)}%\n` : ''),
                            timestamp: new Date(),
                            sender: 'RoomScout AI',
                            listing: listing,
                            canSave: true
                        };
                        setMessages(prev => [...prev, listingMessage]);
                    });
                } else {
                    // Add a message if no listings were extracted
                    const noListingsMessage = {
                        id: `no_listings_${Date.now()}`,
                        type: 'info',
                        content: 'No detailed housing listings were extracted from this file. The messages may contain general housing discussions without specific listing details.',
                        timestamp: new Date(),
                        sender: 'system'
                    };
                    setMessages(prev => [...prev, noListingsMessage]);
                }

                setUploadStatus(null);
            } else {
                const errorMessage = {
                    id: `error_${Date.now()}`,
                    type: 'error',
                    content: `Failed to process ${file.name}. Please try again.`,
                    timestamp: new Date(),
                    sender: 'system'
                };
                setMessages(prev => [...prev, errorMessage]);
                setUploadStatus(null);
            }
        } catch (error) {
            console.error('Upload error:', error);
            const errorMessage = {
                id: `error_${Date.now()}`,
                type: 'error',
                content: `Failed to upload ${file.name}. ${error.response?.data?.error || 'Please try again.'}`,
                timestamp: new Date(),
                sender: 'system'
            };
            setMessages(prev => [...prev, errorMessage]);
            setUploadStatus(null);
        }
    };

    const handleQuickAction = async (action) => {
        const actionMessage = {
            id: `action_${Date.now()}`,
            type: 'user',
            content: action.prompt,
            timestamp: new Date(),
            sender: user?.firstName || 'User'
        };

        setMessages(prev => [...prev, actionMessage]);
        setInputValue(action.prompt);
        await handleSendMessage();
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const handleSuggestionClick = (suggestion) => {
        setInputValue(suggestion);
        // Automatically send the suggestion as a message
        setTimeout(() => {
            handleSendMessage();
        }, 100);
    };

    return (
        <Layout className="chat-layout">
            <Content className="chat-content">
                <Card className="chat-card">
                    {/* Chat Header */}
                    <div className="chat-header">
                        <Space align="center">
                            <Avatar 
                                icon={<RobotOutlined />} 
                                size="large"
                                style={{ 
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    border: '2px solid rgba(255, 255, 255, 0.3)',
                                    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
                                }}
                            />
                            <div>
                                <Title level={3} style={{ margin: 0, color: 'white', fontWeight: 700 }}>
                                    RoomScout AI
                                </Title>
                                <Text style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '14px' }}>
                                    Your intelligent housing assistant
                                </Text>
                            </div>
                        </Space>
                    </div>

                    {/* Quick Actions */}
                    <div className="quick-actions">
                        <div className="quick-actions-header">
                            <h3>Quick Actions</h3>
                        </div>
                        <QuickActions onAction={handleQuickAction} />
                    </div>

                    {/* Messages Container */}
                    <div className="messages-container">
                        {messages.map((message) => (
                            <ChatMessage 
                                key={message.id} 
                                message={message}
                                user={user}
                                onSuggestionClick={handleSuggestionClick}
                            />
                        ))}
                        
                        {isTyping && (
                            <div className="typing-indicator">
                                <Avatar 
                                    icon={<RobotOutlined />} 
                                    size="small"
                                    style={{ 
                                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                        border: '1px solid rgba(255, 255, 255, 0.3)'
                                    }}
                                />
                                <div className="typing-dots">
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                </div>
                            </div>
                        )}

                        {isProcessing && (
                            <div className="processing-indicator">
                                <Spin size="small" />
                                <Text style={{ color: '#6B7280', marginLeft: '8px' }}>Processing...</Text>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Upload Status */}
                    {uploadStatus && (
                        <div className="upload-status">
                            <Alert
                                message={uploadStatus.message}
                                type={uploadStatus.type}
                                showIcon
                                closable
                                onClose={() => setUploadStatus(null)}
                            />
                        </div>
                    )}

                    {/* Input Area */}
                    <div className="input-area">
                        <Space.Compact style={{ width: '100%' }}>
                            <Upload
                                beforeUpload={handleFileUpload}
                                showUploadList={false}
                                accept=".txt,.csv"
                            >
                                <Button 
                                    icon={<UploadOutlined />}
                                    style={{
                                        background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                                        border: '2px solid rgba(102, 126, 234, 0.2)',
                                        borderRadius: '20px 0 0 20px',
                                        height: '48px',
                                        color: '#667eea',
                                        fontWeight: 600
                                    }}
                                >
                                    Upload
                                </Button>
                            </Upload>
                            <TextArea
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Type your message here..."
                                autoSize={{ minRows: 1, maxRows: 4 }}
                                style={{
                                    borderRadius: '0',
                                    border: '2px solid rgba(102, 126, 234, 0.2)',
                                    borderLeft: 'none',
                                    borderRight: 'none',
                                    fontSize: '16px',
                                    padding: '12px 16px',
                                    resize: 'none'
                                }}
                            />
                            <Button 
                                type="primary"
                                icon={<SendOutlined />}
                                onClick={handleSendMessage}
                                loading={isProcessing}
                                disabled={!inputValue.trim() || isProcessing}
                                style={{
                                    borderRadius: '0 20px 20px 0',
                                    height: '48px',
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    border: 'none',
                                    fontWeight: 600,
                                    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
                                }}
                            >
                                Send
                            </Button>
                        </Space.Compact>
                    </div>

                    {/* Upload Hint */}
                    <div className="upload-hint">
                        <Text style={{ color: '#64748b', fontSize: '12px' }}>
                            💡 Tip: Upload WhatsApp chat files to extract housing listings automatically
                        </Text>
                    </div>
                </Card>
            </Content>
        </Layout>
    );
};

export default ChatInterface; 