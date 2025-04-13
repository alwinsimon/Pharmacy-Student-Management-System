import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Box,
  Button,
  Grid,
  Typography,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemButton,
  Chip,
  LinearProgress,
  useTheme
} from '@mui/material';
import {
  Add,
  Assignment,
  QuestionAnswer,
  Quiz,
  ArrowForward,
  Notifications,
  CalendarToday,
  TrendingUp
} from '@mui/icons-material';
import { USER_ROLES } from '../utils/constants';
import CustomCard from '../components/CustomCard';
import PageLayout from '../components/PageLayout';

// Mock data
const recentCases = [
  { id: 1, title: 'Hypertension Case Study', status: 'in review', updatedAt: '2023-05-15T10:30:00Z' },
  { id: 2, title: 'Diabetes Management', status: 'completed', updatedAt: '2023-05-10T14:20:00Z' },
  { id: 3, title: 'Asthma Exacerbation', status: 'submitted', updatedAt: '2023-05-08T09:15:00Z' },
];

const recentQueries = [
  { id: 1, title: 'Antibiotic Selection for UTI', status: 'responded', updatedAt: '2023-05-14T16:45:00Z' },
  { id: 2, title: 'Warfarin Dosing Protocol', status: 'assigned', updatedAt: '2023-05-12T11:30:00Z' },
];

