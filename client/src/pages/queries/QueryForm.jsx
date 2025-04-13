import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Divider,
  FormControl,
  FormHelperText,
  Grid,
  IconButton,
  InputLabel,
  LinearProgress,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
  Alert,
  Stack,
  Autocomplete
} from '@mui/material';
import {
  Save,
  ArrowBack,
  CloudUpload,
  Delete,
  Person,
  Send
} from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useDropzone } from 'react-dropzone';
import { getQueryById, createQuery, updateQuery, resetQueryState, clearCurrentQuery } from '../../features/queries/queriesSlice';
import { userService } from '../../services/api';

const QueryForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentQuery, isLoading, isSuccess, isError, message } = useSelector((state) => state.queries);
  
  const [attachments, setAttachments] = useState([]);
  const [saveStatus, setSaveStatus] = useState('');
  const [students, setStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);

  useEffect(() => {
    // If editing, fetch query data
    if (id) {
      dispatch(getQueryById(id));
    } else {
      dispatch(clearCurrentQuery());
    }
    
    // Fetch available students
    const fetchStudents = async () => {
      setIsLoadingStudents(true);
      try {
        // In a real app, this would be an API call to get students
        // For now, we'll use mock data
        const mockStudents = [
          { id: 'student1', name: 'John Doe', email: 'john.doe@example.com' },
          { id: 'student2', name: 'Jane Smith', email: 'jane.smith@example.com' },
          { id: 'student3', name: 'Bob Johnson', email: 'bob.johnson@example.com' },
        ];
        setStudents(mockStudents);
      } catch (error) {
        console.error('Error fetching students:', error);
      } finally {
        setIsLoadingStudents(false);
      }
    };
    
    fetchStudents();
    
    return () => {
      dispatch(resetQueryState());
    };
  }, [id, dispatch]);

  // Set selected students when query data is loaded
  useEffect(() => {
    if (currentQuery?.assignedStudents && students.length > 0) {
      const selected = students.filter(student => 
        currentQuery.assignedStudents.includes(student.id)
      );
      setSelectedStudents(selected);
    }
  }, [currentQuery, students]);

  // Initialize form with default values or current query data
  const formik = useFormik({
    initialValues: {
      title: currentQuery?.title || '',
      question: currentQuery?.question || '',
      background: currentQuery?.background || '',
      deadline: currentQuery?.deadline ? new Date(currentQuery.deadline).toISOString().split('T')[0] : '',
      assignedStudents: currentQuery?.assignedStudents || [],
    },
    validationSchema: Yup.object({
      title: Yup.string().required('Title is required'),
      question: Yup.string().required('Question is required'),
      deadline: Yup.date().nullable(),
    }),
    onSubmit: (values) => {
      // Update assigned students list from selected students
      const assignedStudents = selectedStudents.map(student => student.id);
      const queryData = { ...values, assignedStudents };
      
      if (id) {
        dispatch(updateQuery({ id, queryData }));
      } else {
        dispatch(createQuery(queryData));
      }
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus(''), 3000);
    },
    enableReinitialize: true,
  });

  // Handle file uploads
  const { getRootProps, getInputProps } = useDropzone({
    onDrop: acceptedFiles => {
      const newAttachments = acceptedFiles.map(file => ({
        file,
        name: file.name,
        uploading: true
      }));
      
      setAttachments([...attachments, ...newAttachments]);
      
      // Simulate upload
      setTimeout(() => {
        setAttachments(prev => 
          prev.map(item => {
            if (item.uploading) {
              return { ...item, uploading: false };
            }
            return item;
          })
        );
      }, 1500);
    },
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.jpeg', '.jpg', '.png'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    maxSize: 5242880, // 5MB
  });

  const removeAttachment = (index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  // Handle successful create/update
  useEffect(() => {
    if (isSuccess && saveStatus === 'saved' && !id) {
      formik.resetForm();
      setSelectedStudents([]);
      setAttachments([]);
    }
  }, [isSuccess, saveStatus, id, formik]);

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
          onClick={() => navigate('/queries')}
          sx={{ mb: 2 }}
        >
          Back to Queries
        </Button>
        
        <Typography variant="h4" component="h1" gutterBottom>
          {id ? 'Edit Drug Information Query' : 'Create Drug Information Query'}
        </Typography>
      </Box>
      
      {isError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {message}
        </Alert>
      )}
      
      {isSuccess && saveStatus === 'saved' && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Query saved successfully!
        </Alert>
      )}
      
      <Paper sx={{ p: 3, mb: 4 }}>
        <form onSubmit={formik.handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Query Title"
                name="title"
                value={formik.values.title}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.title && Boolean(formik.errors.title)}
                helperText={formik.touched.title && formik.errors.title}
                placeholder="E.g., Medication Selection for Hypertension in Diabetic Patient"
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Question"
                name="question"
                value={formik.values.question}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.question && Boolean(formik.errors.question)}
                helperText={formik.touched.question && formik.errors.question}
                placeholder="What is the most appropriate antihypertensive medication for a 65-year-old patient with diabetes and stage 2 chronic kidney disease?"
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={6}
                label="Background Information"
                name="background"
                value={formik.values.background}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.background && Boolean(formik.errors.background)}
                helperText={formik.touched.background && formik.errors.background}
                placeholder="Provide relevant patient information, context, or specific requirements for the response."
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Deadline"
                name="deadline"
                type="date"
                value={formik.values.deadline}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.deadline && Boolean(formik.errors.deadline)}
                helperText={formik.touched.deadline && formik.errors.deadline}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Assign to Students
              </Typography>
              
              <Autocomplete
                multiple
                loading={isLoadingStudents}
                options={students}
                getOptionLabel={(option) => `${option.name} (${option.email})`}
                value={selectedStudents}
                onChange={(event, newValue) => {
                  setSelectedStudents(newValue);
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Select Students"
                    placeholder="Search by name or email"
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <React.Fragment>
                          {isLoadingStudents ? <CircularProgress color="inherit" size={20} /> : null}
                          {params.InputProps.endAdornment}
                        </React.Fragment>
                      ),
                    }}
                  />
                )}
                renderTags={(selectedOptions, getTagProps) =>
                  selectedOptions.map((option, index) => (
                    <Chip
                      avatar={<Person />}
                      label={option.name}
                      {...getTagProps({ index })}
                      key={option.id}
                    />
                  ))
                }
              />
            </Grid>
            
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Attachments
              </Typography>
              
              <Paper
                {...getRootProps()}
                sx={{
                  p: 3,
                  textAlign: 'center',
                  cursor: 'pointer',
                  backgroundColor: '#fafafa',
                  border: '2px dashed #ccc',
                  '&:hover': {
                    backgroundColor: '#f0f0f0',
                  },
                }}
              >
                <input {...getInputProps()} />
                <CloudUpload sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                <Typography variant="body1" gutterBottom>
                  Drag and drop files here, or click to select files
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Supported formats: PDF, DOC, DOCX, JPG, PNG (Max 5MB)
                </Typography>
              </Paper>
              
              {attachments.length > 0 && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Uploaded Files:
                  </Typography>
                  
                  <Stack spacing={1}>
                    {attachments.map((file, index) => (
                      <Paper key={index} sx={{ p: 1 }}>
                        <Grid container alignItems="center" spacing={1}>
                          <Grid item xs>
                            <Typography variant="body2" noWrap>
                              {file.name}
                            </Typography>
                            {file.uploading && <LinearProgress sx={{ mt: 1 }} />}
                          </Grid>
                          
                          <Grid item>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => removeAttachment(index)}
                              disabled={file.uploading}
                            >
                              <Delete fontSize="small" />
                            </IconButton>
                          </Grid>
                        </Grid>
                      </Paper>
                    ))}
                  </Stack>
                </Box>
              )}
            </Grid>
            
            <Grid item xs={12} sx={{ mt: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="contained"
                  type="submit"
                  startIcon={<Save />}
                  disabled={isLoading}
                >
                  {isLoading ? <CircularProgress size={24} /> : 'Save Query'}
                </Button>
                
                {id && currentQuery?.status === 'draft' && selectedStudents.length > 0 && (
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<Send />}
                    sx={{ ml: 2 }}
                    onClick={() => {
                      // Logic to assign the query to selected students
                      // This would typically dispatch an action
                      console.log('Assigning to students:', selectedStudents);
                    }}
                  >
                    Assign to Students
                  </Button>
                )}
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
};

export default QueryForm; 