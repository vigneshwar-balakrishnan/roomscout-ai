import React, { useState, useEffect, useRef } from 'react';
import { Layout, Input, Button, Upload, Typography, Space, Card, Avatar, Spin, Alert } from 'antd';
import { SendOutlined, UploadOutlined, RobotOutlined, UserOutlined, FileTextOutlined } from '@ant-design/icons';
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
    const fileInputRef = useRef(null);

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
    }, [socket]);

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
            // Send message to backend
            const response = await chatAPI.sendMessage({
                message: inputValue.trim(),
                sessionId: sessionId,
                userId: user?.id
            });

            if (response.data.success) {
                const aiMessage = {
                    id: `ai_${Date.now()}`,
                    type: 'ai',
                    content: response.data.result.content,
                    timestamp: new Date(),
                    sender: 'RoomScout AI',
                    metadata: response.data.result.metadata,
                    housingResults: response.data.result.housingResults || []
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

    return (
        <Layout className="chat-layout">
            <Content className="chat-content">
                <Card className="chat-card">
                    {/* Chat Header */}
                    <div className="chat-header">
                        <Space align="center">
                            <Avatar 
                                icon={<RobotOutlined />} 
                                style={{ backgroundColor: '#C8102E' }}
                                size="large"
                            />
                            <div>
                                <Title level={4} style={{ margin: 0, color: '#C8102E' }}>
                                    RoomScout AI
                                </Title>
                                <Text type="secondary">
                                    Housing Assistant
                                </Text>
                            </div>
                        </Space>
                    </div>

                    {/* Quick Actions */}
                    <QuickActions onAction={handleQuickAction} />

                    {/* Messages Container */}
                    <div className="messages-container">
                        {messages.map((message) => (
                            <ChatMessage 
                                key={message.id} 
                                message={message}
                                user={user}
                            />
                        ))}
                        
                        {isTyping && (
                            <div className="typing-indicator">
                                <Avatar 
                                    icon={<RobotOutlined />} 
                                    size="small"
                                    style={{ backgroundColor: '#C8102E' }}
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
                                <Text type="secondary">Processing...</Text>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Upload Status */}
                    {uploadStatus && (
                        <Alert
                            message={uploadStatus.message}
                            type={uploadStatus.status === 'uploading' ? 'info' : 'success'}
                            showIcon
                            className="upload-status"
                        />
                    )}

                    {/* Input Area */}
                    <div className="input-area">
                        <Space.Compact style={{ width: '100%' }}>
                            <Upload
                                beforeUpload={(file) => {
                                    handleFileUpload(file);
                                    return false; // Prevent default upload
                                }}
                                accept=".txt,.csv,.json"
                                showUploadList={false}
                            >
                                <Button 
                                    icon={<UploadOutlined />}
                                    size="large"
                                    style={{ borderColor: '#d9d9d9' }}
                                >
                                    Upload
                                </Button>
                            </Upload>
                            
                            <TextArea
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Ask about housing options, upload WhatsApp files, or describe what you're looking for..."
                                autoSize={{ minRows: 1, maxRows: 4 }}
                                disabled={isProcessing}
                                style={{ 
                                    borderTopLeftRadius: 0,
                                    borderBottomLeftRadius: 0,
                                    resize: 'none'
                                }}
                            />
                            
                            <Button
                                type="primary"
                                icon={<SendOutlined />}
                                size="large"
                                onClick={handleSendMessage}
                                disabled={!inputValue.trim() || isProcessing}
                                style={{ 
                                    backgroundColor: '#C8102E',
                                    borderColor: '#C8102E',
                                    borderTopLeftRadius: 0,
                                    borderBottomLeftRadius: 0
                                }}
                            >
                                Send
                            </Button>
                        </Space.Compact>
                    </div>

                    {/* File Upload Hint */}
                    <div className="upload-hint">
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                            <FileTextOutlined /> Supported formats: WhatsApp .txt files, CSV, JSON
                        </Text>
                    </div>
                </Card>
            </Content>
        </Layout>
    );
};

export default ChatInterface; 