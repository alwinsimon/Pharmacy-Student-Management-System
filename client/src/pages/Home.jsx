import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Box,
  Button,
  Container,
  Grid,
  Typography,
  useMediaQuery,
  Paper,
  Card,
  CardContent,
  Avatar,
  Stack
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
  LocalPharmacy,
  CheckCircle,
  School,
  Assignment,
  QuestionAnswer,
  Quiz,
  BarChart
} from '@mui/icons-material';
import { APP_INFO } from '../utils/constants';

const Home = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isAuthenticated = useSelector(state => !!state.auth.user);

  // Stats data
  const stats = [
    { label: 'Students', value: '500+', icon: <School color="primary" /> },
    { label: 'Clinical Cases', value: '2,000+', icon: <Assignment color="primary" /> },
    { label: 'Assessments', value: '350+', icon: <Quiz color="primary" /> },
    { label: 'Success Rate', value: '95%', icon: <BarChart color="primary" /> }
  ];

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          pt: { xs: 10, md: 15 },
          pb: { xs: 8, md: 12 },
          background: theme.palette.mode === 'dark' 
            ? 'linear-gradient(180deg, rgba(26,26,26,1) 0%, rgba(30,30,30,1) 100%)' 
            : 'linear-gradient(180deg, #f5f7fa 0%, #e4e9f2 100%)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Background elements */}
        <Box
          sx={{
            position: 'absolute',
            top: -100,
            right: -100,
            width: 300,
            height: 300,
            borderRadius: '50%',
            backgroundColor: 'primary.main',
            opacity: 0.05,
            zIndex: 0
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: -50,
            left: -50,
            width: 200,
            height: 200,
            borderRadius: '50%',
            backgroundColor: 'secondary.main',
            opacity: 0.05,
            zIndex: 0
          }}
        />
        
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              <Box sx={{ animation: 'fadeIn 0.8s ease-out' }}>
                <Typography 
                  variant="overline" 
                  component="div" 
                  color="primary"
                  fontWeight="bold"
                  sx={{ mb: 1 }}
                >
                  {APP_INFO.TAGLINE}
                </Typography>
                
                <Typography 
                  variant="h2" 
                  component="h1" 
                  fontWeight="bold"
                  sx={{ 
                    fontSize: { xs: '2.5rem', md: '3.5rem' },
                    lineHeight: 1.2,
                    mb: 2
                  }}
                >
                  {APP_INFO.HERO_TAGLINE}
                  <Box component="span" sx={{ 
                    color: 'primary.main', 
                    display: 'block',
                    position: 'relative'
                  }}>
                    {APP_INFO.NAME}
                    <Box 
                      component="span" 
                      sx={{ 
                        position: 'absolute',
                        height: '8px',
                        width: '40%',
                        bottom: '8px',
                        left: '0',
                        backgroundColor: 'primary.main',
                        opacity: 0.2,
                        zIndex: -1
                      }} 
                    />
                  </Box>
                </Typography>
                
                <Typography 
                  variant="h6" 
                  color="text.secondary" 
                  paragraph
                  sx={{ mb: 4, maxWidth: '90%' }}
                >
                  {APP_INFO.HERO_DESCRIPTION}
                </Typography>
                
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  {!isAuthenticated && (
                    <>
                      <Button 
                        variant="contained" 
                        size="large" 
                        onClick={() => navigate('/register')}
                        sx={{ 
                          px: 4, 
                          py: 1.5, 
                          borderRadius: 2,
                          boxShadow: theme.shadows[8]
                        }}
                      >
                        Get Started
                      </Button>
                      <Button 
                        variant="outlined" 
                        size="large" 
                        onClick={() => navigate('/login')}
                        sx={{ px: 4, py: 1.5, borderRadius: 2 }}
                      >
                        Sign In
                      </Button>
                    </>
                  )}
                  {isAuthenticated && (
                    <Button 
                      variant="contained" 
                      size="large" 
                      onClick={() => navigate('/dashboard')}
                      sx={{ 
                        px: 4, 
                        py: 1.5, 
                        borderRadius: 2,
                        boxShadow: theme.shadows[8]
                      }}
                    >
                      Go to Dashboard
                    </Button>
                  )}
                </Stack>
                
                {/* Stats section */}
                <Grid container spacing={3} sx={{ mt: 6 }}>
                  {stats.map((stat, index) => (
                    <Grid item xs={6} sm={3} key={index}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography 
                          variant="h4" 
                          component="div" 
                          fontWeight="bold" 
                          color="primary.main"
                        >
                          {stat.value}
                        </Typography>
                        <Box 
                          sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            mt: 1
                          }}
                        >
                          {stat.icon}
                          <Typography variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>
                            {stat.label}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={6} sx={{ display: { xs: 'none', md: 'block' } }}>
              <Box
                sx={{
                  position: 'relative',
                  animation: 'fadeIn 1s ease-out',
                  transformStyle: 'preserve-3d',
                  perspective: '1000px'
                }}
              >
                {/* Use a placeholder color box until you have a real image */}
                <Paper
                  elevation={8}
                  sx={{
                    width: '100%',
                    maxWidth: 560,
                    height: 320,
                    mx: 'auto',
                    borderRadius: 4,
                    bgcolor: 'primary.main',
                    opacity: 0.9,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transform: 'rotateY(-5deg) rotateX(5deg)',
                    transition: 'transform 0.5s ease',
                    '&:hover': {
                      transform: 'rotateY(0deg) rotateX(0deg)',
                    }
                  }}
                >
                  <LocalPharmacy sx={{ fontSize: 80, color: 'white' }} />
                </Paper>

                {/* Floating UI elements */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: '10%',
                    left: '-5%',
                    transform: 'rotate(-5deg)',
                    animation: 'fadeIn 1.2s ease-out',
                    zIndex: 10
                  }}
                >
                  <Paper
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      boxShadow: theme.shadows[8],
                      backgroundColor: theme.palette.background.paper,
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <CheckCircle color="success" sx={{ mr: 1 }} />
                      <Typography variant="body2" fontWeight="medium">
                        Case Submitted
                      </Typography>
                    </Box>
                  </Paper>
                </Box>
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: '15%',
                    right: '-5%',
                    transform: 'rotate(5deg)',
                    animation: 'fadeIn 1.4s ease-out',
                    zIndex: 10
                  }}
                >
                  <Paper
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      boxShadow: theme.shadows[8],
                      backgroundColor: theme.palette.background.paper,
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Quiz color="primary" sx={{ mr: 1 }} />
                      <Typography variant="body2" fontWeight="medium">
                        92% Score
                      </Typography>
                    </Box>
                  </Paper>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Container sx={{ py: 10 }}>
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography 
            variant="h3" 
            component="h2" 
            gutterBottom 
            fontWeight="bold"
            sx={{
              position: 'relative',
              display: 'inline-block'
            }}
          >
            Powerful Features
            <Box 
              component="span" 
              sx={{ 
                position: 'absolute',
                height: '8px',
                width: '100%',
                bottom: '8px',
                left: '0',
                backgroundColor: 'primary.main',
                opacity: 0.2,
                zIndex: -1,
                borderRadius: 4
              }} 
            />
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 700, mx: 'auto' }}>
            Everything you need to manage clinical pharmacy education in one platform
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {APP_INFO.FEATURES.map((feature, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card 
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  transition: 'transform 0.3s, box-shadow 0.3s',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: theme.shadows[10],
                  },
                  borderTop: `4px solid ${feature.color}`,
                  overflow: 'visible'
                }}
                elevation={3}
              >
                <CardContent sx={{ flexGrow: 1, textAlign: 'center', p: 3 }}>
                  <Avatar 
                    sx={{ 
                      width: 64, 
                      height: 64, 
                      bgcolor: `${feature.color}15`, 
                      color: feature.color,
                      mx: 'auto',
                      mb: 2,
                      transform: 'translateY(-32px)',
                      boxShadow: theme.shadows[3],
                    }}
                  >
                    {feature.icon === 'Assignment' && <Assignment fontSize="large" />}
                    {feature.icon === 'QuestionAnswer' && <QuestionAnswer fontSize="large" />}
                    {feature.icon === 'Quiz' && <Quiz fontSize="large" />}
                    {feature.icon === 'BarChart' && <BarChart fontSize="large" />}
                  </Avatar>
                  <Typography 
                    variant="h6" 
                    component="h3" 
                    gutterBottom 
                    fontWeight="bold"
                    sx={{ mt: -1 }}
                  >
                    {feature.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Benefits Section */}
      <Box sx={{ 
        py: 10, 
        bgcolor: theme.palette.mode === 'dark' ? 'background.paper' : 'background.subtle' 
      }}>
        <Container>
          <Grid container spacing={8} alignItems="center">
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: '100%',
                  position: 'relative'
                }}
              >
                <Box 
                  sx={{ 
                    width: 280,
                    height: 280,
                    borderRadius: '50%',
                    background: theme.palette.mode === 'dark' 
                      ? 'linear-gradient(135deg, rgba(63, 81, 181, 0.15) 0%, rgba(33, 150, 243, 0.15) 100%)' 
                      : 'linear-gradient(135deg, rgba(63, 81, 181, 0.1) 0%, rgba(33, 150, 243, 0.1) 100%)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 1
                  }} 
                >
                  <LocalPharmacy 
                    sx={{ 
                      fontSize: 140, 
                      color: 'primary.main',
                      opacity: 0.9
                    }} 
                  />
                </Box>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="h3" component="h2" gutterBottom fontWeight="bold">
                Why Choose {APP_INFO.NAME}?
              </Typography>
              
              <Typography variant="body1" paragraph color="text.secondary" sx={{ mb: 4 }}>
                Our platform streamlines the clinical education process for pharmacy students, 
                providing tools for documentation, assessment, and feedback in one integrated system.
              </Typography>
              
              <Grid container spacing={2}>
                {APP_INFO.BENEFITS.map((benefit, index) => (
                  <Grid item xs={12} sm={6} key={index}>
                    <Box 
                      sx={{ 
                        display: 'flex', 
                        p: 1.5,
                        transition: 'transform 0.2s',
                        '&:hover': {
                          transform: 'translateX(5px)'
                        }
                      }}
                    >
                      <Avatar 
                        sx={{ 
                          bgcolor: 'primary.main',
                          color: 'primary.contrastText',
                          width: 36,
                          height: 36,
                          mr: 2
                        }}
                      >
                        <CheckCircle fontSize="small" />
                      </Avatar>
                      <Typography variant="body1" fontWeight="medium">
                        {benefit}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
              
              <Button
                variant="contained"
                color="primary"
                sx={{ mt: 4, px: 4, py: 1.5, borderRadius: 2 }}
                onClick={() => navigate(isAuthenticated ? '/dashboard' : '/register')}
              >
                {isAuthenticated ? 'Go to Dashboard' : 'Get Started'}
              </Button>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Call to Action */}
      <Box 
        sx={{ 
          py: 10, 
          textAlign: 'center', 
          bgcolor: theme.palette.mode === 'dark' 
            ? 'rgba(0,0,0,0.7)' 
            : 'rgba(255,255,255,0.9)', 
        }}
      >
        <Container maxWidth="md">
          <Typography variant="h3" component="h2" gutterBottom fontWeight="bold">
            Ready to Get Started?
          </Typography>
          
          <Typography variant="body1" paragraph color="text.secondary" sx={{ mb: 4, maxWidth: 700, mx: 'auto' }}>
            Join thousands of pharmacy students and educators already using our platform to enhance 
            clinical education experiences.
          </Typography>
          
          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={() => navigate(isAuthenticated ? '/dashboard' : '/register')}
            sx={{ 
              px: 5, 
              py: 1.5, 
              borderRadius: 2,
              boxShadow: theme.shadows[10],
              fontSize: '1.1rem',
              transition: 'all 0.3s',
              '&:hover': {
                transform: 'scale(1.05)',
                boxShadow: theme.shadows[15],
              }
            }}
          >
            {isAuthenticated ? 'Go to Dashboard' : 'Create an Account'}
          </Button>
        </Container>
      </Box>
    </Box>
  );
};

export default Home; 