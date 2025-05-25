import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Avatar,
  Box,
  Button,
  Container,
  Divider,
  Grid,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Paper,
  Typography
} from '@mui/material';
import {
  BarChart,
  PictureAsPdf,
  PlayArrow,
  Shuffle
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const TestDetail = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [currentTest, setCurrentTest] = useState(null);
  const [classResults, setClassResults] = useState(null);

  useEffect(() => {
    // Fetch test details and class results
    // This would typically be done with an API call
    setCurrentTest({
      status: 'published',
      randomizeOptions: true,
      showResults: true,
    });
    setClassResults({
      highestScore: 95,
      lowestScore: 70,
      averageScore: 82.5,
      passRate: 85,
      passCount: 15,
      totalStudents: 20,
      averageTime: 1200,
    });
  }, []);

  return (
    <Container maxWidth="lg">
      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          {/* Test details content */}
        </Grid>
        <Grid item xs={12} md={4}>
          {/* Test actions content */}
          {user?.role === 'teacher' && currentTest.status === 'completed' && classResults && (
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Test Statistics
              </Typography>
              
              <List dense>
                <ListItem>
                  <ListItemText 
                    primary="Highest Score" 
                    secondary={`${classResults.highestScore}%`} 
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemText 
                    primary="Lowest Score" 
                    secondary={`${classResults.lowestScore}%`} 
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemText 
                    primary="Average Score" 
                    secondary={`${classResults.averageScore?.toFixed(1)}%`} 
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemText 
                    primary="Pass Rate" 
                    secondary={`${classResults.passRate}% (${classResults.passCount}/${classResults.totalStudents})`} 
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemText 
                    primary="Average Completion Time" 
                    secondary={classResults.averageTime ? `${Math.floor(classResults.averageTime / 60)}m ${classResults.averageTime % 60}s` : 'N/A'} 
                  />
                </ListItem>
              </List>
              
              <Button
                variant="outlined"
                fullWidth
                startIcon={<PictureAsPdf />}
                sx={{ mt: 2 }}
                onClick={() => {/* Export detailed results logic */}}
              >
                Export Detailed Results
              </Button>
            </Paper>
          )}
          
          {user?.role === 'student' && (
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Actions
              </Typography>
              
              {currentTest.status === 'published' && !currentTest.userResult && (
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  startIcon={<PlayArrow />}
                  onClick={() => navigate(`/tests/${id}/take`)}
                >
                  Take Test
                </Button>
              )}
              
              {currentTest.userResult && (
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<PictureAsPdf />}
                  onClick={() => {/* Export results logic */}}
                >
                  Export My Results
                </Button>
              )}
            </Paper>
          )}
        </Grid>
      </Grid>
    </Container>
  );
};

export default TestDetail; 