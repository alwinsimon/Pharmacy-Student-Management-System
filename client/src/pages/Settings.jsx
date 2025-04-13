import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Container,
  Paper,
  Typography,
  Divider,
  FormControl,
  FormControlLabel,
  FormGroup,
  Switch,
  Grid,
  Select,
  MenuItem,
  InputLabel,
  Button,
  Alert
} from '@mui/material';
import { toggleDarkMode } from '../features/ui/uiSlice';

const Settings = () => {
  const dispatch = useDispatch();
  const { darkMode } = useSelector((state) => state.ui);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [language, setLanguage] = useState('en');
  const [timezone, setTimezone] = useState('UTC');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSaveSettings = () => {
    // In a real app, this would dispatch actions to save these settings
    // For now, just show a success message
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <Container maxWidth="lg">
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Settings
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Customize your application experience
        </Typography>

        {saveSuccess && (
          <Alert severity="success" sx={{ mb: 3 }}>
            Settings saved successfully
          </Alert>
        )}

        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Display Settings
          </Typography>
          <Divider sx={{ mb: 2 }} />

          <FormGroup>
            <FormControlLabel
              control={
                <Switch
                  checked={darkMode}
                  onChange={() => dispatch(toggleDarkMode())}
                />
              }
              label="Dark Mode"
            />
          </FormGroup>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Notification Preferences
          </Typography>
          <Divider sx={{ mb: 2 }} />

          <FormGroup>
            <FormControlLabel
              control={
                <Switch
                  checked={emailNotifications}
                  onChange={() => setEmailNotifications(!emailNotifications)}
                />
              }
              label="Email Notifications"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={pushNotifications}
                  onChange={() => setPushNotifications(!pushNotifications)}
                />
              }
              label="Push Notifications"
            />
          </FormGroup>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Regional Settings
          </Typography>
          <Divider sx={{ mb: 2 }} />

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel id="language-label">Language</InputLabel>
                <Select
                  labelId="language-label"
                  value={language}
                  label="Language"
                  onChange={(e) => setLanguage(e.target.value)}
                >
                  <MenuItem value="en">English</MenuItem>
                  <MenuItem value="es">Español</MenuItem>
                  <MenuItem value="fr">Français</MenuItem>
                  <MenuItem value="de">Deutsch</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel id="timezone-label">Timezone</InputLabel>
                <Select
                  labelId="timezone-label"
                  value={timezone}
                  label="Timezone"
                  onChange={(e) => setTimezone(e.target.value)}
                >
                  <MenuItem value="UTC">UTC</MenuItem>
                  <MenuItem value="EST">Eastern Time (EST)</MenuItem>
                  <MenuItem value="CST">Central Time (CST)</MenuItem>
                  <MenuItem value="MST">Mountain Time (MST)</MenuItem>
                  <MenuItem value="PST">Pacific Time (PST)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Box>

        <Button
          variant="contained"
          color="primary"
          onClick={handleSaveSettings}
        >
          Save Settings
        </Button>
      </Paper>
    </Container>
  );
};

export default Settings; 