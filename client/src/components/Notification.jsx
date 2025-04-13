import React from 'react';
import { Snackbar, Alert as MuiAlert } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { hideNotification } from '../features/ui/uiSlice';

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const Notification = () => {
  const dispatch = useDispatch();
  const { notification } = useSelector((state) => state.ui);
  
  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    dispatch(hideNotification());
  };

  return (
    <Snackbar
      open={notification.show}
      autoHideDuration={notification.duration || 6000}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
    >
      <Alert onClose={handleClose} severity={notification.type || 'info'}>
        {notification.message}
      </Alert>
    </Snackbar>
  );
};

export default Notification; 