import React from 'react';
import { Box, Container, Grid, Typography, Link, useTheme } from '@mui/material';
import { APP_INFO } from '../utils/constants';
import { LocalPharmacy } from '@mui/icons-material';

/**
 * Footer component for the application
 * @returns {JSX.Element} Footer component
 */
const Footer = () => {
  const theme = useTheme();
  
  return (
    <Box 
      component="footer" 
      sx={{ 
        py: 3, 
        bgcolor: theme.palette.mode === 'dark' ? 'background.paper' : 'background.paper',
        borderTop: `1px solid ${theme.palette.divider}`,
        mt: 'auto'
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={3} justifyContent="space-between">
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <LocalPharmacy sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6" component="div" fontWeight="bold">
                {APP_INFO.NAME}
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              {APP_INFO.DESCRIPTION}
            </Typography>
          </Grid>
          
          <Grid item xs={12} md={4} sx={{ textAlign: { xs: 'left', md: 'center' } }}>
            <Typography variant="body2" color="text.secondary">
              <Link href="/help" color="inherit" underline="hover">Help Center</Link>
              {' • '}
              <Link href="/terms" color="inherit" underline="hover">Terms</Link>
              {' • '}
              <Link href="/privacy" color="inherit" underline="hover">Privacy</Link>
            </Typography>
          </Grid>
          
          <Grid item xs={12} md={4} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
            <Typography variant="body2" color="text.secondary">
              {APP_INFO.COPYRIGHT}
            </Typography>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Footer; 