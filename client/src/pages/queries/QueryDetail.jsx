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
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Paper,
  TextField,
  Tooltip,
  Typography,
  Avatar,
  Rating,
  Tab,
  Tabs,
  Stack
} from '@mui/material';
import {
  ArrowBack,
  PictureAsPdf,
  QuestionAnswer,
  Edit,
  Send,
  Download,
  Person
} from '@mui/icons-material';
import { getQueryById, respondToQuery, evaluateResponse } from '../../features/queries/queriesSlice';

// TabPanel component
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`query-tabpanel-${index}`}
      aria-labelledby={`query-tab-${index}`}
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

const QueryDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentQuery, isLoading } = useSelector((state) => state.queries);
  const { user } = useSelector((state) => state.auth);
  
  const [tabValue, setTabValue] = useState(0);
  const [response, setResponse] = useState('');
  const [evaluation, setEvaluation] = useState({
    score: 0,
    feedback: ''
  });
  
  useEffect(() => {
    dispatch(getQueryById(id));
  }, [id, dispatch]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleSubmitResponse = () => {
    if (response.trim()) {
      dispatch(respondToQuery({ id, response: { text: response } }));
      setResponse('');
    }
  };

  const handleSubmitEvaluation = () => {
    if (evaluation.feedback.trim()) {
      dispatch(evaluateResponse({ id, evaluation }));
    }
  };

  const getStatusChip = (status) => {
    switch (status) {
      case 'draft':
        return <Chip label="Draft" color="default" size="small" />;
      case 'assigned':
        return <Chip label="Assigned" color="primary" size="small" />;
      case 'responded':
        return <Chip label="Responded" color="info" size="small" />;
      case 'evaluated':
        return <Chip label="Evaluated" color="success" size="small" />;
      default:
        return <Chip label={status} size="small" />;
    }
  };

  if (isLoading || !currentQuery) {
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
          onClick={() => navigate('/queries')}
          sx={{ mb: 2 }}
        >
          Back to Queries
        </Button>
        
        <Grid container justifyContent="space-between" alignItems="center">
          <Grid item>
            <Typography variant="h4" component="h1" gutterBottom>
              {currentQuery.title}
            </Typography>
            <Stack direction="row" spacing={2} alignItems="center">
              {getStatusChip(currentQuery.status)}
              <Typography variant="body2" color="text.secondary">
                Created: {new Date(currentQuery.createdAt).toLocaleString()}
              </Typography>
              {currentQuery.deadline && (
                <Typography variant="body2" color="text.secondary">
                  Due: {new Date(currentQuery.deadline).toLocaleString()}
                </Typography>
              )}
            </Stack>
          </Grid>
          
          <Grid item>
            <Button
              variant="outlined"
              startIcon={<PictureAsPdf />}
              onClick={() => {/* Generate PDF logic */}}
            >
              Export PDF
            </Button>
          </Grid>
        </Grid>
      </Box>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ mb: 3 }}>
            {user?.role === 'teacher' ? (
              <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs 
                  value={tabValue} 
                  onChange={handleTabChange}
                  variant="scrollable"
                  scrollButtons="auto"
                >
                  <Tab label="Query Details" />
                  <Tab label="Student Responses" />
                </Tabs>
              </Box>
            ) : null}
            
            <TabPanel value={tabValue} index={0}>
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" gutterBottom>
                  Question
                </Typography>
                <Typography variant="body1" paragraph sx={{ whiteSpace: 'pre-line' }}>
                  {currentQuery.question || 'No question provided'}
                </Typography>
              </Box>
              
              {currentQuery.background && (
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h6" gutterBottom>
                    Background Information
                  </Typography>
                  <Typography variant="body1" paragraph sx={{ whiteSpace: 'pre-line' }}>
                    {currentQuery.background}
                  </Typography>
                </Box>
              )}
              
              {currentQuery.attachments && currentQuery.attachments.length > 0 && (
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h6" gutterBottom>
                    Query Attachments
                  </Typography>
                  
                  <List>
                    {currentQuery.attachments.map((attachment, index) => (
                      <ListItem
                        key={index}
                        secondaryAction={
                          <IconButton edge="end" aria-label="download">
                            <Download />
                          </IconButton>
                        }
                      >
                        <ListItemAvatar>
                          <Avatar>
                            <QuestionAnswer />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={attachment.filename}
                          secondary={`Uploaded: ${new Date(attachment.uploadDate).toLocaleDateString()}`}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}
              
              {user?.role === 'student' && currentQuery.status === 'assigned' && (
                <Box sx={{ mt: 4 }}>
                  <Divider sx={{ mb: 3 }} />
                  <Typography variant="h6" gutterBottom>
                    Your Response
                  </Typography>
                  
                  <TextField
                    fullWidth
                    multiline
                    rows={8}
                    placeholder="Write your response to this query..."
                    value={response}
                    onChange={(e) => setResponse(e.target.value)}
                    variant="outlined"
                    sx={{ mb: 2 }}
                  />
                  
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                      variant="contained"
                      onClick={handleSubmitResponse}
                      disabled={!response.trim()}
                      endIcon={<Send />}
                    >
                      Submit Response
                    </Button>
                  </Box>
                </Box>
              )}
              
              {user?.role === 'student' && currentQuery.status === 'responded' && (
                <Box sx={{ mt: 4 }}>
                  <Divider sx={{ mb: 3 }} />
                  <Typography variant="h6" gutterBottom>
                    Your Response
                  </Typography>
                  
                  <Paper elevation={0} sx={{ p: 2, bgcolor: 'background.default' }}>
                    <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                      {currentQuery.response?.text || 'No response submitted'}
                    </Typography>
                    <Typography variant="caption" display="block" sx={{ mt: 1, color: 'text.secondary' }}>
                      Submitted on: {new Date(currentQuery.response?.createdAt).toLocaleString()}
                    </Typography>
                  </Paper>
                </Box>
              )}
              
              {user?.role === 'student' && currentQuery.status === 'evaluated' && (
                <Box sx={{ mt: 4 }}>
                  <Divider sx={{ mb: 3 }} />
                  <Typography variant="h6" gutterBottom>
                    Your Response
                  </Typography>
                  
                  <Paper elevation={0} sx={{ p: 2, bgcolor: 'background.default', mb: 3 }}>
                    <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                      {currentQuery.response?.text || 'No response submitted'}
                    </Typography>
                    <Typography variant="caption" display="block" sx={{ mt: 1, color: 'text.secondary' }}>
                      Submitted on: {new Date(currentQuery.response?.createdAt).toLocaleString()}
                    </Typography>
                  </Paper>
                  
                  <Typography variant="h6" gutterBottom>
                    Teacher Evaluation
                  </Typography>
                  
                  <Paper sx={{ p: 2, bgcolor: '#f9f9f9', border: '1px solid #e0e0e0' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Typography variant="subtitle1" sx={{ mr: 1 }}>
                        Score:
                      </Typography>
                      <Rating 
                        value={currentQuery.evaluation?.score || 0} 
                        readOnly 
                        precision={0.5}
                        max={10} 
                      />
                      <Typography variant="body1" sx={{ ml: 1 }}>
                        {currentQuery.evaluation?.score || 0}/10
                      </Typography>
                    </Box>
                    
                    <Typography variant="subtitle1" gutterBottom>
                      Feedback:
                    </Typography>
                    <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                      {currentQuery.evaluation?.feedback || 'No feedback provided'}
                    </Typography>
                  </Paper>
                </Box>
              )}
            </TabPanel>
            
            <TabPanel value={tabValue} index={1}>
              {user?.role === 'teacher' && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Student Responses
                  </Typography>
                  
                  {currentQuery.responses && currentQuery.responses.length > 0 ? (
                    currentQuery.responses.map((response, index) => (
                      <Card key={index} sx={{ mb: 3 }}>
                        <CardContent>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Avatar sx={{ mr: 1 }}>
                              <Person />
                            </Avatar>
                            <Typography variant="subtitle1">
                              {response.studentName || 'Student'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ ml: 'auto' }}>
                              Submitted: {new Date(response.createdAt).toLocaleString()}
                            </Typography>
                          </Box>
                          
                          <Typography variant="body1" paragraph sx={{ whiteSpace: 'pre-line' }}>
                            {response.text}
                          </Typography>
                          
                          {response.status !== 'evaluated' ? (
                            <>
                              <Divider sx={{ my: 2 }} />
                              
                              <Typography variant="h6" gutterBottom>
                                Evaluate Response
                              </Typography>
                              
                              <Box sx={{ mb: 2 }}>
                                <Typography variant="subtitle1" gutterBottom>
                                  Score (0-10):
                                </Typography>
                                <Rating 
                                  value={evaluation.score} 
                                  onChange={(event, newValue) => {
                                    setEvaluation({ ...evaluation, score: newValue });
                                  }}
                                  precision={0.5}
                                  max={10} 
                                />
                              </Box>
                              
                              <TextField
                                fullWidth
                                multiline
                                rows={4}
                                label="Feedback"
                                placeholder="Provide constructive feedback..."
                                value={evaluation.feedback}
                                onChange={(e) => setEvaluation({ ...evaluation, feedback: e.target.value })}
                                variant="outlined"
                                sx={{ mb: 2 }}
                              />
                              
                              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                                <Button
                                  variant="contained"
                                  onClick={handleSubmitEvaluation}
                                  disabled={!evaluation.feedback.trim() || evaluation.score === 0}
                                >
                                  Submit Evaluation
                                </Button>
                              </Box>
                            </>
                          ) : (
                            <>
                              <Divider sx={{ my: 2 }} />
                              
                              <Typography variant="h6" gutterBottom>
                                Your Evaluation
                              </Typography>
                              
                              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <Typography variant="subtitle1" sx={{ mr: 1 }}>
                                  Score:
                                </Typography>
                                <Rating 
                                  value={response.evaluation.score || 0} 
                                  readOnly 
                                  precision={0.5}
                                  max={10} 
                                />
                                <Typography variant="body1" sx={{ ml: 1 }}>
                                  {response.evaluation.score || 0}/10
                                </Typography>
                              </Box>
                              
                              <Typography variant="subtitle1" gutterBottom>
                                Feedback:
                              </Typography>
                              <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                                {response.evaluation.feedback || 'No feedback provided'}
                              </Typography>
                            </>
                          )}
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <Typography variant="body1" color="text.secondary">
                      No student responses yet.
                    </Typography>
                  )}
                </Box>
              )}
            </TabPanel>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Query Details
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary">
                  Created By
                </Typography>
                <Typography variant="body1">
                  {currentQuery.teacherName || 'Unknown'}
                </Typography>
              </Grid>
              
              {currentQuery.deadline && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Deadline
                  </Typography>
                  <Typography variant="body1">
                    {new Date(currentQuery.deadline).toLocaleDateString()}
                  </Typography>
                </Grid>
              )}
              
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary">
                  Status
                </Typography>
                <Box sx={{ mt: 0.5 }}>
                  {getStatusChip(currentQuery.status)}
                </Box>
              </Grid>
            </Grid>
          </Paper>
          
          {currentQuery.assignedStudents && currentQuery.assignedStudents.length > 0 && (
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Assigned Students
              </Typography>
              
              <List dense>
                {currentQuery.assignedStudents.map((student, index) => (
                  <ListItem key={index}>
                    <ListItemAvatar>
                      <Avatar>
                        <Person />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={student.name || `Student ${index + 1}`}
                      secondary={student.email || ''}
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>
          )}
          
          {user?.role === 'teacher' && currentQuery.status === 'draft' && (
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Actions
              </Typography>
              
              <Button
                variant="contained"
                fullWidth
                sx={{ mb: 2 }}
                onClick={() => navigate(`/queries/${id}/edit`)}
                startIcon={<Edit />}
              >
                Edit Query
              </Button>
              
              <Button
                variant="outlined"
                fullWidth
                onClick={() => navigate(`/queries/${id}/assign`)}
                startIcon={<Person />}
              >
                Assign to Students
              </Button>
            </Paper>
          )}
        </Grid>
      </Grid>
    </Container>
  );
};

export default QueryDetail; 