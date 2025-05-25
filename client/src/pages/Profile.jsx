import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Divider,
  Grid,
  Paper,
  Tab,
  Tabs,
  TextField,
  Typography,
  CircularProgress,
  Alert,
  Stack
} from '@mui/material';
import {
  Person,
  Save,
  Lock,
  CloudUpload
} from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { userService } from '../services/api';

// TabPanel component
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
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

const Profile = () => {
  const { user } = useSelector((state) => state.auth);
  const [tabValue, setTabValue] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  
  const profileFormik = useFormik({
    initialValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      department: user?.department || '',
      year: user?.year || '',
    },
    validationSchema: Yup.object({
      firstName: Yup.string().required('First name is required'),
      lastName: Yup.string().required('Last name is required'),
      email: Yup.string().email('Invalid email address').required('Email is required'),
    }),
    onSubmit: async (values) => {
      setIsLoading(true);
      setIsError(false);
      setIsSuccess(false);
      
      try {
        // In a real app, this would call an API to update the profile
        await userService.updateProfile(values);
        setIsSuccess(true);
        setTimeout(() => setIsSuccess(false), 3000);
      } catch (error) {
        setIsError(true);
        setErrorMessage(error.response?.data?.message || 'Error updating profile');
      } finally {
        setIsLoading(false);
      }
    },
  });
  
  const passwordFormik = useFormik({
    initialValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
    validationSchema: Yup.object({
      currentPassword: Yup.string().required('Current password is required'),
      newPassword: Yup.string()
        .min(8, 'Password must be at least 8 characters')
        .required('New password is required'),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref('newPassword'), null], 'Passwords must match')
        .required('Confirm password is required'),
    }),
    onSubmit: async (values) => {
      setIsLoading(true);
      setIsError(false);
      setIsSuccess(false);
      
      try {
        // In a real app, this would call an API to change the password
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setIsSuccess(true);
        passwordFormik.resetForm();
        setTimeout(() => setIsSuccess(false), 3000);
      } catch (error) {
        setIsError(true);
        setErrorMessage(error.response?.data?.message || 'Error changing password');
      } finally {
        setIsLoading(false);
      }
    },
  });

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result);
      };
      reader.readAsDataURL(file);
      
      // In a real app, you would upload the image to the server
      // userService.uploadProfilePicture(file);
    }
  };

  return (
    <Container maxWidth="lg">
      <Paper sx={{ p: 3, mb: 4 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" gutterBottom>
            Profile Settings
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your account settings and profile information
          </Typography>
        </Box>
        
        <Grid container spacing={4}>
          <Grid item xs={12} md={3}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Avatar
                src={profileImage || user?.profilePicture}
                sx={{ width: 150, height: 150, mb: 2 }}
              >
                {user?.firstName?.charAt(0) || 'U'}
              </Avatar>
              
              <Button
                component="label"
                variant="outlined"
                startIcon={<CloudUpload />}
                sx={{ mb: 1 }}
              >
                Upload Photo
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleImageUpload}
                />
              </Button>
              
              <Typography variant="body2" color="text.secondary">
                Recommended: 400x400px, max 2MB
              </Typography>
            </Box>
            
            <Card sx={{ mt: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Account Information
                </Typography>
                
                <Stack spacing={1}>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Role
                    </Typography>
                    <Typography variant="body1" sx={{ textTransform: 'capitalize' }}>
                      {user?.role || 'User'}
                    </Typography>
                  </Box>
                  
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Member Since
                    </Typography>
                    <Typography variant="body1">
                      {user?.createdAt 
                        ? new Date(user.createdAt).toLocaleDateString() 
                        : 'Unknown'}
                    </Typography>
                  </Box>
                  
                  {user?.role === 'student' && (
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Student ID
                      </Typography>
                      <Typography variant="body1">
                        {user?.studentId || 'Not assigned'}
                      </Typography>
                    </Box>
                  )}
                  
                  {user?.role === 'teacher' && (
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Teacher ID
                      </Typography>
                      <Typography variant="body1">
                        {user?.teacherId || 'Not assigned'}
                      </Typography>
                    </Box>
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={9}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs 
                value={tabValue} 
                onChange={handleTabChange}
                variant="scrollable"
                scrollButtons="auto"
              >
                <Tab icon={<Person />} label="Personal Information" />
                <Tab icon={<Lock />} label="Change Password" />
              </Tabs>
            </Box>
            
            <TabPanel value={tabValue} index={0}>
              {isSuccess && (
                <Alert severity="success" sx={{ mb: 3 }}>
                  Profile updated successfully!
                </Alert>
              )}
              
              {isError && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {errorMessage || 'An error occurred. Please try again.'}
                </Alert>
              )}
              
              <form onSubmit={profileFormik.handleSubmit}>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="First Name"
                      name="firstName"
                      value={profileFormik.values.firstName}
                      onChange={profileFormik.handleChange}
                      onBlur={profileFormik.handleBlur}
                      error={profileFormik.touched.firstName && Boolean(profileFormik.errors.firstName)}
                      helperText={profileFormik.touched.firstName && profileFormik.errors.firstName}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Last Name"
                      name="lastName"
                      value={profileFormik.values.lastName}
                      onChange={profileFormik.handleChange}
                      onBlur={profileFormik.handleBlur}
                      error={profileFormik.touched.lastName && Boolean(profileFormik.errors.lastName)}
                      helperText={profileFormik.touched.lastName && profileFormik.errors.lastName}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Email Address"
                      name="email"
                      value={profileFormik.values.email}
                      onChange={profileFormik.handleChange}
                      onBlur={profileFormik.handleBlur}
                      error={profileFormik.touched.email && Boolean(profileFormik.errors.email)}
                      helperText={profileFormik.touched.email && profileFormik.errors.email}
                    />
                  </Grid>
                  
                  {user?.role === 'student' && (
                    <>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Department"
                          name="department"
                          value={profileFormik.values.department}
                          onChange={profileFormik.handleChange}
                          onBlur={profileFormik.handleBlur}
                          error={profileFormik.touched.department && Boolean(profileFormik.errors.department)}
                          helperText={profileFormik.touched.department && profileFormik.errors.department}
                        />
                      </Grid>
                      
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Year"
                          name="year"
                          type="number"
                          value={profileFormik.values.year}
                          onChange={profileFormik.handleChange}
                          onBlur={profileFormik.handleBlur}
                          error={profileFormik.touched.year && Boolean(profileFormik.errors.year)}
                          helperText={profileFormik.touched.year && profileFormik.errors.year}
                        />
                      </Grid>
                    </>
                  )}
                  
                  <Grid item xs={12}>
                    <Button
                      type="submit"
                      variant="contained"
                      startIcon={<Save />}
                      disabled={isLoading}
                    >
                      {isLoading ? <CircularProgress size={24} /> : 'Save Changes'}
                    </Button>
                  </Grid>
                </Grid>
              </form>
            </TabPanel>
            
            <TabPanel value={tabValue} index={1}>
              {isSuccess && (
                <Alert severity="success" sx={{ mb: 3 }}>
                  Password changed successfully!
                </Alert>
              )}
              
              {isError && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {errorMessage || 'An error occurred. Please try again.'}
                </Alert>
              )}
              
              <form onSubmit={passwordFormik.handleSubmit}>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Current Password"
                      name="currentPassword"
                      type="password"
                      value={passwordFormik.values.currentPassword}
                      onChange={passwordFormik.handleChange}
                      onBlur={passwordFormik.handleBlur}
                      error={passwordFormik.touched.currentPassword && Boolean(passwordFormik.errors.currentPassword)}
                      helperText={passwordFormik.touched.currentPassword && passwordFormik.errors.currentPassword}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="New Password"
                      name="newPassword"
                      type="password"
                      value={passwordFormik.values.newPassword}
                      onChange={passwordFormik.handleChange}
                      onBlur={passwordFormik.handleBlur}
                      error={passwordFormik.touched.newPassword && Boolean(passwordFormik.errors.newPassword)}
                      helperText={passwordFormik.touched.newPassword && passwordFormik.errors.newPassword}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Confirm New Password"
                      name="confirmPassword"
                      type="password"
                      value={passwordFormik.values.confirmPassword}
                      onChange={passwordFormik.handleChange}
                      onBlur={passwordFormik.handleBlur}
                      error={passwordFormik.touched.confirmPassword && Boolean(passwordFormik.errors.confirmPassword)}
                      helperText={passwordFormik.touched.confirmPassword && passwordFormik.errors.confirmPassword}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Button
                      type="submit"
                      variant="contained"
                      startIcon={<Lock />}
                      disabled={isLoading}
                    >
                      {isLoading ? <CircularProgress size={24} /> : 'Change Password'}
                    </Button>
                  </Grid>
                </Grid>
              </form>
            </TabPanel>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default Profile; 