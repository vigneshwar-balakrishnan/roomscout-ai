import React, { useState, useEffect, useRef } from 'react';
import { Layout, Input, Button, Upload, Typography, Space, Card, Spin, Alert } from 'antd';
import { SendOutlined, UploadOutlined } from '@ant-design/icons';
import ChatMessage from './ChatMessage';
import QuickActions from './QuickActions';
import { chatAPI, housingPaginationAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { socket } from '../../services/socket';
import huskyAvatar from '../../assets/husky-ai-avatar.jpg';
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

    const [showScrollToBottom, setShowScrollToBottom] = useState(false);
    const messagesEndRef = useRef(null);

    // Initialize chat session
    useEffect(() => {
        if (user) {
            
            // Add welcome message
            setMessages([
                {
                    id: 'welcome',
                    type: 'system',
                    content: `Welcome to RoomScout AI! I can help you find housing by analyzing WhatsApp messages or answering your questions. Try uploading a WhatsApp chat file or ask me about housing options.`,
                    timestamp: new Date(),
                    sender: 'system'
                },
                {
                    id: 'welcome2',
                    type: 'ai',
                    content: `Hi there! I'm your AI housing assistant. I can help you with:\n\n🏠 Finding apartments near Northeastern University\n💰 Budget-friendly housing options\n📍 Neighborhood recommendations\n👥 Roommate matching\n📱 WhatsApp chat analysis\n\nWhat would you like to know about housing in Boston?`,
                    timestamp: new Date(),
                    sender: 'RoomScout AI'
                },
                {
                    id: 'welcome3',
                    type: 'user',
                    content: `Hi! I'm looking for housing near NEU. Can you help me?`,
                    timestamp: new Date(),
                    sender: user?.firstName || 'User'
                },
                {
                    id: 'welcome4',
                    type: 'ai',
                    content: `Absolutely! I'd be happy to help you find housing near Northeastern University. Let me search for some current listings in the area.\n\nI'll look for options that are:\n• Within walking distance to campus\n• In student-friendly neighborhoods\n• Within your budget range\n\nWhat's your monthly budget for rent?`,
                    timestamp: new Date(),
                    sender: 'RoomScout AI'
                },
                {
                    id: 'welcome5',
                    type: 'user',
                    content: `My budget is around $800-1000 per month.`,
                    timestamp: new Date(),
                    sender: user?.firstName || 'User'
                },
                {
                    id: 'welcome6',
                    type: 'ai',
                    content: `Perfect! $800-1000/month is a great budget for NEU students. Let me search for housing options in that range.\n\nI found several listings that match your criteria:\n\n🏠 **Mission Hill** - $850/month\n📍 8 min walk to campus\n✨ Furnished, utilities included\n\n🏠 **Roxbury** - $750/month\n📍 15 min walk to campus\n✨ Private room, laundry access\n\n🏠 **Fenway** - $950/month\n📍 12 min walk to campus\n✨ Studio apartment, parking available\n\nWould you like me to show you more details about any of these options?`,
                    timestamp: new Date(),
                    sender: 'RoomScout AI'
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

    // Handle scroll events to show/hide scroll-to-bottom button
    const handleScroll = (e) => {
        const { scrollTop, scrollHeight, clientHeight } = e.target;
        const isScrolledUp = scrollTop < scrollHeight - clientHeight - 100;
        setShowScrollToBottom(isScrolledUp);
    };

    // Scroll to bottom function
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        setShowScrollToBottom(false);
    };

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
        // Only populate the input field, don't send the message automatically
        setInputValue(action.prompt);
        
        // Focus the input field so user can edit if needed
        const textArea = document.querySelector('.input-area textarea');
        if (textArea) {
            textArea.focus();
        }
        
        // Show a brief visual feedback that the action was selected
        const actionButton = document.querySelector(`[data-action="${action.key}"]`);
        if (actionButton) {
            actionButton.style.transform = 'scale(0.95)';
            setTimeout(() => {
                actionButton.style.transform = 'scale(1)';
            }, 150);
        }
    };

    // Handle housing pagination
    const handleHousingPagination = async (searchCriteria, page, limit = 3) => {
        if (!searchCriteria) {
            console.error('No search criteria provided for pagination');
            return;
        }

        setIsProcessing(true);

        try {
            const response = await housingPaginationAPI.getHousingPage(searchCriteria, page, limit);

            if (response.data.success) {
                const paginationMessage = {
                    id: `pagination_${Date.now()}`,
                    type: 'ai',
                    content: response.data.response,
                    timestamp: new Date(),
                    sender: 'RoomScout AI',
                    responseType: response.data.type,
                    suggestions: response.data.suggestions || [],
                    data: response.data.data || null
                };

                setMessages(prev => [...prev, paginationMessage]);
            } else {
                const errorMessage = {
                    id: `error_${Date.now()}`,
                    type: 'error',
                    content: 'Sorry, I encountered an error loading the next page. Please try again.',
                    timestamp: new Date(),
                    sender: 'system'
                };
                setMessages(prev => [...prev, errorMessage]);
            }
        } catch (error) {
            console.error('Pagination error:', error);
            const errorMessage = {
                id: `error_${Date.now()}`,
                type: 'error',
                content: 'Sorry, I encountered an error loading the next page. Please try again.',
                timestamp: new Date(),
                sender: 'system'
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsProcessing(false);
        }
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
                        <Space size="large" align="center">
                            <div style={{
                                width: '64px',
                                height: '64px',
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                                overflow: 'hidden',
                                border: '2px solid rgba(255, 255, 255, 0.3)'
                            }}>
                                {/* RoomScout AI Husky Avatar */}
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
                                        console.log('Image failed to load, using fallback');
                                        e.target.style.display = 'none';
                                    }}
                                />
                            </div>
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
                    <div 
                        className="messages-container" 
                        onScroll={handleScroll}
                        style={{
                            height: '600px',
                            maxHeight: '600px',
                            overflowY: 'auto'
                        }}
                    >
                        {messages.map((message) => (
                            <ChatMessage 
                                key={message.id} 
                                message={message}
                                user={user}
                                onSuggestionClick={handleSuggestionClick}
                                onPaginationClick={handleHousingPagination}
                            />
                        ))}
                        
                        {isTyping && (
                            <div className="typing-indicator">
                                <div style={{
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '50%',
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    border: '1px solid rgba(255, 255, 255, 0.3)',
                                    overflow: 'hidden'
                                }}>
                                    {/* Mini Husky Avatar for Typing Indicator */}
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
                                            console.log('Typing indicator image failed to load');
                                            e.target.style.display = 'none';
                                        }}
                                    />
                                </div>
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

                    {/* Scroll to Bottom Button */}
                    {showScrollToBottom && (
                        <div className="scroll-to-bottom-indicator" onClick={scrollToBottom}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M7 13l5 5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M7 6l5 5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </div>
                    )}

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
                            {inputValue && inputValue.length > 50 && (
                                <span style={{ display: 'block', marginTop: '4px', color: '#10b981' }}>
                                    ✏️ You can edit this text before sending
                                </span>
                            )}
                        </Text>
                    </div>
                </Card>
            </Content>
        </Layout>
    );
};

export default ChatInterface; 