import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  CircularProgress,
  Card,
  CardContent,
  CardHeader,
  IconButton
} from '@mui/material';
import {
  Assignment,
  QuestionAnswer,
  Quiz,
  MoreVert,
  TrendingUp,
  Timeline,
  NotificationsActive
} from '@mui/icons-material';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement } from 'chart.js';
import { Pie, Line } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement);

const Dashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  
  // Mock data - in a real app, this would come from API
  const [stats, setStats] = useState({
    cases: { total: 0, pending: 0, completed: 0, grade: 0 },
    queries: { total: 0, pending: 0, completed: 0, grade: 0 },
    tests: { total: 0, pending: 0, completed: 0, grade: 0 },
  });
  
  const [recentActivity, setRecentActivity] = useState([]);
  const [upcomingAssignments, setUpcomingAssignments] = useState([]);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      // Mock data - this would be replaced with actual API calls
      if (user?.role === 'student') {
        setStats({
          cases: { total: 8, pending: 3, completed: 5, grade: 85 },
          queries: { total: 12, pending: 2, completed: 10, grade: 78 },
          tests: { total: 5, pending: 1, completed: 4, grade: 92 },
        });
        
        setRecentActivity([
          { id: 1, type: 'case', title: 'Hypertension Case Study', action: 'evaluated', date: '2023-05-10', grade: 'A-' },
          { id: 2, type: 'query', title: 'Drug Interaction Query', action: 'submitted', date: '2023-05-08' },
          { id: 3, type: 'test', title: 'Pharmacology Midterm', action: 'completed', date: '2023-05-05', grade: 'B+' },
        ]);
        
        setUpcomingAssignments([
          { id: 1, type: 'case', title: 'Diabetes Management Case', dueDate: '2023-05-20' },
          { id: 2, type: 'query', title: 'Antibiotic Selection Query', dueDate: '2023-05-18' },
          { id: 3, type: 'test', title: 'Clinical Assessment Test', dueDate: '2023-05-25' },
        ]);
      } else if (user?.role === 'teacher') {
        setStats({
          cases: { total: 45, pending: 12, completed: 33 },
          queries: { total: 28, pending: 8, completed: 20 },
          tests: { total: 7, pending: 2, completed: 5 },
        });
        
        setRecentActivity([
          { id: 1, type: 'case', title: 'Emma Smith - Hypertension Case', action: 'evaluated', date: '2023-05-10' },
          { id: 2, type: 'query', title: 'John Doe - Drug Interaction Query', action: 'waiting review', date: '2023-05-08' },
          { id: 3, type: 'test', title: 'Pharmacology Midterm', action: 'created', date: '2023-05-05' },
        ]);
        
        setUpcomingAssignments([
          { id: 1, type: 'case', title: 'Review Cardiovascular Cases', dueDate: '2023-05-20' },
          { id: 2, type: 'query', title: 'Create New Drug Information Queries', dueDate: '2023-05-18' },
          { id: 3, type: 'test', title: 'Grade Clinical Assessment Tests', dueDate: '2023-05-25' },
        ]);
      }
      
      setIsLoading(false);
    }, 1000);
  }, [user]);

  // Chart data
  const pieData = {
    labels: ['Completed', 'Pending'],
    datasets: [
      {
        data: [stats.cases.completed + stats.queries.completed + stats.tests.completed, 
               stats.cases.pending + stats.queries.pending + stats.tests.pending],
        backgroundColor: ['rgba(54, 162, 235, 0.5)', 'rgba(255, 99, 132, 0.5)'],
        borderColor: ['rgba(54, 162, 235, 1)', 'rgba(255, 99, 132, 1)'],
        borderWidth: 1,
      },
    ],
  };
  
  const lineData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Performance',
        data: [65, 70, 68, 72, 78, 85],
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      }
    ],
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Grid container spacing={3}>
        {/* Welcome Card */}
        <Grid item xs={12}>
          <Paper
            sx={{
              p: 3,
              display: 'flex',
              flexDirection: 'column',
              backgroundImage: 'linear-gradient(to right, #4facfe 0%, #00f2fe 100%)',
              color: 'white',
            }}
          >
            <Typography variant="h4" gutterBottom>
              Welcome back, {user?.firstName}!
            </Typography>
            <Typography variant="body1">
              {user?.role === 'student' 
                ? 'Track your progress, submit assignments, and continue your clinical education journey.'
                : 'Manage student assignments, create evaluations, and track student progress.'}
            </Typography>
          </Paper>
        </Grid>

        {/* Quick Stats */}
        <Grid item xs={12} md={4}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 140,
              bgcolor: '#e3f2fd',
            }}
          >
            <Typography variant="h6" gutterBottom>
              Clinical Cases
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexGrow: 1 }}>
              <Box>
                <Typography variant="h4">{stats.cases.total}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {stats.cases.pending} pending
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: '#2196f3' }}>
                <Assignment />
              </Avatar>
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 140,
              bgcolor: '#e8f5e9',
            }}
          >
            <Typography variant="h6" gutterBottom>
              Queries
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexGrow: 1 }}>
              <Box>
                <Typography variant="h4">{stats.queries.total}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {stats.queries.pending} pending
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: '#4caf50' }}>
                <QuestionAnswer />
              </Avatar>
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 140,
              bgcolor: '#fff8e1',
            }}
          >
            <Typography variant="h6" gutterBottom>
              Tests
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexGrow: 1 }}>
              <Box>
                <Typography variant="h4">{stats.tests.total}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {stats.tests.pending} pending
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: '#ffc107' }}>
                <Quiz />
              </Avatar>
            </Box>
          </Paper>
        </Grid>

        {/* Charts & Activity */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" component="h2">
                {user?.role === 'student' ? 'Your Performance' : 'Student Performance'}
              </Typography>
              <IconButton>
                <MoreVert />
              </IconButton>
            </Box>
            <Divider />
            
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <Box sx={{ height: 200, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <Pie data={pieData} options={{ maintainAspectRatio: false }} />
                </Box>
                <Typography variant="subtitle2" align="center" sx={{ mt: 1 }}>
                  Completion Status
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Box sx={{ height: 200, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <Line data={lineData} options={{ maintainAspectRatio: false }} />
                </Box>
                <Typography variant="subtitle2" align="center" sx={{ mt: 1 }}>
                  Progress Trend
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" component="h2" gutterBottom>
              Upcoming Assignments
            </Typography>
            <Divider />
            
            <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
              {upcomingAssignments.map((item) => (
                <ListItem 
                  key={item.id}
                  alignItems="flex-start"
                  secondaryAction={
                    <Button 
                      size="small" 
                      variant="outlined"
                      onClick={() => navigate(`/${item.type}s${item.type === 'test' ? '/take' : '/new'}/${item.id}`)}
                    >
                      {user?.role === 'student' ? 'View' : 'Review'}
                    </Button>
                  }
                  sx={{ px: 0 }}
                >
                  <ListItemAvatar>
                    <Avatar sx={{ 
                      bgcolor: item.type === 'case' ? '#2196f3' : 
                               item.type === 'query' ? '#4caf50' : '#ffc107' 
                    }}>
                      {item.type === 'case' ? <Assignment /> : 
                       item.type === 'query' ? <QuestionAnswer /> : <Quiz />}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={item.title}
                    secondary={`Due: ${item.dueDate}`}
                  />
                </ListItem>
              ))}
            </List>
            
            <Box sx={{ mt: 2, alignSelf: 'center' }}>
              <Button variant="text" onClick={() => navigate('/assignments')}>
                View all assignments
              </Button>
            </Box>
          </Paper>
        </Grid>
        
        {/* Recent Activity */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" component="h2" gutterBottom>
              Recent Activity
            </Typography>
            <Divider />
            
            <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
              {recentActivity.map((item) => (
                <ListItem 
                  key={item.id}
                  alignItems="flex-start"
                  secondaryAction={
                    <Button 
                      size="small" 
                      variant="outlined"
                      onClick={() => navigate(`/${item.type}s/${item.id}`)}
                    >
                      Details
                    </Button>
                  }
                >
                  <ListItemAvatar>
                    <Avatar sx={{ 
                      bgcolor: item.type === 'case' ? '#2196f3' : 
                               item.type === 'query' ? '#4caf50' : '#ffc107' 
                    }}>
                      {item.type === 'case' ? <Assignment /> : 
                       item.type === 'query' ? <QuestionAnswer /> : <Quiz />}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={item.title}
                    secondary={
                      <>
                        <Typography component="span" variant="body2" color="text.primary">
                          {item.action.charAt(0).toUpperCase() + item.action.slice(1)}
                        </Typography>
                        {` — ${item.date}`}
                        {item.grade && ` — Grade: ${item.grade}`}
                      </>
                    }
                  />
                </ListItem>
              ))}
            </List>
            
            <Box sx={{ mt: 2, alignSelf: 'center' }}>
              <Button variant="text" onClick={() => navigate('/activity')}>
                View all activity
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard; 