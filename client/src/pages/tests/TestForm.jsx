import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Button,
  CircularProgress,
  Container,
  Divider,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Radio,
  RadioGroup,
  Select,
  Switch,
  Tab,
  Tabs,
  TextField,
  Typography,
  Alert,
  Stack,
  Checkbox,
  Card,
  CardContent,
  CardHeader,
  FormGroup
} from '@mui/material';
import {
  Save,
  ArrowBack,
  Add,
  Delete,
  DragIndicator,
  CheckCircle,
  Shuffle
} from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { getTestById, createTest, updateTest, resetTestState, clearCurrentTest } from '../../features/tests/testsSlice';

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

const TestForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentTest, isLoading, isSuccess, isError, message } = useSelector((state) => state.tests);
  
  const [tabValue, setTabValue] = useState(0);
  const [saveStatus, setSaveStatus] = useState('');
  const [questions, setQuestions] = useState([]);
  
  useEffect(() => {
    if (id) {
      dispatch(getTestById(id));
    } else {
      dispatch(clearCurrentTest());
    }
    
    return () => {
      dispatch(resetTestState());
    };
  }, [id, dispatch]);

  // Update questions when test data loads
  useEffect(() => {
    if (currentTest?.questions) {
      setQuestions(currentTest.questions);
    } else {
      setQuestions([]);
    }
  }, [currentTest]);

  // Initialize form with default values or current test data
  const formik = useFormik({
    initialValues: {
      title: currentTest?.title || '',
      description: currentTest?.description || '',
      timeLimit: currentTest?.timeLimit || '',
      passingCriteria: currentTest?.passingCriteria || 'fixed',
      passingScore: currentTest?.passingScore || 50,
      scheduledFor: currentTest?.scheduledFor ? new Date(currentTest.scheduledFor).toISOString().split('T')[0] : '',
      scheduledEnd: currentTest?.scheduledEnd ? new Date(currentTest.scheduledEnd).toISOString().split('T')[0] : '',
      randomizeQuestions: currentTest?.randomizeQuestions || false,
      randomizeOptions: currentTest?.randomizeOptions || false,
      showResults: currentTest?.showResults || true,
    },
    validationSchema: Yup.object({
      title: Yup.string().required('Title is required'),
      timeLimit: Yup.number().positive('Time limit must be positive').nullable(),
      passingScore: Yup.number().min(0, 'Must be at least 0').max(100, 'Cannot exceed 100').required('Required when using fixed passing criteria'),
    }),
    onSubmit: (values) => {
      // Add questions to the form data
      const testData = { ...values, questions };
      
      if (id) {
        dispatch(updateTest({ id, testData }));
      } else {
        dispatch(createTest(testData));
      }
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus(''), 3000);
    },
    enableReinitialize: true,
  });

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Add new question
  const addQuestion = () => {
    const newQuestion = {
      id: Date.now().toString(),
      text: '',
      type: 'single',
      options: [
        { id: `opt-${Date.now()}-1`, text: '', isCorrect: false },
        { id: `opt-${Date.now()}-2`, text: '', isCorrect: false }
      ],
      points: 1
    };
    setQuestions([...questions, newQuestion]);
  };

  // Update question
  const updateQuestion = (index, field, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index] = { ...updatedQuestions[index], [field]: value };
    setQuestions(updatedQuestions);
  };

  // Delete question
  const deleteQuestion = (index) => {
    const updatedQuestions = [...questions];
    updatedQuestions.splice(index, 1);
    setQuestions(updatedQuestions);
  };

  // Add option to a question
  const addOption = (questionIndex) => {
    const updatedQuestions = [...questions];
    const question = updatedQuestions[questionIndex];
    question.options.push({
      id: `opt-${Date.now()}-${question.options.length + 1}`,
      text: '',
      isCorrect: false
    });
    setQuestions(updatedQuestions);
  };

  // Update option
  const updateOption = (questionIndex, optionIndex, field, value) => {
    const updatedQuestions = [...questions];
    const question = updatedQuestions[questionIndex];
    
    // If updating the isCorrect field in a single-answer question,
    // we need to ensure only one option is marked as correct
    if (field === 'isCorrect' && value === true && question.type === 'single') {
      question.options.forEach((opt, idx) => {
        opt.isCorrect = idx === optionIndex;
      });
    } else {
      question.options[optionIndex] = { 
        ...question.options[optionIndex], 
        [field]: value 
      };
    }
    
    setQuestions(updatedQuestions);
  };

  // Delete option
  const deleteOption = (questionIndex, optionIndex) => {
    const updatedQuestions = [...questions];
    const question = updatedQuestions[questionIndex];
    question.options.splice(optionIndex, 1);
    setQuestions(updatedQuestions);
  };

  // Handle drag and drop for questions
  const onDragEnd = (result) => {
    if (!result.destination) return;
    
    const items = Array.from(questions);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    setQuestions(items);
  };

  // Basic validation for questions
  const validateQuestions = () => {
    if (questions.length === 0) {
      return 'Add at least one question to your test';
    }
    
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.text) {
        return `Question ${i + 1} is missing text`;
      }
      
      if (q.options.length < 2) {
        return `Question ${i + 1} needs at least 2 options`;
      }
      
      const hasCorrectAnswer = q.options.some(opt => opt.isCorrect);
      if (!hasCorrectAnswer) {
        return `Question ${i + 1} doesn't have a correct answer marked`;
      }
      
      for (let j = 0; j < q.options.length; j++) {
        if (!q.options[j].text) {
          return `Question ${i + 1}, Option ${j + 1} is missing text`;
        }
      }
    }
    
    return null;
  };

  const questionsError = validateQuestions();

  if (isLoading && id) {
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
        
        <Typography variant="h4" component="h1" gutterBottom>
          {id ? 'Edit Test' : 'Create New Test'}
        </Typography>
      </Box>
      
      {isError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {message}
        </Alert>
      )}
      
      {isSuccess && saveStatus === 'saved' && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Test saved successfully!
        </Alert>
      )}
      
      <Paper sx={{ mb: 4 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab label="Basic Information" />
            <Tab label="Questions" />
            <Tab label="Settings" />
          </Tabs>
        </Box>
        
        <form onSubmit={formik.handleSubmit}>
          <TabPanel value={tabValue} index={0}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Test Title"
                  name="title"
                  value={formik.values.title}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.title && Boolean(formik.errors.title)}
                  helperText={formik.touched.title && formik.errors.title}
                  placeholder="E.g., Pharmacology Midterm Exam"
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Description"
                  name="description"
                  value={formik.values.description}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.description && Boolean(formik.errors.description)}
                  helperText={formik.touched.description && formik.errors.description}
                  placeholder="Provide instructions and information about the test"
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Time Limit (minutes)"
                  name="timeLimit"
                  type="number"
                  value={formik.values.timeLimit}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.timeLimit && Boolean(formik.errors.timeLimit)}
                  helperText={
                    (formik.touched.timeLimit && formik.errors.timeLimit) || 
                    "Leave empty for no time limit"
                  }
                  InputProps={{
                    endAdornment: <InputAdornment position="end">minutes</InputAdornment>,
                  }}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel id="passing-criteria-label">Passing Criteria</InputLabel>
                  <Select
                    labelId="passing-criteria-label"
                    name="passingCriteria"
                    value={formik.values.passingCriteria}
                    label="Passing Criteria"
                    onChange={formik.handleChange}
                  >
                    <MenuItem value="fixed">Fixed Percentage</MenuItem>
                    <MenuItem value="relative">Relative to Top Score</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              {formik.values.passingCriteria === 'fixed' && (
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Passing Score (%)"
                    name="passingScore"
                    type="number"
                    value={formik.values.passingScore}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.passingScore && Boolean(formik.errors.passingScore)}
                    helperText={formik.touched.passingScore && formik.errors.passingScore}
                    InputProps={{
                      endAdornment: <InputAdornment position="end">%</InputAdornment>,
                    }}
                  />
                </Grid>
              )}
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Start Date"
                  name="scheduledFor"
                  type="date"
                  value={formik.values.scheduledFor}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.scheduledFor && Boolean(formik.errors.scheduledFor)}
                  helperText={formik.touched.scheduledFor && formik.errors.scheduledFor}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="End Date"
                  name="scheduledEnd"
                  type="date"
                  value={formik.values.scheduledEnd}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.scheduledEnd && Boolean(formik.errors.scheduledEnd)}
                  helperText={formik.touched.scheduledEnd && formik.errors.scheduledEnd}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>
            </Grid>
          </TabPanel>
          
          <TabPanel value={tabValue} index={1}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Test Questions
              </Typography>
              
              <Typography variant="body2" color="text.secondary" paragraph>
                Add questions for your test. You can reorder questions by dragging them.
              </Typography>
              
              {questionsError && (
                <Alert severity="warning" sx={{ mb: 2 }}>
                  {questionsError}
                </Alert>
              )}
              
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={addQuestion}
                sx={{ mb: 3 }}
              >
                Add Question
              </Button>
            </Box>
            
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="questions">
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef}>
                    {questions.map((question, questionIndex) => (
                      <Draggable 
                        key={question.id} 
                        draggableId={question.id} 
                        index={questionIndex}
                      >
                        {(provided) => (
                          <Card 
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            elevation={3} 
                            sx={{ mb: 3, position: 'relative' }}
                          >
                            <CardHeader
                              avatar={
                                <div {...provided.dragHandleProps}>
                                  <DragIndicator />
                                </div>
                              }
                              title={`Question ${questionIndex + 1}`}
                              action={
                                <IconButton 
                                  aria-label="delete" 
                                  color="error"
                                  onClick={() => deleteQuestion(questionIndex)}
                                >
                                  <Delete />
                                </IconButton>
                              }
                            />
                            <CardContent>
                              <Grid container spacing={3}>
                                <Grid item xs={12}>
                                  <TextField
                                    fullWidth
                                    multiline
                                    rows={2}
                                    label="Question Text"
                                    value={question.text}
                                    onChange={(e) => updateQuestion(questionIndex, 'text', e.target.value)}
                                    placeholder="Enter your question here"
                                  />
                                </Grid>
                                
                                <Grid item xs={12} md={6}>
                                  <FormControl fullWidth>
                                    <InputLabel>Question Type</InputLabel>
                                    <Select
                                      value={question.type}
                                      label="Question Type"
                                      onChange={(e) => updateQuestion(questionIndex, 'type', e.target.value)}
                                    >
                                      <MenuItem value="single">Single Answer</MenuItem>
                                      <MenuItem value="multiple">Multiple Answers</MenuItem>
                                    </Select>
                                  </FormControl>
                                </Grid>
                                
                                <Grid item xs={12} md={6}>
                                  <TextField
                                    fullWidth
                                    label="Points"
                                    type="number"
                                    value={question.points}
                                    onChange={(e) => updateQuestion(questionIndex, 'points', parseInt(e.target.value, 10))}
                                    InputProps={{
                                      inputProps: { min: 1 }
                                    }}
                                  />
                                </Grid>
                                
                                <Grid item xs={12}>
                                  <Typography variant="subtitle1" gutterBottom>
                                    Answer Options
                                  </Typography>
                                  
                                  {question.options.map((option, optionIndex) => (
                                    <Box 
                                      key={option.id} 
                                      sx={{ 
                                        display: 'flex', 
                                        alignItems: 'center',
                                        mb: 2,
                                        p: 1,
                                        bgcolor: option.isCorrect ? 'success.50' : 'transparent',
                                        borderRadius: 1,
                                        border: option.isCorrect ? '1px solid' : 'none',
                                        borderColor: 'success.light'
                                      }}
                                    >
                                      {question.type === 'single' ? (
                                        <Radio
                                          checked={option.isCorrect}
                                          onChange={(e) => updateOption(questionIndex, optionIndex, 'isCorrect', e.target.checked)}
                                          sx={{ mr: 1 }}
                                        />
                                      ) : (
                                        <Checkbox
                                          checked={option.isCorrect}
                                          onChange={(e) => updateOption(questionIndex, optionIndex, 'isCorrect', e.target.checked)}
                                          sx={{ mr: 1 }}
                                        />
                                      )}
                                      
                                      <TextField
                                        fullWidth
                                        size="small"
                                        value={option.text}
                                        onChange={(e) => updateOption(questionIndex, optionIndex, 'text', e.target.value)}
                                        placeholder={`Option ${optionIndex + 1}`}
                                        sx={{ mr: 1 }}
                                      />
                                      
                                      <IconButton 
                                        size="small" 
                                        color="error"
                                        onClick={() => deleteOption(questionIndex, optionIndex)}
                                        disabled={question.options.length <= 2}
                                      >
                                        <Delete fontSize="small" />
                                      </IconButton>
                                    </Box>
                                  ))}
                                  
                                  <Button
                                    variant="outlined"
                                    startIcon={<Add />}
                                    onClick={() => addOption(questionIndex)}
                                    size="small"
                                  >
                                    Add Option
                                  </Button>
                                </Grid>
                              </Grid>
                            </CardContent>
                          </Card>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
            
            {questions.length === 0 && (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography color="text.secondary" paragraph>
                  No questions added yet.
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={addQuestion}
                >
                  Add Your First Question
                </Button>
              </Box>
            )}
          </TabPanel>
          
          <TabPanel value={tabValue} index={2}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Test Settings
                </Typography>
              </Grid>
              
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      name="randomizeQuestions"
                      checked={formik.values.randomizeQuestions}
                      onChange={formik.handleChange}
                    />
                  }
                  label="Randomize Question Order"
                />
                <Typography variant="body2" color="text.secondary">
                  Each student will see questions in a different random order
                </Typography>
              </Grid>
              
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      name="randomizeOptions"
                      checked={formik.values.randomizeOptions}
                      onChange={formik.handleChange}
                    />
                  }
                  label="Randomize Answer Options"
                />
                <Typography variant="body2" color="text.secondary">
                  Options for each question will appear in random order
                </Typography>
              </Grid>
              
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      name="showResults"
                      checked={formik.values.showResults}
                      onChange={formik.handleChange}
                    />
                  }
                  label="Show Results After Completion"
                />
                <Typography variant="body2" color="text.secondary">
                  Students will see their score and correct answers after submitting
                </Typography>
              </Grid>
              
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Publish Settings
                </Typography>
                
                <Alert severity="info" sx={{ mb: 2 }}>
                  You can save your test as a draft now and publish it later. Once published, students will be able to see it according to the scheduled dates.
                </Alert>
              </Grid>
            </Grid>
          </TabPanel>
          
          <Box sx={{ p: 3, borderTop: 1, borderColor: 'divider', display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              type="submit"
              startIcon={<Save />}
              disabled={isLoading}
            >
              {isLoading ? <CircularProgress size={24} /> : 'Save Test'}
            </Button>
          </Box>
        </form>
      </Paper>
    </Container>
  );
};

export default TestForm; 