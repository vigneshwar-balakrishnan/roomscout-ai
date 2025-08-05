import io from 'socket.io-client';

// Create socket instance
const socket = io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000', {
  autoConnect: false,
  transports: ['websocket', 'polling'],
  timeout: 20000,
});

// Socket event handlers
socket.on('connect', () => {
  console.log('🔌 Socket connected');
});

socket.on('disconnect', () => {
  console.log('🔌 Socket disconnected');
});

socket.on('connect_error', (error) => {
  console.error('🔌 Socket connection error:', error);
});

socket.on('error', (error) => {
  console.error('🔌 Socket error:', error);
});

// Chat-specific event handlers
socket.on('message', (message) => {
  console.log('📨 Received message:', message);
});

socket.on('typing', (data) => {
  console.log('⌨️ Typing indicator:', data);
});

socket.on('upload_progress', (data) => {
  console.log('📁 Upload progress:', data);
});

socket.on('chat_session_update', (data) => {
  console.log('💬 Chat session updated:', data);
});

// Socket utility functions
export const socketService = {
  // Connect to socket server
  connect: (token) => {
    if (token) {
      socket.auth = { token };
    }
    socket.connect();
  },

  // Disconnect from socket server
  disconnect: () => {
    socket.disconnect();
  },

  // Join a chat session
  joinSession: (sessionId) => {
    socket.emit('join_session', { sessionId });
  },

  // Leave a chat session
  leaveSession: (sessionId) => {
    socket.emit('leave_session', { sessionId });
  },

  // Send a message
  sendMessage: (message) => {
    socket.emit('send_message', message);
  },

  // Send typing indicator
  sendTyping: (isTyping) => {
    socket.emit('typing', { isTyping });
  },

  // Upload file progress
  uploadFile: (fileData) => {
    socket.emit('upload_file', fileData);
  },

  // Listen for specific events
  on: (event, callback) => {
    socket.on(event, callback);
  },

  // Remove event listener
  off: (event, callback) => {
    socket.off(event, callback);
  },

  // Get connection status
  isConnected: () => socket.connected,

  // Get socket instance
  getSocket: () => socket,
};

// Export socket instance for direct use
export { socket };

export default socketService; 