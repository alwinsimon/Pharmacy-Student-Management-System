import React, { useEffect, useMemo } from 'react';
import { ThemeProvider as MuiThemeProvider, CssBaseline } from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import { createAppTheme } from '../theme';
import { setDarkMode } from '../features/ui/uiSlice';
import { STORAGE_KEYS, THEME_SETTINGS } from '../utils/constants';

const ThemeProvider = ({ children }) => {
  const dispatch = useDispatch();
  const { darkMode } = useSelector(state => state.ui);
  
  // Create theme based on current mode
  const theme = useMemo(() => 
    createAppTheme(darkMode ? THEME_SETTINGS.DARK.name : THEME_SETTINGS.LIGHT.name), 
    [darkMode]
  );

  // Initialize theme from localStorage on component mount
  useEffect(() => {
    const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME);
    // Only set theme if it differs from current state
    if (savedTheme === THEME_SETTINGS.DARK.name && !darkMode) {
      dispatch(setDarkMode(true));
    } else if (savedTheme === THEME_SETTINGS.LIGHT.name && darkMode) {
      dispatch(setDarkMode(false));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  // Save theme preference when it changes
  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEYS.THEME, 
      darkMode ? THEME_SETTINGS.DARK.name : THEME_SETTINGS.LIGHT.name
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [darkMode]); // Only darkMode should trigger this effect

  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  );
};

export default ThemeProvider; 