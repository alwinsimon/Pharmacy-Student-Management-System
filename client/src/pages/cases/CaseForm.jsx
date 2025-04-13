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
  FormHelperText,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stepper,
  Step,
  StepLabel,
  TextField,
  Typography,
  Alert,
  Stack,
  Card,
  CardContent,
  CardHeader,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Tooltip,
  LinearProgress
} from '@mui/material';
import {
  Save,
  ArrowBack,
  ArrowForward,
  PersonAdd,
  MedicalInformation,
  Assignment,
  Science,
  MenuBook,
  CloudUpload,
  Delete
} from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { getCaseById, createCase, updateCase, submitCase, resetCaseState, clearCurrentCase } from '../../features/cases/casesSlice';
import { useDropzone } from 'react-dropzone';

// Form sections as components
const PatientInfoForm = ({ formik }) => (
  <Grid container spacing={3}>
    <Grid item xs={12}>
      <Typography variant="h6" gutterBottom>
        Patient Demographics
      </Typography>
    </Grid>
    
    <Grid item xs={12} md={6}>
      <TextField
        fullWidth
        label="Age"
        name="patientInfo.age"
        type="number"
        value={formik.values.patientInfo.age}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={formik.touched.patientInfo?.age && Boolean(formik.errors.patientInfo?.age)}
        helperText={formik.touched.patientInfo?.age && formik.errors.patientInfo?.age}
        InputProps={{
          endAdornment: <InputAdornment position="end">years</InputAdornment>,
        }}
      />
    </Grid>
    
    <Grid item xs={12} md={6}>
      <FormControl fullWidth>
        <InputLabel id="gender-label">Gender</InputLabel>
        <Select
          labelId="gender-label"
          name="patientInfo.gender"
          value={formik.values.patientInfo.gender}
          label="Gender"
          onChange={formik.handleChange}
          error={formik.touched.patientInfo?.gender && Boolean(formik.errors.patientInfo?.gender)}
        >
          <MenuItem value="male">Male</MenuItem>
          <MenuItem value="female">Female</MenuItem>
          <MenuItem value="other">Other</MenuItem>
        </Select>
        {formik.touched.patientInfo?.gender && formik.errors.patientInfo?.gender && (
          <FormHelperText error>{formik.errors.patientInfo.gender}</FormHelperText>
        )}
      </FormControl>
    </Grid>
    
    <Grid item xs={12} md={4}>
      <TextField
        fullWidth
        label="Weight"
        name="patientInfo.weight"
        type="number"
        value={formik.values.patientInfo.weight}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={formik.touched.patientInfo?.weight && Boolean(formik.errors.patientInfo?.weight)}
        helperText={formik.touched.patientInfo?.weight && formik.errors.patientInfo?.weight}
        InputProps={{
          endAdornment: <InputAdornment position="end">kg</InputAdornment>,
        }}
      />
    </Grid>
    
    <Grid item xs={12} md={4}>
      <TextField
        fullWidth
        label="Height"
        name="patientInfo.height"
        type="number"
        value={formik.values.patientInfo.height}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={formik.touched.patientInfo?.height && Boolean(formik.errors.patientInfo?.height)}
        helperText={formik.touched.patientInfo?.height && formik.errors.patientInfo?.height}
        InputProps={{
          endAdornment: <InputAdornment position="end">cm</InputAdornment>,
        }}
      />
    </Grid>
    
    <Grid item xs={12} md={4}>
      <TextField
        fullWidth
        label="BMI"
        value={
          formik.values.patientInfo.weight && formik.values.patientInfo.height
            ? (formik.values.patientInfo.weight / Math.pow(formik.values.patientInfo.height / 100, 2)).toFixed(1)
            : ''
        }
        InputProps={{
          readOnly: true,
        }}
        variant="filled"
      />
    </Grid>
    
    <Grid item xs={12}>
      <TextField
        fullWidth
        multiline
        rows={3}
        label="Chief Complaint"
        name="patientInfo.chiefComplaint"
        value={formik.values.patientInfo.chiefComplaint}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={formik.touched.patientInfo?.chiefComplaint && Boolean(formik.errors.patientInfo?.chiefComplaint)}
        helperText={formik.touched.patientInfo?.chiefComplaint && formik.errors.patientInfo?.chiefComplaint}
      />
    </Grid>
    
    <Grid item xs={12}>
      <TextField
        fullWidth
        multiline
        rows={4}
        label="History of Present Illness"
        name="patientInfo.historyOfPresentIllness"
        value={formik.values.patientInfo.historyOfPresentIllness}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={formik.touched.patientInfo?.historyOfPresentIllness && Boolean(formik.errors.patientInfo?.historyOfPresentIllness)}
        helperText={formik.touched.patientInfo?.historyOfPresentIllness && formik.errors.patientInfo?.historyOfPresentIllness}
      />
    </Grid>
    
    <Grid item xs={12}>
      <TextField
        fullWidth
        multiline
        rows={4}
        label="Past Medical History"
        name="patientInfo.pastMedicalHistory"
        value={formik.values.patientInfo.pastMedicalHistory}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={formik.touched.patientInfo?.pastMedicalHistory && Boolean(formik.errors.patientInfo?.pastMedicalHistory)}
        helperText={formik.touched.patientInfo?.pastMedicalHistory && formik.errors.patientInfo?.pastMedicalHistory}
      />
    </Grid>
  </Grid>
);

