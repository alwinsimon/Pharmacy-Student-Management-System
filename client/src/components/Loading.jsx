import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

/**
 * Loading component to display while content is loading
 * @param {Object} props - Component props
 * @param {string} props.message - Optional message to display
 * @param {string} props.size - Size of the loading indicator ('small', 'medium', 'large')
 * @returns {JSX.Element} The Loading component
 */
const Loading = ({ message = 'Loading...', size = 'medium' }) => {
  const getSize = () => {
    switch (size) {
      case 'small':
        return 24;
      case 'large':
        return 60;
      case 'medium':
      default:
        return 40;
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        minHeight: 200,
        width: '100%',
      }}
    >
      <CircularProgress size={getSize()} />
      {message && (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mt: 2 }}
        >
          {message}
        </Typography>
      )}
    </Box>
  );
};

export default Loading; 