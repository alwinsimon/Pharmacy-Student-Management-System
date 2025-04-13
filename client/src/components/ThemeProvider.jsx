import React, { useEffect } from 'react';
import { ThemeProvider as MuiThemeProvider, CssBaseline } from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import { createAppTheme } from '../theme';
import { toggleDarkMode } from '../features/ui/uiSlice';
import { STORAGE_KEYS } from '../utils/constants';

const ThemeProvider = ({ children }) => {
  const dispatch = useDispatch();
  const { darkMode } = useSelector(state => state.ui);
  const theme = createAppTheme(darkMode ? 'dark' : 'light');

  // Initialize theme from localStorage on component mount
  useEffect(() => {
    const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME);
    if (savedTheme === 'dark' && !darkMode) {
      dispatch(toggleDarkMode());
    }
  }, [dispatch, darkMode]);

  // Save theme preference when it changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.THEME, darkMode ? 'dark' : 'light');
  }, [darkMode]);

  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  );
};

export default ThemeProvider; 