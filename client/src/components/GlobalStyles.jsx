import React from 'react';
import { GlobalStyles as MuiGlobalStyles, useTheme } from '@mui/material';

/**
 * Global styles for the application
 * Adds custom styling to enhance the overall UI/UX
 */
const GlobalStyles = () => {
  const theme = useTheme();
  
  return (
    <MuiGlobalStyles
      styles={{
        // Enhanced Focus Styles
        '*:focus': {
          outline: `2px solid ${theme.palette.primary.main}40 !important`,
          outlineOffset: '2px !important',
        },
        
        // Smooth Transitions
        'a, button, .MuiButtonBase-root': {
          transition: 'all 0.2s ease-in-out !important',
        },
        
        // Animations
        '@keyframes fadeIn': {
          from: {
            opacity: 0,
            transform: 'translateY(10px)',
          },
          to: {
            opacity: 1,
            transform: 'translateY(0)',
          },
        },
        
        '@keyframes slideInLeft': {
          from: {
            opacity: 0,
            transform: 'translateX(-20px)',
          },
          to: {
            opacity: 1,
            transform: 'translateX(0)',
          },
        },
        
        '@keyframes pulse': {
          '0%': {
            boxShadow: '0 0 0 0 rgba(63, 81, 181, 0.4)',
          },
          '70%': {
            boxShadow: '0 0 0 10px rgba(63, 81, 181, 0)',
          },
          '100%': {
            boxShadow: '0 0 0 0 rgba(63, 81, 181, 0)',
          },
        },
        
        // Custom Scrollbar
        '*::-webkit-scrollbar': {
          width: '6px',
          height: '6px',
        },
        '*::-webkit-scrollbar-track': {
          background: theme.palette.mode === 'dark' ? '#333' : '#f5f5f5',
        },
        '*::-webkit-scrollbar-thumb': {
          background: theme.palette.mode === 'dark' ? '#555' : '#bdbdbd',
          borderRadius: '6px',
        },
        '*::-webkit-scrollbar-thumb:hover': {
          background: theme.palette.mode === 'dark' ? '#777' : '#9e9e9e',
        },
        
        // Better Typography
        body: {
          textRendering: 'optimizeLegibility',
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale',
        },
        
        // Animation Classes
        '.fadeIn': {
          animation: 'fadeIn 0.5s ease-out forwards',
        },
        '.slideInLeft': {
          animation: 'slideInLeft 0.5s ease-out forwards',
        },
        '.pulse': {
          animation: 'pulse 2s infinite',
        },
        
        // Utility Classes
        '.shadow-hover': {
          transition: 'box-shadow 0.3s ease !important',
          '&:hover': {
            boxShadow: theme.shadows[8],
          }
        },
        '.text-gradient': {
          background: theme.palette.mode === 'dark' 
            ? '-webkit-linear-gradient(45deg, #90caf9, #5d99c6)'
            : '-webkit-linear-gradient(45deg, #3f51b5, #5c6bc0)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          display: 'inline-block',
        },
      }}
    />
  );
};

export default GlobalStyles; 