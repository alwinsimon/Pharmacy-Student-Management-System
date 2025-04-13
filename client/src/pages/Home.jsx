import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useTheme } from 'react-redux';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Divider,
  Grid,
  Paper,
  Typography,
  useMediaQuery,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Stack
} from '@mui/material';
import { useTheme as useMuiTheme } from '@mui/material/styles';
import {
  Assignment,
  QuestionAnswer,
  Quiz,
  BarChart,
  School,
  LocalPharmacy,
  ArrowForward,
  CheckCircle
} from '@mui/icons-material';
import { APP_INFO } from '../utils/constants';

const Home = () => {
  const navigate = useNavigate();
  const theme = useMuiTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isAuthenticated = useSelector(state => !!state.auth.user);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Container>
        <Box sx={{ py: 8 }}>
          <Typography variant="h4" component="h1" sx={{ mb: 4 }}>
            Welcome to Our Platform
          </Typography>
          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={() => navigate(isAuthenticated ? '/dashboard' : '/register')}
            sx={{ px: 4, py: 1.5, borderRadius: 2 }}
          >
            {isAuthenticated ? 'Go to Dashboard' : 'Create an Account'}
          </Button>
        </Box>
      </Container>

      {/* Footer */}
      <Box 
        component="footer" 
        sx={{ 
          py: 4, 
          bgcolor: theme.palette.mode === 'dark' ? 'background.paper' : 'background.paper',
          borderTop: `1px solid ${theme.palette.divider}`
        }}
      >
        <Container>
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <LocalPharmacy sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6" component="div" fontWeight="bold">
                  {APP_INFO.NAME}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" paragraph>
                {APP_INFO.DESCRIPTION}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {APP_INFO.COPYRIGHT}
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Quick Links
              </Typography>
              <List dense disablePadding>
                {['Home', 'Features', 'Pricing', 'About Us', 'Contact'].map((item) => (
                  <ListItem key={item} disablePadding disableGutters sx={{ py: 0.5 }}>
                    <Button
                      color="inherit"
                      sx={{ color: 'text.secondary', p: 0 }}
                    >
                      {item}
                    </Button>
                  </ListItem>
                ))}
              </List>
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Contact
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Have questions or need assistance?
              </Typography>
              <Button 
                variant="outlined" 
                color="primary"
                size="small"
                onClick={() => navigate('/help')}
              >
                Contact Support
              </Button>
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Email: {APP_INFO.SUPPORT_EMAIL}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Website: {APP_INFO.WEBSITE}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default Home; 