const MedicationHistoryForm = ({ formik }) => (
  <Grid container spacing={3}>
    <Grid item xs={12}>
      <Typography variant="h6" gutterBottom>
        Current Medications
      </Typography>
      
      {formik.values.medicationHistory.currentMedications.map((med, index) => (
        <Card key={index} sx={{ mb: 2 }}>
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Medication Name"
                  name={`medicationHistory.currentMedications[${index}].name`}
                  value={med.name}
                  onChange={formik.handleChange}
                  error={
                    formik.touched.medicationHistory?.currentMedications?.[index]?.name && 
                    Boolean(formik.errors.medicationHistory?.currentMedications?.[index]?.name)
                  }
                  helperText={
                    formik.touched.medicationHistory?.currentMedications?.[index]?.name && 
                    formik.errors.medicationHistory?.currentMedications?.[index]?.name
                  }
                />
              </Grid>
              
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label="Dose"
                  name={`medicationHistory.currentMedications[${index}].dose`}
                  value={med.dose}
                  onChange={formik.handleChange}
                  error={
                    formik.touched.medicationHistory?.currentMedications?.[index]?.dose && 
                    Boolean(formik.errors.medicationHistory?.currentMedications?.[index]?.dose)
                  }
                  helperText={
                    formik.touched.medicationHistory?.currentMedications?.[index]?.dose && 
                    formik.errors.medicationHistory?.currentMedications?.[index]?.dose
                  }
                />
              </Grid>
              
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label="Frequency"
                  name={`medicationHistory.currentMedications[${index}].frequency`}
                  value={med.frequency}
                  onChange={formik.handleChange}
                  error={
                    formik.touched.medicationHistory?.currentMedications?.[index]?.frequency && 
                    Boolean(formik.errors.medicationHistory?.currentMedications?.[index]?.frequency)
                  }
                  helperText={
                    formik.touched.medicationHistory?.currentMedications?.[index]?.frequency && 
                    formik.errors.medicationHistory?.currentMedications?.[index]?.frequency
                  }
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Indication"
                  name={`medicationHistory.currentMedications[${index}].indication`}
                  value={med.indication}
                  onChange={formik.handleChange}
                  error={
                    formik.touched.medicationHistory?.currentMedications?.[index]?.indication && 
                    Boolean(formik.errors.medicationHistory?.currentMedications?.[index]?.indication)
                  }
                  helperText={
                    formik.touched.medicationHistory?.currentMedications?.[index]?.indication && 
                    formik.errors.medicationHistory?.currentMedications?.[index]?.indication
                  }
                />
              </Grid>
              
              <Grid item xs={12} textAlign="right">
                <Button
                  color="error"
                  startIcon={<Delete />}
                  onClick={() => {
                    const newMeds = [...formik.values.medicationHistory.currentMedications];
                    newMeds.splice(index, 1);
                    formik.setFieldValue('medicationHistory.currentMedications', newMeds);
                  }}
                >
                  Remove
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      ))}
      
      <Button
        variant="outlined"
        onClick={() => {
          formik.setFieldValue('medicationHistory.currentMedications', [
            ...formik.values.medicationHistory.currentMedications,
            { name: '', dose: '', frequency: '', indication: '' }
          ]);
        }}
        sx={{ mt: 1 }}
      >
        Add Medication
      </Button>
    </Grid>
    
    <Grid item xs={12} sx={{ mt: 2 }}>
      <Divider />
    </Grid>
    
    <Grid item xs={12}>
      <Typography variant="h6" gutterBottom>
        Medication Allergies
      </Typography>
      
      {formik.values.medicationHistory.allergies.map((allergy, index) => (
        <Card key={index} sx={{ mb: 2 }}>
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Medication"
                  name={`medicationHistory.allergies[${index}].medication`}
                  value={allergy.medication}
                  onChange={formik.handleChange}
                  error={
                    formik.touched.medicationHistory?.allergies?.[index]?.medication && 
                    Boolean(formik.errors.medicationHistory?.allergies?.[index]?.medication)
                  }
                  helperText={
                    formik.touched.medicationHistory?.allergies?.[index]?.medication && 
                    formik.errors.medicationHistory?.allergies?.[index]?.medication
                  }
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Reaction"
                  name={`medicationHistory.allergies[${index}].reaction`}
                  value={allergy.reaction}
                  onChange={formik.handleChange}
                  error={
                    formik.touched.medicationHistory?.allergies?.[index]?.reaction && 
                    Boolean(formik.errors.medicationHistory?.allergies?.[index]?.reaction)
                  }
                  helperText={
                    formik.touched.medicationHistory?.allergies?.[index]?.reaction && 
                    formik.errors.medicationHistory?.allergies?.[index]?.reaction
                  }
                />
              </Grid>
              
              <Grid item xs={12} textAlign="right">
                <Button
                  color="error"
                  startIcon={<Delete />}
                  onClick={() => {
                    const newAllergies = [...formik.values.medicationHistory.allergies];
                    newAllergies.splice(index, 1);
                    formik.setFieldValue('medicationHistory.allergies', newAllergies);
                  }}
                >
                  Remove
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      ))}
      
      <Button
        variant="outlined"
        onClick={() => {
          formik.setFieldValue('medicationHistory.allergies', [
            ...formik.values.medicationHistory.allergies,
            { medication: '', reaction: '' }
          ]);
        }}
        sx={{ mt: 1 }}
      >
        Add Allergy
      </Button>
    </Grid>
  </Grid>
);

