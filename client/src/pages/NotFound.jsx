import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Button, Container, Typography } from '@mui/material';
import { SentimentDissatisfied } from '@mui/icons-material';
import { APP_INFO } from '../utils/constants';

const NotFound = () => {
  return (
    <Container maxWidth="md">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '80vh',
          textAlign: 'center',
        }}
      >
        <SentimentDissatisfied sx={{ fontSize: 100, color: 'text.secondary', mb: 2 }} />
        
        <Typography variant="h3" gutterBottom>
          404: Page Not Found
        </Typography>
        
        <Typography variant="h5" color="text.secondary" paragraph>
          Sorry, we couldn't find the page you're looking for.
        </Typography>
        
        <Button
          variant="contained"
          component={RouterLink}
          to="/dashboard"
          size="large"
          sx={{ mt: 2 }}
        >
          Go to Dashboard
        </Button>
      </Box>
    </Container>
  );
};

export default NotFound; 