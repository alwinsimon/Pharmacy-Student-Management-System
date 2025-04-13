import React from 'react';
import { Backdrop, CircularProgress } from '@mui/material';
import { useSelector } from 'react-redux';

const GlobalLoader = () => {
  const { loading } = useSelector((state) => state.ui);
  
  return (
    <Backdrop
      sx={{ 
        color: '#fff', 
        zIndex: (theme) => theme.zIndex.drawer + 1,
        flexDirection: 'column',
      }}
      open={loading.global}
    >
      <CircularProgress color="inherit" />
    </Backdrop>
  );
};

export default GlobalLoader; 