import { showNotification } from '../features/ui/uiSlice';

export const setupSocketListeners = (socket, dispatch) => {
  if (!socket) return;

  // Handle new notification
  socket.on('notification', (data) => {
    dispatch(showNotification({
      message: data.message,
      type: data.type || 'info'
    }));
  });

  // Handle case updates
  socket.on('case_update', (data) => {
    dispatch(showNotification({
      message: `Case "${data.title}" has been ${data.action}`,
      type: 'info'
    }));
    
    // You could also dispatch an action to refresh cases or update a specific case
  });

  // Handle query updates
  socket.on('query_update', (data) => {
    dispatch(showNotification({
      message: `Query "${data.title}" has been ${data.action}`,
      type: 'info'
    }));
  });

  // Handle test updates
  socket.on('test_update', (data) => {
    dispatch(showNotification({
      message: `Test "${data.title}" has been ${data.action}`,
      type: 'info'
    }));
  });

  // Handle connection events
  socket.on('connect', () => {
    console.log('Socket connected');
  });

  socket.on('disconnect', () => {
    console.log('Socket disconnected');
  });

  socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error);
  });
}; 