const LabValuesForm = ({ formik }) => (
  <Grid container spacing={3}>
    <Grid item xs={12}>
      <Typography variant="h6" gutterBottom>
        Laboratory Values
      </Typography>
      
      {formik.values.labValues.map((lab, index) => (
        <Card key={index} sx={{ mb: 2 }}>
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Test Name"
                  name={`labValues[${index}].testName`}
                  value={lab.testName}
                  onChange={formik.handleChange}
                  error={
                    formik.touched.labValues?.[index]?.testName && 
                    Boolean(formik.errors.labValues?.[index]?.testName)
                  }
                  helperText={
                    formik.touched.labValues?.[index]?.testName && 
                    formik.errors.labValues?.[index]?.testName
                  }
                />
              </Grid>
              
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label="Value"
                  name={`labValues[${index}].value`}
                  value={lab.value}
                  onChange={formik.handleChange}
                  error={
                    formik.touched.labValues?.[index]?.value && 
                    Boolean(formik.errors.labValues?.[index]?.value)
                  }
                  helperText={
                    formik.touched.labValues?.[index]?.value && 
                    formik.errors.labValues?.[index]?.value
                  }
                />
              </Grid>
              
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label="Reference Range"
                  name={`labValues[${index}].referenceRange`}
                  value={lab.referenceRange}
                  onChange={formik.handleChange}
                  error={
                    formik.touched.labValues?.[index]?.referenceRange && 
                    Boolean(formik.errors.labValues?.[index]?.referenceRange)
                  }
                  helperText={
                    formik.touched.labValues?.[index]?.referenceRange && 
                    formik.errors.labValues?.[index]?.referenceRange
                  }
                />
              </Grid>
              
              <Grid item xs={12} md={2}>
                <TextField
                  fullWidth
                  label="Date"
                  type="date"
                  name={`labValues[${index}].date`}
                  value={lab.date}
                  onChange={formik.handleChange}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  error={
                    formik.touched.labValues?.[index]?.date && 
                    Boolean(formik.errors.labValues?.[index]?.date)
                  }
                  helperText={
                    formik.touched.labValues?.[index]?.date && 
                    formik.errors.labValues?.[index]?.date
                  }
                />
              </Grid>
              
              <Grid item xs={12} textAlign="right">
                <Button
                  color="error"
                  startIcon={<Delete />}
                  onClick={() => {
                    const newLabs = [...formik.values.labValues];
                    newLabs.splice(index, 1);
                    formik.setFieldValue('labValues', newLabs);
                  }}
                >
                  Remove
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      ))}
      
      <Button
        variant="outlined"
        onClick={() => {
          formik.setFieldValue('labValues', [
            ...formik.values.labValues,
            { testName: '', value: '', referenceRange: '', date: '' }
          ]);
        }}
        sx={{ mt: 1 }}
      >
        Add Lab Value
      </Button>
    </Grid>
  </Grid>
);

