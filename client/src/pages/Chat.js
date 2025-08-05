import React, { useEffect } from 'react';
import { Layout, Typography, Alert } from 'antd';
import { useAuth } from '../contexts/AuthContext';
import ChatInterface from '../components/chat/ChatInterface';
import { socketService } from '../services/socket';
import './Chat.css';

const { Content } = Layout;
const { Title } = Typography;

const Chat = () => {
    const { user, token } = useAuth();

    useEffect(() => {
        // Connect to socket when component mounts
        if (token) {
            socketService.connect(token);
        }

        // Cleanup on unmount
        return () => {
            socketService.disconnect();
        };
    }, [token]);

    if (!user) {
        return (
            <Layout className="chat-page">
                <Content className="chat-content">
                    <Alert
                        message="Authentication Required"
                        description="Please log in to access the chat interface."
                        type="warning"
                        showIcon
                        style={{ margin: '20px' }}
                    />
                </Content>
            </Layout>
        );
    }

    return (
        <Layout className="chat-page">
            <Content className="chat-content">
                <ChatInterface />
            </Content>
        </Layout>
    );
};

export default Chat; 