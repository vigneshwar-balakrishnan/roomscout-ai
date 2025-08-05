import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { message } from 'antd';
import io from 'socket.io-client';
import api from '../services/api';

const ChatContext = createContext();

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

export const ChatProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [currentSession, setCurrentSession] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const socketRef = useRef(null);

  // Initialize socket connection
  useEffect(() => {
    const newSocket = io('http://localhost:5000', {
      autoConnect: false,
      transports: ['websocket', 'polling']
    });

    socketRef.current = newSocket;
    setSocket(newSocket);

    return () => {
      if (newSocket) {
        newSocket.disconnect();
      }
    };
  }, []);

  // Socket event listeners
  useEffect(() => {
    if (!socket) return;

    socket.on('connect', () => {
      console.log('Connected to chat server');
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from chat server');
    });

    socket.on('receive-message', (data) => {
      // Handle incoming messages
      console.log('Received message:', data);
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      message.error('Chat connection failed');
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('receive-message');
      socket.off('connect_error');
    };
  }, [socket]);

  const connectToChat = (userId) => {
    if (socket && userId) {
      socket.connect();
      socket.emit('join-chat', userId);
    }
  };

  const disconnectFromChat = () => {
    if (socket) {
      socket.disconnect();
    }
  };

  const createSession = async () => {
    try {
      setLoading(true);
      const response = await api.post('/chat/session');
      const newSession = response.data.session;
      
      setSessions(prev => [newSession, ...prev]);
      setCurrentSession(newSession);
      
      return newSession;
    } catch (error) {
      console.error('Create session error:', error);
      message.error('Failed to create chat session');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getSessions = async () => {
    try {
      setLoading(true);
      const response = await api.get('/chat/sessions');
      setSessions(response.data.sessions);
      return response.data.sessions;
    } catch (error) {
      console.error('Get sessions error:', error);
      message.error('Failed to fetch chat sessions');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getSession = async (sessionId) => {
    try {
      setLoading(true);
      const response = await api.get(`/chat/session/${sessionId}`);
      setCurrentSession(response.data.session);
      return response.data.session;
    } catch (error) {
      console.error('Get session error:', error);
      message.error('Failed to fetch chat session');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (content, sessionId = currentSession?.sessionId) => {
    try {
      if (!sessionId) {
        throw new Error('No active session');
      }

      const response = await api.post('/chat/message', {
        content,
        sessionId
      });

      // Update current session with new message
      if (currentSession && currentSession.sessionId === sessionId) {
        setCurrentSession(prev => ({
          ...prev,
          messages: [
            ...prev.messages,
            {
              sender: 'user',
              content,
              timestamp: new Date().toISOString()
            },
            {
              sender: 'ai',
              content: response.data.response,
              timestamp: new Date().toISOString()
            }
          ]
        }));
      }

      return response.data;
    } catch (error) {
      console.error('Send message error:', error);
      message.error('Failed to send message');
      throw error;
    }
  };

  const updateSession = async (sessionId, updates) => {
    try {
      const response = await api.put(`/chat/session/${sessionId}`, updates);
      
      // Update sessions list
      setSessions(prev => 
        prev.map(session => 
          session.sessionId === sessionId 
            ? { ...session, ...response.data.session }
            : session
        )
      );

      // Update current session if it's the one being updated
      if (currentSession && currentSession.sessionId === sessionId) {
        setCurrentSession(prev => ({ ...prev, ...response.data.session }));
      }

      return response.data;
    } catch (error) {
      console.error('Update session error:', error);
      message.error('Failed to update session');
      throw error;
    }
  };

  const deleteSession = async (sessionId) => {
    try {
      await api.delete(`/chat/session/${sessionId}`);
      
      // Remove from sessions list
      setSessions(prev => prev.filter(session => session.sessionId !== sessionId));
      
      // Clear current session if it's the one being deleted
      if (currentSession && currentSession.sessionId === sessionId) {
        setCurrentSession(null);
      }

      message.success('Session deleted successfully');
    } catch (error) {
      console.error('Delete session error:', error);
      message.error('Failed to delete session');
      throw error;
    }
  };

  const uploadChatFile = async (file) => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('chatFile', file);

      const response = await api.post('/upload/chat-file', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      // Create new session for uploaded file
      const newSession = {
        sessionId: response.data.sessionId,
        title: `Upload: ${response.data.fileName}`,
        createdAt: new Date().toISOString()
      };

      setSessions(prev => [newSession, ...prev]);
      setCurrentSession(newSession);

      message.success('File uploaded and processed successfully');
      return response.data;
    } catch (error) {
      console.error('Upload file error:', error);
      message.error('Failed to upload file');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    socket,
    currentSession,
    sessions,
    loading,
    connectToChat,
    disconnectFromChat,
    createSession,
    getSessions,
    getSession,
    sendMessage,
    updateSession,
    deleteSession,
    uploadChatFile
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
}; 