const upcomingTests = [
  { id: 1, title: 'Pharmacokinetics Assessment', scheduledFor: '2023-05-20T14:00:00Z', timeLimit: 60 },
  { id: 2, title: 'Clinical Therapeutics Quiz', scheduledFor: '2023-05-25T10:00:00Z', timeLimit: 45 },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { user } = useSelector(state => state.auth);
  const [stats] = useState({
    casesCount: 12,
    queriesCount: 8,
    testsCount: 5,
    completedTests: 3
  });
  
  // Format date to readable format
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  // Format upcoming test date
  const formatTestDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const isToday = date.toDateString() === today.toDateString();
    const isTomorrow = date.toDateString() === tomorrow.toDateString();
    
    if (isToday) {
      return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (isTomorrow) {
      return `Tomorrow at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return `${formatDate(dateString)} at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
  };
  
  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'draft':
        return 'default';
      case 'submitted':
      case 'assigned':
        return 'primary';
      case 'in review':
        return 'warning';
      case 'completed':
      case 'responded':
      case 'evaluated':
        return 'success';
      default:
        return 'default';
    }
  };
  
  return (
    <PageLayout title={`Welcome${user ? ', ' + user.firstName : ''}`}>
      <Box className="fadeIn">
        <Grid container spacing={3}>
          {/* Stats Section */}
          <Grid item xs={12} md={8}>
            <Grid container spacing={3}>
              <Grid item xs={6} sm={3}>
                <CustomCard
                  bgColor={theme.palette.primary.main}
                  elevation={2}
                  sx={{ textAlign: 'center', py: 1 }}
                >
                  <Avatar
                    sx={{
                      bgcolor: 'primary.main',
                      width: 56,
                      height: 56,
                      mx: 'auto',
                      mb: 1,
                    }}
                  >
                    <Assignment />
                  </Avatar>
                  <Typography variant="h4" fontWeight="bold">
                    {stats.casesCount}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Clinical Cases
                  </Typography>
                </CustomCard>
              </Grid>
              
              <Grid item xs={6} sm={3}>
                <CustomCard
                  bgColor={theme.palette.info.main}
                  elevation={2}
                  sx={{ textAlign: 'center', py: 1 }}
                >
                  <Avatar
                    sx={{
                      bgcolor: 'info.main',
                      width: 56,
                      height: 56,
                      mx: 'auto',
                      mb: 1,
                    }}
                  >
                    <QuestionAnswer />
                  </Avatar>
                  <Typography variant="h4" fontWeight="bold">
                    {stats.queriesCount}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Queries
                  </Typography>
                </CustomCard>
              </Grid>
              
              <Grid item xs={6} sm={3}>
                <CustomCard
                  bgColor={theme.palette.warning.main}
                  elevation={2}
                  sx={{ textAlign: 'center', py: 1 }}
                >
                  <Avatar
                    sx={{
                      bgcolor: 'warning.main',
                      width: 56,
                      height: 56,
                      mx: 'auto',
                      mb: 1,
                    }}
                  >
                    <Quiz />
                  </Avatar>
                  <Typography variant="h4" fontWeight="bold">
                    {stats.testsCount}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Tests Assigned
                  </Typography>
                </CustomCard>
              </Grid>
              
              <Grid item xs={6} sm={3}>
                <CustomCard
                  bgColor={theme.palette.success.main}
                  elevation={2}
                  sx={{ textAlign: 'center', py: 1 }}
                >
                  <Avatar
                    sx={{
                      bgcolor: 'success.main',
                      width: 56,
                      height: 56,
                      mx: 'auto',
                      mb: 1,
                    }}
                  >
                    <TrendingUp />
                  </Avatar>
                  <Typography variant="h4" fontWeight="bold">
                    {stats.completedTests}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Tests Completed
                  </Typography>
                </CustomCard>
              </Grid>
            </Grid>
            
            {/* Recent Clinical Cases */}
            <Box sx={{ mt: 3 }}>
              <CustomCard
                title="Recent Clinical Cases"
                icon={<Assignment fontSize="small" />}
                action={
                  <Button 
                    endIcon={<ArrowForward />} 
                    size="small"
                    onClick={() => navigate('/cases')}
                  >
                    View All
                  </Button>
                }
                elevation={2}
              >
                {recentCases.length === 0 ? (
                  <Typography variant="body1" color="text.secondary" align="center" sx={{ py: 2 }}>
                    No clinical cases yet
                  </Typography>
                ) : (
                  <List disablePadding>
                    {recentCases.map((caseItem, index) => (
                      <React.Fragment key={caseItem.id}>
                        {index > 0 && <Divider component="li" />}
                        <ListItemButton onClick={() => navigate(`/cases/${caseItem.id}`)}>
                          <ListItemText
                            primary={caseItem.title}
                            secondary={`Updated: ${formatDate(caseItem.updatedAt)}`}
                            primaryTypographyProps={{ fontWeight: 'medium' }}
                          />
                          <Chip
                            label={caseItem.status}
                            size="small"
                            color={getStatusColor(caseItem.status)}
                            sx={{ textTransform: 'capitalize' }}
                          />
                        </ListItemButton>
                      </React.Fragment>
                    ))}
                  </List>
                )}
                
                {user?.role === USER_ROLES.STUDENT && (
                  <Box sx={{ textAlign: 'center', mt: 2 }}>
                    <Button
                      variant="outlined"
                      startIcon={<Add />}
                      onClick={() => navigate('/cases/new')}
                    >
                      New Case
                    </Button>
                  </Box>
                )}
              </CustomCard>
            </Box>
            
            {/* Clinical Queries */}
            <Box sx={{ mt: 3 }}>
              <CustomCard
                title="Clinical Queries"
                icon={<QuestionAnswer fontSize="small" />}
                action={
                  <Button 
                    endIcon={<ArrowForward />} 
                    size="small"
                    onClick={() => navigate('/queries')}
                  >
                    View All
                  </Button>
                }
                elevation={2}
              >
                {recentQueries.length === 0 ? (
                  <Typography variant="body1" color="text.secondary" align="center" sx={{ py: 2 }}>
                    No clinical queries yet
                  </Typography>
                ) : (
                  <List disablePadding>
                    {recentQueries.map((query, index) => (
                      <React.Fragment key={query.id}>
                        {index > 0 && <Divider component="li" />}
                        <ListItemButton onClick={() => navigate(`/queries/${query.id}`)}>
                          <ListItemText
                            primary={query.title}
                            secondary={`Updated: ${formatDate(query.updatedAt)}`}
                            primaryTypographyProps={{ fontWeight: 'medium' }}
                          />
                          <Chip
                            label={query.status}
                            size="small"
                            color={getStatusColor(query.status)}
                            sx={{ textTransform: 'capitalize' }}
                          />
                        </ListItemButton>
                      </React.Fragment>
                    ))}
                  </List>
                )}
                
                {user?.role === USER_ROLES.TEACHER && (
                  <Box sx={{ textAlign: 'center', mt: 2 }}>
                    <Button
                      variant="outlined"
                      startIcon={<Add />}
                      onClick={() => navigate('/queries/new')}
                    >
                      New Query
                    </Button>
                  </Box>
                )}
              </CustomCard>
            </Box>
          </Grid>
          
          {/* Sidebar */}
          <Grid item xs={12} md={4}>
            {/* Profile Summary */}
            <CustomCard
              elevation={2}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                py: 3
              }}
            >
              <Avatar
                sx={{
                  width: 84,
                  height: 84,
                  bgcolor: 'primary.main',
                  fontSize: '2rem',
                  mb: 2
                }}
              >
                {user?.firstName?.charAt(0) || 'U'}
              </Avatar>
              <Typography variant="h5" fontWeight="bold">
                {user?.firstName} {user?.lastName}
              </Typography>
              <Chip
                label={user?.role?.toUpperCase() || 'USER'}
                color="primary"
                size="small"
                sx={{ mt: 1, textTransform: 'uppercase', fontWeight: 'bold' }}
              />
              
              <Box sx={{ width: '100%', mt: 3 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom align="left">
                  Overall Progress
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={60} 
                  sx={{ height: 8, borderRadius: 4 }} 
                />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                  <Typography variant="caption" color="text.secondary">
                    Progress
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    60%
                  </Typography>
                </Box>
              </Box>
              
              <Button
                variant="outlined"
                onClick={() => navigate('/profile')}
                sx={{ mt: 2 }}
              >
                View Profile
              </Button>
            </CustomCard>
            
            {/* Upcoming Tests */}
            <Box sx={{ mt: 3 }}>
              <CustomCard
                title="Upcoming Tests"
                icon={<Quiz fontSize="small" />}
                action={
                  <Button 
                    endIcon={<ArrowForward />} 
                    size="small"
                    onClick={() => navigate('/tests')}
                  >
                    View All
                  </Button>
                }
                elevation={2}
              >
                {upcomingTests.length === 0 ? (
                  <Typography variant="body1" color="text.secondary" align="center" sx={{ py: 2 }}>
                    No upcoming tests
                  </Typography>
                ) : (
                  <List disablePadding>
                    {upcomingTests.map((test, index) => (
                      <React.Fragment key={test.id}>
                        {index > 0 && <Divider component="li" />}
                        <ListItem>
                          <ListItemAvatar>
                            <Avatar sx={{ bgcolor: 'warning.main' }}>
                              <CalendarToday />
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={test.title}
                            secondary={formatTestDate(test.scheduledFor)}
                            primaryTypographyProps={{ fontWeight: 'medium' }}
                          />
                        </ListItem>
                      </React.Fragment>
                    ))}
                  </List>
                )}
                
                {user?.role === USER_ROLES.TEACHER && (
                  <Box sx={{ textAlign: 'center', mt: 2 }}>
                    <Button
                      variant="outlined"
                      startIcon={<Add />}
                      onClick={() => navigate('/tests/new')}
                    >
                      New Test
                    </Button>
                  </Box>
                )}
              </CustomCard>
            </Box>
            
            {/* Notifications */}
            <Box sx={{ mt: 3 }}>
              <CustomCard
                title="Notifications"
                icon={<Notifications fontSize="small" />}
                elevation={2}
              >
                <List disablePadding>
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'info.main' }}>
                        <QuestionAnswer />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary="New query response"
                      secondary="Dr. Smith responded to your query"
                      primaryTypographyProps={{ fontWeight: 'medium' }}
                    />
                  </ListItem>
                  <Divider component="li" />
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'success.main' }}>
                        <Assignment />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary="Case reviewed"
                      secondary="Your hypertension case was reviewed"
                      primaryTypographyProps={{ fontWeight: 'medium' }}
                    />
                  </ListItem>
                </List>
              </CustomCard>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </PageLayout>
  );
};

export default Dashboard; 