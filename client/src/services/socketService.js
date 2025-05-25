import { io } from 'socket.io-client';
import { showNotification } from '../features/ui/uiSlice';

let socket = null;

/**
 * Initialize socket connection
 * @param {string} token - Authentication token
 * @param {Function} dispatch - Redux dispatch function
 */
export const initializeSocket = (token, dispatch) => {
  // Create socket connection with authentication
  const socketURL = process.env.NODE_ENV === 'production' 
    ? window.location.origin // Use current domain in production
    : (process.env.REACT_APP_API_URL || 'http://localhost:5000');
  
  socket = io(socketURL, {
    auth: {
      token
    }
  });
  
  // Set up event listeners
  setupSocketListeners(dispatch);

  return socket;
};

/**
 * Set up socket event listeners
 * @param {Function} dispatch - Redux dispatch function
 */
export const setupSocketListeners = (dispatch) => {
  if (!socket) return;

  // Connection events
  socket.on('connect', () => {
    console.log('Socket connected');
  });

  socket.on('disconnect', () => {
    console.log('Socket disconnected');
  });

  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });

  // Notification events
  socket.on('notification', (notification) => {
    dispatch(showNotification({
      message: notification.message,
      type: notification.type || 'info'
    }));
  });

  // Case events
  socket.on('case_update', (data) => {
    dispatch(showNotification({
      message: `Case "${data.title}" has been updated`,
      type: 'info'
    }));
  });

  // Query events
  socket.on('query_update', (data) => {
    dispatch(showNotification({
      message: `Query "${data.title}" has been updated`,
      type: 'info'
    }));
  });

  // Test events
  socket.on('test_update', (data) => {
    dispatch(showNotification({
      message: `Test "${data.title}" has been updated`,
      type: 'info'
    }));
  });
};

/**
 * Disconnect socket
 */
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}; 