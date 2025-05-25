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
  Stack,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
  Avatar
} from '@mui/material';
import {
  ArrowBack,
  Edit,
  PictureAsPdf,
  Assignment,
  MedicalInformation,
  Science,
  Assessment as AssessmentIcon,
  MenuBook,
  Comment,
  Send,
  Download
} from '@mui/icons-material';
import { getCaseById, addComment, resetCaseState } from '../../features/cases/casesSlice';

// TabPanel component
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`case-tabpanel-${index}`}
      aria-labelledby={`case-tab-${index}`}
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

const CaseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentCase, isLoading } = useSelector((state) => state.cases);
  const { user } = useSelector((state) => state.auth);
  
  const [tabValue, setTabValue] = useState(0);
  const [comment, setComment] = useState('');
  
  useEffect(() => {
    dispatch(getCaseById(id));
    
    return () => {
      dispatch(resetCaseState());
    };
  }, [id, dispatch]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleAddComment = () => {
    if (comment.trim()) {
      dispatch(addComment({ id, comment: { text: comment } }));
      setComment('');
    }
  };

  const getStatusChip = (status) => {
    switch (status) {
      case 'draft':
        return <Chip label="Draft" color="default" size="small" />;
      case 'submitted':
        return <Chip label="Submitted" color="primary" size="small" />;
      case 'in review':
        return <Chip label="In Review" color="info" size="small" />;
      case 'revisions needed':
        return <Chip label="Revisions Needed" color="warning" size="small" />;
      case 'completed':
        return <Chip label="Completed" color="success" size="small" />;
      default:
        return <Chip label={status} size="small" />;
    }
  };

  if (isLoading || !currentCase) {
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
          onClick={() => navigate('/cases')}
          sx={{ mb: 2 }}
        >
          Back to Cases
        </Button>
        
        <Grid container justifyContent="space-between" alignItems="center">
          <Grid item>
            <Typography variant="h4" component="h1" gutterBottom>
              {currentCase.title}
            </Typography>
            <Stack direction="row" spacing={2} alignItems="center">
              {getStatusChip(currentCase.status)}
              <Typography variant="body2" color="text.secondary">
                Last updated: {new Date(currentCase.updatedAt).toLocaleString()}
              </Typography>
            </Stack>
          </Grid>
          
          <Grid item>
            <Stack direction="row" spacing={1}>
              {user?.role === 'student' && currentCase.status === 'draft' && (
                <Button
                  variant="outlined"
                  startIcon={<Edit />}
                  onClick={() => navigate(`/cases/${id}/edit`)}
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
                <Tab icon={<Assignment />} label="Patient Info" />
                <Tab icon={<MedicalInformation />} label="Medications" />
                <Tab icon={<Science />} label="Lab Values" />
                <Tab icon={<AssessmentIcon />} label="Assessment & Plan" />
                <Tab icon={<MenuBook />} label="References" />
                <Tab icon={<Comment />} label="Discussion" />
              </Tabs>
            </Box>
            
            {/* Patient Info Tab */}
            <TabPanel value={tabValue} index={0}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1" gutterBottom>
                    Age
                  </Typography>
                  <Typography variant="body1">
                    {currentCase.patientInfo?.age || 'N/A'}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1" gutterBottom>
                    Gender
                  </Typography>
                  <Typography variant="body1" sx={{ textTransform: 'capitalize' }}>
                    {currentCase.patientInfo?.gender || 'N/A'}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={4}>
                  <Typography variant="subtitle1" gutterBottom>
                    Weight
                  </Typography>
                  <Typography variant="body1">
                    {currentCase.patientInfo?.weight ? `${currentCase.patientInfo.weight} kg` : 'N/A'}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={4}>
                  <Typography variant="subtitle1" gutterBottom>
                    Height
                  </Typography>
                  <Typography variant="body1">
                    {currentCase.patientInfo?.height ? `${currentCase.patientInfo.height} cm` : 'N/A'}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={4}>
                  <Typography variant="subtitle1" gutterBottom>
                    BMI
                  </Typography>
                  <Typography variant="body1">
                    {currentCase.patientInfo?.weight && currentCase.patientInfo?.height
                      ? (currentCase.patientInfo.weight / Math.pow(currentCase.patientInfo.height / 100, 2)).toFixed(1)
                      : 'N/A'}
                  </Typography>
                </Grid>
                
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom>
                    Chief Complaint
                  </Typography>
                  <Typography variant="body1" paragraph>
                    {currentCase.patientInfo?.chiefComplaint || 'No chief complaint provided'}
                  </Typography>
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom>
                    History of Present Illness
                  </Typography>
                  <Typography variant="body1" paragraph sx={{ whiteSpace: 'pre-line' }}>
                    {currentCase.patientInfo?.historyOfPresentIllness || 'No history provided'}
                  </Typography>
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom>
                    Past Medical History
                  </Typography>
                  <Typography variant="body1" paragraph sx={{ whiteSpace: 'pre-line' }}>
                    {currentCase.patientInfo?.pastMedicalHistory || 'No past medical history provided'}
                  </Typography>
                </Grid>
              </Grid>
            </TabPanel>
            
            {/* Medications Tab */}
            <TabPanel value={tabValue} index={1}>
              <Typography variant="h6" gutterBottom>
                Current Medications
              </Typography>
              
              {currentCase.medicationHistory?.currentMedications &&
               currentCase.medicationHistory.currentMedications.length > 0 ? (
                <Box sx={{ mb: 4 }}>
                  <Grid container sx={{ p: 2, bgcolor: 'background.default', fontWeight: 'bold' }}>
                    <Grid item xs={12} sm={4}>
                      <Typography variant="subtitle2">Medication</Typography>
                    </Grid>
                    <Grid item xs={12} sm={2}>
                      <Typography variant="subtitle2">Dose</Typography>
                    </Grid>
                    <Grid item xs={12} sm={2}>
                      <Typography variant="subtitle2">Frequency</Typography>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Typography variant="subtitle2">Indication</Typography>
                    </Grid>
                  </Grid>
                  
                  {currentCase.medicationHistory.currentMedications.map((med, index) => (
                    <Grid container key={index} sx={{ p: 2, borderBottom: '1px solid #eee' }}>
                      <Grid item xs={12} sm={4}>
                        <Typography variant="body2">{med.name || 'N/A'}</Typography>
                      </Grid>
                      <Grid item xs={12} sm={2}>
                        <Typography variant="body2">{med.dose || 'N/A'}</Typography>
                      </Grid>
                      <Grid item xs={12} sm={2}>
                        <Typography variant="body2">{med.frequency || 'N/A'}</Typography>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <Typography variant="body2">{med.indication || 'N/A'}</Typography>
                      </Grid>
                    </Grid>
                  ))}
                </Box>
              ) : (
                <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                  No current medications recorded
                </Typography>
              )}
              
              <Typography variant="h6" gutterBottom>
                Medication Allergies
              </Typography>
              
              {currentCase.medicationHistory?.allergies &&
               currentCase.medicationHistory.allergies.length > 0 ? (
                <Box>
                  <Grid container sx={{ p: 2, bgcolor: 'background.default', fontWeight: 'bold' }}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2">Medication</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2">Reaction</Typography>
                    </Grid>
                  </Grid>
                  
                  {currentCase.medicationHistory.allergies.map((allergy, index) => (
                    <Grid container key={index} sx={{ p: 2, borderBottom: '1px solid #eee' }}>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2">{allergy.medication || 'N/A'}</Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2">{allergy.reaction || 'N/A'}</Typography>
                      </Grid>
                    </Grid>
                  ))}
                </Box>
              ) : (
                <Typography variant="body1" color="text.secondary">
                  No allergies recorded
                </Typography>
              )}
            </TabPanel>
            
            {/* Lab Values Tab */}
            <TabPanel value={tabValue} index={2}>
              <Typography variant="h6" gutterBottom>
                Laboratory Values
              </Typography>
              
              {currentCase.labValues && currentCase.labValues.length > 0 ? (
                <Box>
                  <Grid container sx={{ p: 2, bgcolor: 'background.default', fontWeight: 'bold' }}>
                    <Grid item xs={12} sm={3}>
                      <Typography variant="subtitle2">Test</Typography>
                    </Grid>
                    <Grid item xs={12} sm={3}>
                      <Typography variant="subtitle2">Value</Typography>
                    </Grid>
                    <Grid item xs={12} sm={3}>
                      <Typography variant="subtitle2">Reference Range</Typography>
                    </Grid>
                    <Grid item xs={12} sm={3}>
                      <Typography variant="subtitle2">Date</Typography>
                    </Grid>
                  </Grid>
                  
                  {currentCase.labValues.map((lab, index) => (
                    <Grid container key={index} sx={{ p: 2, borderBottom: '1px solid #eee' }}>
                      <Grid item xs={12} sm={3}>
                        <Typography variant="body2">{lab.testName || 'N/A'}</Typography>
                      </Grid>
                      <Grid item xs={12} sm={3}>
                        <Typography variant="body2">{lab.value || 'N/A'}</Typography>
                      </Grid>
                      <Grid item xs={12} sm={3}>
                        <Typography variant="body2">{lab.referenceRange || 'N/A'}</Typography>
                      </Grid>
                      <Grid item xs={12} sm={3}>
                        <Typography variant="body2">
                          {lab.date ? new Date(lab.date).toLocaleDateString() : 'N/A'}
                        </Typography>
                      </Grid>
                    </Grid>
                  ))}
                </Box>
              ) : (
                <Typography variant="body1" color="text.secondary">
                  No laboratory values recorded
                </Typography>
              )}
            </TabPanel>
            
            {/* Assessment & Plan Tab */}
            <TabPanel value={tabValue} index={3}>
              <Typography variant="h6" gutterBottom>
                Assessment
              </Typography>
              
              <Typography variant="subtitle1" gutterBottom>
                Diagnosis/Problem List
              </Typography>
              <Typography variant="body1" paragraph sx={{ whiteSpace: 'pre-line' }}>
                {currentCase.assessment?.diagnosis || 'No diagnosis provided'}
              </Typography>
              
              <Typography variant="subtitle1" gutterBottom>
                Differential Diagnoses
              </Typography>
              <Typography variant="body1" paragraph sx={{ whiteSpace: 'pre-line' }}>
                {currentCase.assessment?.differentialDiagnoses || 'No differential diagnoses provided'}
              </Typography>
              
              <Divider sx={{ my: 3 }} />
              
              <Typography variant="h6" gutterBottom>
                Plan
              </Typography>
              
              <Typography variant="subtitle1" gutterBottom>
                Medication Plan
              </Typography>
              <Typography variant="body1" paragraph sx={{ whiteSpace: 'pre-line' }}>
                {currentCase.plan?.medications || 'No medication plan provided'}
              </Typography>
              
              <Typography variant="subtitle1" gutterBottom>
                Non-Pharmacological Interventions
              </Typography>
              <Typography variant="body1" paragraph sx={{ whiteSpace: 'pre-line' }}>
                {currentCase.plan?.nonPharmacological || 'No non-pharmacological interventions provided'}
              </Typography>
              
              <Typography variant="subtitle1" gutterBottom>
                Monitoring and Follow-up
              </Typography>
              <Typography variant="body1" paragraph sx={{ whiteSpace: 'pre-line' }}>
                {currentCase.plan?.followUp || 'No follow-up plan provided'}
              </Typography>
            </TabPanel>
            
            {/* References Tab */}
            <TabPanel value={tabValue} index={4}>
              <Typography variant="h6" gutterBottom>
                References and Evidence Sources
              </Typography>
              
              <Typography variant="body1" paragraph sx={{ whiteSpace: 'pre-line' }}>
                {currentCase.references || 'No references provided'}
              </Typography>
              
              {currentCase.attachments && currentCase.attachments.length > 0 && (
                <>
                  <Divider sx={{ my: 3 }} />
                  
                  <Typography variant="h6" gutterBottom>
                    Attachments
                  </Typography>
                  
                  <List>
                    {currentCase.attachments.map((attachment, index) => (
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
                            <MenuBook />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={attachment.filename}
                          secondary={`Uploaded: ${new Date(attachment.uploadDate).toLocaleDateString()}`}
                        />
                      </ListItem>
                    ))}
                  </List>
                </>
              )}
            </TabPanel>
            
            {/* Discussion Tab */}
            <TabPanel value={tabValue} index={5}>
              <Typography variant="h6" gutterBottom>
                Discussion Thread
              </Typography>
              
              {currentCase.comments && currentCase.comments.length > 0 ? (
                <List sx={{ width: '100%' }}>
                  {currentCase.comments.map((comment, index) => (
                    <ListItem
                      key={index}
                      alignItems="flex-start"
                      sx={{ 
                        bgcolor: comment.user === user?.id ? 'rgba(0, 0, 0, 0.03)' : 'inherit',
                        borderRadius: 1,
                        mb: 2 
                      }}
                    >
                      <ListItemAvatar>
                        <Avatar alt={comment.userName || 'User'}>
                          {(comment.userName || 'U').charAt(0)}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box display="flex" justifyContent="space-between">
                            <Typography variant="subtitle2">
                              {comment.userName || 'Unknown User'}
                              {comment.userRole && (
                                <Chip 
                                  label={comment.userRole} 
                                  size="small" 
                                  sx={{ ml: 1, fontSize: '0.7rem' }}
                                />
                              )}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {new Date(comment.createdAt).toLocaleString()}
                            </Typography>
                          </Box>
                        }
                        secondary={
                          <Typography
                            variant="body2"
                            color="text.primary"
                            sx={{ mt: 1, whiteSpace: 'pre-line' }}
                          >
                            {comment.text}
                          </Typography>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                  No comments yet. Start the discussion!
                </Typography>
              )}
              
              <Divider sx={{ my: 3 }} />
              
              <Typography variant="subtitle1" gutterBottom>
                Add a Comment
              </Typography>
              
              <Box sx={{ display: 'flex' }}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  placeholder="Write your comment..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  variant="outlined"
                  sx={{ mr: 1 }}
                />
                <Button
                  variant="contained"
                  onClick={handleAddComment}
                  disabled={!comment.trim()}
                  sx={{ alignSelf: 'flex-end' }}
                  endIcon={<Send />}
                >
                  Post
                </Button>
              </Box>
            </TabPanel>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Case Details
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary">
                  Student
                </Typography>
                <Typography variant="body1">
                  {currentCase.studentName || 'Unknown'}
                </Typography>
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary">
                  Teacher
                </Typography>
                <Typography variant="body1">
                  {currentCase.teacherName || 'Not assigned'}
                </Typography>
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary">
                  Created
                </Typography>
                <Typography variant="body1">
                  {new Date(currentCase.createdAt).toLocaleDateString()}
                </Typography>
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary">
                  Last Updated
                </Typography>
                <Typography variant="body1">
                  {new Date(currentCase.updatedAt).toLocaleDateString()}
                </Typography>
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary">
                  Status
                </Typography>
                <Box sx={{ mt: 0.5 }}>
                  {getStatusChip(currentCase.status)}
                </Box>
              </Grid>
            </Grid>
          </Paper>
          
          {currentCase.evaluation && (
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Teacher Evaluation
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Overall Score
                  </Typography>
                  <Typography variant="h4" color="primary">
                    {currentCase.evaluation.score}/10
                  </Typography>
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Feedback
                  </Typography>
                  <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                    {currentCase.evaluation.feedback || 'No feedback provided'}
                  </Typography>
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Evaluated by
                  </Typography>
                  <Typography variant="body1">
                    {currentCase.evaluation.evaluatorName || 'Unknown'}
                  </Typography>
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Evaluation Date
                  </Typography>
                  <Typography variant="body1">
                    {new Date(currentCase.evaluation.date).toLocaleDateString()}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          )}
          
          {user?.role === 'teacher' && currentCase.status === 'submitted' && (
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Teacher Actions
              </Typography>
              
              <Button
                variant="contained"
                fullWidth
                sx={{ mb: 2 }}
                onClick={() => navigate(`/cases/${id}/evaluate`)}
              >
                Evaluate Case
              </Button>
              
              <Button
                variant="outlined"
                fullWidth
                onClick={() => {/* Request revisions logic */}}
              >
                Request Revisions
              </Button>
            </Paper>
          )}
        </Grid>
      </Grid>
    </Container>
  );
};

export default CaseDetail; 