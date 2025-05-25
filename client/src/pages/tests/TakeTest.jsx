import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Divider,
  Grid,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Paper,
  Tab,
  Tabs,
  Typography,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Stack
} from '@mui/material';
import {
  ArrowBack,
  PictureAsPdf,
  Edit,
  PlayArrow,
  Shuffle
} from '@mui/icons-material';
import { getTestById, getClassResults } from '../../features/tests/testsSlice';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, BarElement } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, BarElement);

// TabPanel component
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`test-tabpanel-${index}`}
      aria-labelledby={`test-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const TakeTest = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentTest, classResults, isLoading } = useSelector((state) => state.tests);
  const { user } = useSelector((state) => state.auth);
  
  const [tabValue, setTabValue] = useState(0);
  
  useEffect(() => {
    dispatch(getTestById(id));
    if (user?.role === 'teacher') {
      dispatch(getClassResults(id));
    }
  }, [id, dispatch, user]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const getStatusChip = (status) => {
    switch (status) {
      case 'draft':
        return <Chip label="Draft" color="default" size="small" />;
      case 'published':
        return <Chip label="Published" color="primary" size="small" />;
      case 'active':
        return <Chip label="Active" color="info" size="small" />;
      case 'completed':
        return <Chip label="Completed" color="success" size="small" />;
      default:
        return <Chip label={status} size="small" />;
    }
  };

  // Calculate score distribution for chart
  const getScoreDistribution = () => {
    if (!classResults || !classResults.studentResults) return null;
    
    const ranges = {
      '0-20%': 0,
      '21-40%': 0,
      '41-60%': 0,
      '61-80%': 0,
      '81-100%': 0
    };
    
    classResults.studentResults.forEach(result => {
      const score = result.score;
      if (score <= 20) ranges['0-20%']++;
      else if (score <= 40) ranges['21-40%']++;
      else if (score <= 60) ranges['41-60%']++;
      else if (score <= 80) ranges['61-80%']++;
      else ranges['81-100%']++;
    });
    
    return {
      labels: Object.keys(ranges),
      datasets: [
        {
          label: 'Number of Students',
          data: Object.values(ranges),
          backgroundColor: [
            '#FF6384',
            '#36A2EB',
            '#FFCE56',
            '#4BC0C0',
            '#9966FF'
          ],
          borderWidth: 1
        }
      ]
    };
  };
  
  // Calculate question difficulty for chart
  const getQuestionDifficulty = () => {
    if (!classResults || !classResults.questionStats) return null;
    
    return {
      labels: classResults.questionStats.map((_, index) => `Q${index + 1}`),
      datasets: [
        {
          label: 'Correct Answers (%)',
          data: classResults.questionStats.map(q => q.correctPercentage),
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1
        }
      ]
    };
  };

  if (isLoading || !currentTest) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={() => navigate('/tests')}
          sx={{ mb: 2 }}
        >
          Back to Tests
        </Button>
        
        <Grid container justifyContent="space-between" alignItems="center">
          <Grid item>
            <Typography variant="h4" component="h1" gutterBottom>
              {currentTest.title}
            </Typography>
            <Stack direction="row" spacing={2} alignItems="center">
              {getStatusChip(currentTest.status)}
              <Typography variant="body2" color="text.secondary">
                Created: {new Date(currentTest.createdAt).toLocaleString()}
              </Typography>
            </Stack>
          </Grid>
          
          <Grid item>
            <Stack direction="row" spacing={1}>
              {user?.role === 'student' && currentTest.status === 'published' && (
                <Button
                  variant="contained"
                  startIcon={<PlayArrow />}
                  onClick={() => navigate(`/tests/${id}/take`)}
                >
                  Take Test
                </Button>
              )}
              
              {user?.role === 'teacher' && currentTest.status === 'draft' && (
                <Button
                  variant="outlined"
                  startIcon={<Edit />}
                  onClick={() => navigate(`/tests/${id}/edit`)}
                >
                  Edit
                </Button>
              )}
              
              <Button
                variant="outlined"
                startIcon={<PictureAsPdf />}
                onClick={() => {/* Generate PDF logic */}}
              >
                Export PDF
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </Box>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ mb: 3 }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs 
                value={tabValue} 
                onChange={handleTabChange}
                variant="scrollable"
                scrollButtons="auto"
              >
                <Tab label="Details" />
                {user?.role === 'teacher' && <Tab label="Questions" />}
                {user?.role === 'teacher' && currentTest.status === 'completed' && <Tab label="Results" />}
                {user?.role === 'student' && currentTest.userResult && <Tab label="My Results" />}
              </Tabs>
            </Box>
            
            <TabPanel value={tabValue} index={0}>
              <Typography variant="h6" gutterBottom>
                Test Description
              </Typography>
              
              <Typography variant="body1" paragraph sx={{ whiteSpace: 'pre-line' }}>
                {currentTest.description || 'No description provided'}
              </Typography>
              
              <Divider sx={{ my: 3 }} />
              
              <Typography variant="h6" gutterBottom>
                Test Information
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1" gutterBottom>
                    Number of Questions
                  </Typography>
                  <Typography variant="body1">
                    {currentTest.questionCount || 0}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1" gutterBottom>
                    Time Limit
                  </Typography>
                  <Typography variant="body1">
                    {currentTest.timeLimit ? `${currentTest.timeLimit} minutes` : 'No time limit'}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1" gutterBottom>
                    Passing Criteria
                  </Typography>
                  <Typography variant="body1">
                    {currentTest.passingCriteria === 'fixed' 
                      ? `Fixed score: ${currentTest.passingScore}%` 
                      : 'Relative to top score'}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1" gutterBottom>
                    Test Period
                  </Typography>
                  <Typography variant="body1">
                    {currentTest.scheduledFor 
                      ? `${new Date(currentTest.scheduledFor).toLocaleDateString()} to ${new Date(currentTest.scheduledEnd).toLocaleDateString()}`
                      : 'Not scheduled yet'}
                  </Typography>
                </Grid>
              </Grid>
            </TabPanel>
            
            {user?.role === 'teacher' && (
              <TabPanel value={tabValue} index={1}>
                <Typography variant="h6" gutterBottom>
                  Test Questions
                </Typography>
                
                {currentTest.questions && currentTest.questions.map((question, index) => (
                  <Card key={index} sx={{ mb: 3 }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                        <Typography variant="subtitle1" fontWeight="bold">
                          Question {index + 1}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {question.type === 'single' ? 'Single Answer' : 'Multiple Answers'} - {question.points} point{question.points !== 1 ? 's' : ''}
                        </Typography>
                      </Box>
                      
                      <Typography variant="body1" paragraph>
                        {question.text}
                      </Typography>
                      
                      <Typography variant="subtitle2" gutterBottom>
                        Options:
                      </Typography>
                      
                      <List dense sx={{ mb: 0 }}>
                        {question.options.map((option, optIndex) => (
                          <ListItem 
                            key={optIndex}
                            sx={{ 
                              bgcolor: option.isCorrect ? 'success.50' : 'inherit',
                              borderRadius: 1,
                              mb: 0.5
                            }}
                          >
                            <ListItemText 
                              primary={option.text} 
                              primaryTypographyProps={{
                                sx: { fontWeight: option.isCorrect ? 'bold' : 'normal' }
                              }}
                            />
                            {option.isCorrect && (
                              <Chip label="Correct" size="small" color="success" />
                            )}
                          </ListItem>
                        ))}
                      </List>
                    </CardContent>
                  </Card>
                ))}
              </TabPanel>
            )}
            
            {user?.role === 'teacher' && currentTest.status === 'completed' && (
              <TabPanel value={tabValue} index={2}>
                <Typography variant="h6" gutterBottom>
                  Class Results
                </Typography>
                
                {!classResults ? (
                  <CircularProgress />
                ) : (
                  <>
                    <Grid container spacing={4} sx={{ mb: 4 }}>
                      <Grid item xs={12} md={6}>
                        <Paper sx={{ p: 2, textAlign: 'center' }}>
                          <Typography variant="h3" color="primary">
                            {classResults.averageScore?.toFixed(1)}%
                          </Typography>
                          <Typography variant="subtitle1">
                            Class Average
                          </Typography>
                        </Paper>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Paper sx={{ p: 2, textAlign: 'center' }}>
                          <Typography variant="h3" color={classResults.passRate >= 70 ? 'success.main' : 'warning.main'}>
                            {classResults.passRate}%
                          </Typography>
                          <Typography variant="subtitle1">
                            Pass Rate
                          </Typography>
                        </Paper>
                      </Grid>
                    </Grid>
                    
                    <Grid container spacing={4}>
                      <Grid item xs={12} md={6}>
                        <Typography variant="subtitle1" gutterBottom>
                          Score Distribution
                        </Typography>
                        {getScoreDistribution() && (
                          <Box sx={{ height: 300 }}>
                            <Pie 
                              data={getScoreDistribution()} 
                              options={{ 
                                maintainAspectRatio: false,
                                plugins: {
                                  legend: {
                                    position: 'bottom'
                                  }
                                }
                              }} 
                            />
                          </Box>
                        )}
                      </Grid>
                      
                      <Grid item xs={12} md={6}>
                        <Typography variant="subtitle1" gutterBottom>
                          Question Difficulty
                        </Typography>
                        {getQuestionDifficulty() && (
                          <Box sx={{ height: 300 }}>
                            <Bar 
                              data={getQuestionDifficulty()} 
                              options={{ 
                                maintainAspectRatio: false,
                                scales: {
                                  y: {
                                    beginAtZero: true,
                                    max: 100,
                                    title: {
                                      display: true,
                                      text: 'Percentage Correct'
                                    }
                                  }
                                }
                              }} 
                            />
                          </Box>
                        )}
                      </Grid>
                    </Grid>
                    
                    <Divider sx={{ my: 4 }} />
                    
                    <Typography variant="h6" gutterBottom>
                      Student Results
                    </Typography>
                    
                    <TableContainer component={Paper} sx={{ mt: 2 }}>
                      <Table>
                        <TableHead>
                          <TableRow sx={{ bgcolor: 'background.default' }}>
                            <TableCell>Student</TableCell>
                            <TableCell align="center">Score</TableCell>
                            <TableCell align="center">Time Taken</TableCell>
                            <TableCell align="center">Status</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {classResults.studentResults?.map((result, index) => (
                            <TableRow key={index}>
                              <TableCell>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  <Avatar sx={{ mr: 1 }}>
                                    {result.studentName?.charAt(0) || 'S'}
                                  </Avatar>
                                  <Typography variant="body2">
                                    {result.studentName || `Student ${index + 1}`}
                                  </Typography>
                                </Box>
                              </TableCell>
                              <TableCell align="center">
                                <Typography 
                                  variant="body2" 
                                  color={result.passed ? 'success.main' : 'error.main'}
                                  fontWeight="bold"
                                >
                                  {result.score}%
                                </Typography>
                              </TableCell>
                              <TableCell align="center">
                                {result.timeTaken ? `${Math.floor(result.timeTaken / 60)}m ${result.timeTaken % 60}s` : 'N/A'}
                              </TableCell>
                              <TableCell align="center">
                                <Chip 
                                  label={result.passed ? 'Passed' : 'Failed'} 
                                  color={result.passed ? 'success' : 'error'} 
                                  size="small"
                                />
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </>
                )}
              </TabPanel>
            )}
            
            {user?.role === 'student' && currentTest.userResult && (
              <TabPanel value={tabValue} index={1}>
                <Box sx={{ textAlign: 'center', mb: 4 }}>
                  <Typography variant="h2" color={currentTest.userResult.passed ? 'success.main' : 'error.main'}>
                    {currentTest.userResult.score}%
                  </Typography>
                  
                  <Typography variant="h6" color={currentTest.userResult.passed ? 'success.main' : 'error.main'} gutterBottom>
                    {currentTest.userResult.passed ? 'Passed!' : 'Failed'}
                  </Typography>
                  
                  <Typography variant="body1">
                    You answered {currentTest.userResult.correctCount} out of {currentTest.userResult.totalQuestions} questions correctly.
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Completed on: {new Date(currentTest.userResult.completedAt).toLocaleString()}
                  </Typography>
                </Box>
                
                {currentTest.userResult.showAnswers && currentTest.userResult.questions && (
                  <>
                    <Divider sx={{ my: 3 }} />
                    
                    <Typography variant="h6" gutterBottom>
                      Question Review
                    </Typography>
                    
                    {currentTest.userResult.questions.map((question, index) => (
                      <Card key={index} sx={{ mb: 3 }}>
                        <CardContent>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                            <Typography variant="subtitle1" fontWeight="bold">
                              Question {index + 1}
                            </Typography>
                            <Chip 
                              label={question.correct ? "Correct" : "Incorrect"}
                              color={question.correct ? "success" : "error"}
                              size="small"
                            />
                          </Box>
                          
                          <Typography variant="body1" paragraph>
                            {question.text}
                          </Typography>
                          
                          <List dense>
                            {question.options.map((option, optIndex) => (
                              <ListItem 
                                key={optIndex}
                                sx={{ 
                                  bgcolor: option.isCorrect ? 'success.50' : 
                                    (question.userSelection.includes(option.id) && !option.isCorrect) ? 'error.50' : 'inherit',
                                  borderRadius: 1,
                                  mb: 0.5
                                }}
                              >
                                <ListItemText 
                                  primary={option.text} 
                                  primaryTypographyProps={{
                                    sx: { fontWeight: option.isCorrect ? 'bold' : 'normal' }
                                  }}
                                />
                                {option.isCorrect && (
                                  <Chip label="Correct" size="small" color="success" />
                                )}
                                {question.userSelection.includes(option.id) && !option.isCorrect && (
                                  <Chip label="Your Answer" size="small" color="error" />
                                )}
                              </ListItem>
                            ))}
                          </List>
                        </CardContent>
                      </Card>
                    ))}
                  </>
                )}
              </TabPanel>
            )}
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Test Details
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary">
                  Created By
                </Typography>
                <Typography variant="body1">
                  {currentTest.teacherName || 'Unknown'}
                </Typography>
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary">
                  Status
                </Typography>
                <Box sx={{ mt: 0.5 }}>
                  {getStatusChip(currentTest.status)}
                </Box>
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary">
                  Questions
                </Typography>
                <Typography variant="body1">
                  {currentTest.questionCount || 0} questions
                </Typography>
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary">
                  Time Limit
                </Typography>
                <Typography variant="body1">
                  {currentTest.timeLimit ? `${currentTest.timeLimit} minutes` : 'No time limit'}
                </Typography>
              </Grid>
              
              {currentTest.scheduledFor && (
                <>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Start Date
                    </Typography>
                    <Typography variant="body1">
                      {new Date(currentTest.scheduledFor).toLocaleString()}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">
                      End Date
                    </Typography>
                    <Typography variant="body1">
                      {new Date(currentTest.scheduledEnd).toLocaleString()}
                    </Typography>
                  </Grid>
                </>
              )}
            </Grid>
          </Paper>
          
          {user?.role === 'teacher' && (
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Test Settings
              </Typography>
              
              <List dense>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar>
                      <Shuffle />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText 
                    primary="Randomize Questions" 
                    secondary={currentTest.randomizeQuestions ? 'Enabled' : 'Disabled'} 
                  />
                </ListItem>
              </List>
            </Paper>
          )}
        </Grid>
      </Grid>
    </Container>
  );
};

export default TakeTest; 