const AssessmentAndPlanForm = ({ formik }) => (
  <Grid container spacing={3}>
    <Grid item xs={12}>
      <Typography variant="h6" gutterBottom>
        Assessment
      </Typography>
      <TextField
        fullWidth
        multiline
        rows={4}
        label="Diagnosis/Problem List"
        name="assessment.diagnosis"
        value={formik.values.assessment.diagnosis}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={formik.touched.assessment?.diagnosis && Boolean(formik.errors.assessment?.diagnosis)}
        helperText={formik.touched.assessment?.diagnosis && formik.errors.assessment?.diagnosis}
      />
    </Grid>
    
    <Grid item xs={12}>
      <TextField
        fullWidth
        multiline
        rows={4}
        label="Differential Diagnoses"
        name="assessment.differentialDiagnoses"
        value={formik.values.assessment.differentialDiagnoses}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={formik.touched.assessment?.differentialDiagnoses && Boolean(formik.errors.assessment?.differentialDiagnoses)}
        helperText={formik.touched.assessment?.differentialDiagnoses && formik.errors.assessment?.differentialDiagnoses}
      />
    </Grid>
    
    <Grid item xs={12} sx={{ mt: 2 }}>
      <Divider />
    </Grid>
    
    <Grid item xs={12}>
      <Typography variant="h6" gutterBottom>
        Plan
      </Typography>
      <TextField
        fullWidth
        multiline
        rows={4}
        label="Medication Plan"
        name="plan.medications"
        value={formik.values.plan.medications}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={formik.touched.plan?.medications && Boolean(formik.errors.plan?.medications)}
        helperText={formik.touched.plan?.medications && formik.errors.plan?.medications}
      />
    </Grid>
    
    <Grid item xs={12}>
      <TextField
        fullWidth
        multiline
        rows={4}
        label="Non-Pharmacological Interventions"
        name="plan.nonPharmacological"
        value={formik.values.plan.nonPharmacological}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={formik.touched.plan?.nonPharmacological && Boolean(formik.errors.plan?.nonPharmacological)}
        helperText={formik.touched.plan?.nonPharmacological && formik.errors.plan?.nonPharmacological}
      />
    </Grid>
    
    <Grid item xs={12}>
      <TextField
        fullWidth
        multiline
        rows={3}
        label="Monitoring and Follow-up"
        name="plan.followUp"
        value={formik.values.plan.followUp}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={formik.touched.plan?.followUp && Boolean(formik.errors.plan?.followUp)}
        helperText={formik.touched.plan?.followUp && formik.errors.plan?.followUp}
      />
    </Grid>
  </Grid>
);

const ReferencesAndUploadForm = ({ formik, handleAttachmentUpload, attachments, removeAttachment }) => {
  const { getRootProps, getInputProps } = useDropzone({
    onDrop: handleAttachmentUpload,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.jpeg', '.jpg', '.png'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    maxSize: 5242880, // 5MB
  });

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom>
          References
        </Typography>
        <TextField
          fullWidth
          multiline
          rows={4}
          label="References and Evidence Sources"
          name="references"
          value={formik.values.references}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.references && Boolean(formik.errors.references)}
          helperText={formik.touched.references && formik.errors.references}
          placeholder="List your references here using a standard citation format"
        />
      </Grid>
      
      <Grid item xs={12} sx={{ mt: 2 }}>
        <Divider />
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
                      <Tooltip title="Remove">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => removeAttachment(index)}
                          disabled={file.uploading}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Grid>
                  </Grid>
                </Paper>
              ))}
            </Stack>
          </Box>
        )}
      </Grid>
      
      <Grid item xs={12}>
        <FormControl fullWidth>
          <InputLabel id="teacher-label">Assign to Teacher</InputLabel>
          <Select
            labelId="teacher-label"
            name="teacherId"
            value={formik.values.teacherId}
            label="Assign to Teacher"
            onChange={formik.handleChange}
            error={formik.touched.teacherId && Boolean(formik.errors.teacherId)}
          >
            <MenuItem value="">Select a teacher</MenuItem>
            <MenuItem value="teacher1">Dr. Smith</MenuItem>
            <MenuItem value="teacher2">Dr. Johnson</MenuItem>
            <MenuItem value="teacher3">Dr. Williams</MenuItem>
          </Select>
          {formik.touched.teacherId && formik.errors.teacherId && (
            <FormHelperText error>{formik.errors.teacherId}</FormHelperText>
          )}
        </FormControl>
      </Grid>
    </Grid>
  );
};

// Main case form component
const CaseForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentCase, isLoading, isSuccess, isError, message } = useSelector((state) => state.cases);
  const { user } = useSelector((state) => state.auth);
  
  const [activeStep, setActiveStep] = useState(0);
  const [attachments, setAttachments] = useState([]);
  const [saveStatus, setSaveStatus] = useState('');
  const [submitConfirm, setSubmitConfirm] = useState(false);
  
  const steps = [
    { label: 'Patient Info', icon: <PersonAdd /> },
    { label: 'Medication History', icon: <MedicalInformation /> },
    { label: 'Lab Values', icon: <Science /> },
    { label: 'Assessment & Plan', icon: <Assignment /> },
    { label: 'References & Submit', icon: <MenuBook /> },
  ];

  // Initialize form with default values or current case data
  const formik = useFormik({
    initialValues: {
      title: currentCase?.title || '',
      patientInfo: {
        age: currentCase?.patientInfo?.age || '',
        gender: currentCase?.patientInfo?.gender || '',
        weight: currentCase?.patientInfo?.weight || '',
        height: currentCase?.patientInfo?.height || '',
        chiefComplaint: currentCase?.patientInfo?.chiefComplaint || '',
        historyOfPresentIllness: currentCase?.patientInfo?.historyOfPresentIllness || '',
        pastMedicalHistory: currentCase?.patientInfo?.pastMedicalHistory || '',
      },
      medicationHistory: {
        currentMedications: currentCase?.medicationHistory?.currentMedications || [
          { name: '', dose: '', frequency: '', indication: '' }
        ],
        allergies: currentCase?.medicationHistory?.allergies || [
          { medication: '', reaction: '' }
        ],
      },
      labValues: currentCase?.labValues || [
        { testName: '', value: '', referenceRange: '', date: '' }
      ],
      assessment: {
        diagnosis: currentCase?.assessment?.diagnosis || '',
        differentialDiagnoses: currentCase?.assessment?.differentialDiagnoses || '',
      },
      plan: {
        medications: currentCase?.plan?.medications || '',
        nonPharmacological: currentCase?.plan?.nonPharmacological || '',
        followUp: currentCase?.plan?.followUp || '',
      },
      references: currentCase?.references || '',
      teacherId: currentCase?.teacherId || '',
    },
    validationSchema: Yup.object({
      title: Yup.string().required('Title is required'),
      patientInfo: Yup.object({
        age: Yup.number().required('Age is required'),
        gender: Yup.string().required('Gender is required'),
        chiefComplaint: Yup.string().required('Chief complaint is required'),
      }),
      assessment: Yup.object({
        diagnosis: Yup.string().required('Diagnosis is required'),
      }),
      teacherId: Yup.string().required('Please assign a teacher for review'),
    }),
    onSubmit: (values) => {
      if (id) {
        dispatch(updateCase({ id, caseData: values }));
      } else {
        dispatch(createCase(values));
      }
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus(''), 3000);
    },
    enableReinitialize: true,
  });

  // Fetch case data if editing
  useEffect(() => {
    if (id) {
      dispatch(getCaseById(id));
    } else {
      dispatch(clearCurrentCase());
    }
    
    return () => {
      dispatch(resetCaseState());
    };
  }, [id, dispatch]);

  // Handle successful create/update
  useEffect(() => {
    if (isSuccess && saveStatus === 'saved') {
      // Reset form if creating new case
      if (!id) {
        formik.resetForm();
        setActiveStep(0);
      }
    }
  }, [isSuccess, saveStatus, id, formik]);

  // Handle file uploads
  const handleAttachmentUpload = (acceptedFiles) => {
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
  };

  const removeAttachment = (index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  // Navigation between steps
  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  // Handle submission to teacher
  const handleSubmitCase = () => {
    if (id) {
      dispatch(submitCase(id));
      navigate(`/cases/${id}`);
    } else {
      // First save the case, then submit
      formik.handleSubmit();
      // The navigation would happen after the case is created and we have an ID
    }
  };

  // Render appropriate form section based on active step
  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return <PatientInfoForm formik={formik} />;
      case 1:
        return <MedicationHistoryForm formik={formik} />;
      case 2:
        return <LabValuesForm formik={formik} />;
      case 3:
        return <AssessmentAndPlanForm formik={formik} />;
      case 4:
        return (
          <ReferencesAndUploadForm 
            formik={formik} 
            handleAttachmentUpload={handleAttachmentUpload} 
            attachments={attachments} 
            removeAttachment={removeAttachment} 
          />
        );
      default:
        return 'Unknown step';
    }
  };

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
          onClick={() => navigate('/cases')}
          sx={{ mb: 2 }}
        >
          Back to Cases
        </Button>
        
        <Typography variant="h4" component="h1" gutterBottom>
          {id ? 'Edit Clinical Case' : 'New Clinical Case'}
        </Typography>
        
        <Paper sx={{ p: 2, mb: 3 }}>
          <TextField
            fullWidth
            label="Case Title"
            name="title"
            value={formik.values.title}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.title && Boolean(formik.errors.title)}
            helperText={formik.touched.title && formik.errors.title}
            placeholder="E.g., Hypertension Management in Elderly Patient"
          />
        </Paper>
      </Box>
      
      {isError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {message}
        </Alert>
      )}
      
      {isSuccess && saveStatus === 'saved' && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Case saved successfully!
        </Alert>
      )}
      
      <Paper sx={{ p: 3, mb: 4 }}>
        <Stepper 
          activeStep={activeStep} 
          alternativeLabel
          sx={{ mb: 4, display: { xs: 'none', md: 'flex' } }}
        >
          {steps.map((step) => (
            <Step key={step.label}>
              <StepLabel StepIconComponent={() => step.icon}>{step.label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        
        <Typography 
          variant="h6" 
          sx={{ mb: 3, display: { xs: 'block', md: 'none' } }}
        >
          Step {activeStep + 1}: {steps[activeStep].label}
        </Typography>
        
        <form onSubmit={formik.handleSubmit}>
          {getStepContent(activeStep)}
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button
              variant="outlined"
              onClick={handleBack}
              disabled={activeStep === 0}
              startIcon={<ArrowBack />}
            >
              Back
            </Button>
            
            <Box>
              <Button
                variant="outlined"
                onClick={() => formik.handleSubmit()}
                sx={{ mr: 1 }}
                startIcon={<Save />}
                disabled={isLoading}
              >
                Save Draft
              </Button>
              
              {activeStep === steps.length - 1 ? (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => setSubmitConfirm(true)}
                  disabled={isLoading || !formik.isValid}
                >
                  Submit for Review
                </Button>
              ) : (
                <Button
                  variant="contained"
                  onClick={handleNext}
                  endIcon={<ArrowForward />}
                >
                  Next
                </Button>
              )}
            </Box>
          </Box>
        </form>
      </Paper>
      
      {/* Confirmation Dialog for Submit */}
      {submitConfirm && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
          }}
        >
          <Paper sx={{ p: 3, maxWidth: 500 }}>
            <Typography variant="h6" gutterBottom>
              Submit Case for Review
            </Typography>
            <Typography variant="body1" paragraph>
              Are you sure you want to submit this case for review? Once submitted, you won't be able to make further changes unless your teacher requests revisions.
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
              <Button 
                variant="outlined" 
                onClick={() => setSubmitConfirm(false)}
                sx={{ mr: 1 }}
              >
                Cancel
              </Button>
              <Button 
                variant="contained" 
                color="primary"
                onClick={handleSubmitCase}
              >
                Submit
              </Button>
            </Box>
          </Paper>
        </Box>
      )}
    </Container>
  );
};

export default CaseForm;