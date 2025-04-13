import { createTheme } from '@mui/material/styles';

// Create theme based on mode
export const createAppTheme = (mode) => {
  return createTheme({
    palette: {
      mode,
      primary: {
        main: mode === 'dark' ? '#90caf9' : '#3f51b5',
        light: mode === 'dark' ? '#c3fdff' : '#757de8',
        dark: mode === 'dark' ? '#5d99c6' : '#002984',
        contrastText: mode === 'dark' ? '#000' : '#fff',
      },
      secondary: {
        main: mode === 'dark' ? '#f48fb1' : '#f50057',
        light: mode === 'dark' ? '#ffc1e3' : '#ff4081',
        dark: mode === 'dark' ? '#bf5f82' : '#c51162',
        contrastText: mode === 'dark' ? '#000' : '#fff',
      },
      success: {
        main: '#4caf50',
        light: '#81c784',
        dark: '#388e3c',
        50: 'rgba(76, 175, 80, 0.05)',
      },
      error: {
        main: '#f44336',
        light: '#e57373',
        dark: '#d32f2f',
        50: 'rgba(244, 67, 54, 0.05)',
      },
      warning: {
        main: '#ff9800',
        light: '#ffb74d',
        dark: '#f57c00',
        50: 'rgba(255, 152, 0, 0.05)',
      },
      info: {
        main: mode === 'dark' ? '#29b6f6' : '#2196f3',
        light: mode === 'dark' ? '#4fc3f7' : '#64b5f6',
        dark: mode === 'dark' ? '#0288d1' : '#1976d2',
        50: 'rgba(33, 150, 243, 0.05)',
      },
      background: {
        default: mode === 'dark' ? '#121212' : '#f5f5f5',
        paper: mode === 'dark' ? '#1e1e1e' : '#ffffff',
        subtle: mode === 'dark' ? '#2c2c2c' : '#f0f0f0',
      },
      text: {
        primary: mode === 'dark' ? '#ffffff' : 'rgba(0, 0, 0, 0.87)',
        secondary: mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)',
        disabled: mode === 'dark' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.38)',
      },
    },
    typography: {
      fontFamily: [
        '-apple-system',
        'BlinkMacSystemFont',
        '"Segoe UI"',
        'Roboto',
        '"Helvetica Neue"',
        'Arial',
        'sans-serif',
        '"Apple Color Emoji"',
        '"Segoe UI Emoji"',
        '"Segoe UI Symbol"',
      ].join(','),
      h4: {
        fontWeight: 600,
      },
      h5: {
        fontWeight: 600,
      },
      h6: {
        fontWeight: 600,
      },
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            borderRadius: 8,
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: 8,
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            boxShadow: mode === 'dark' 
              ? '0px 3px 5px rgba(0, 0, 0, 0.2)' 
              : '0px 2px 4px rgba(0, 0, 0, 0.05)',
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            boxShadow: mode === 'dark'
              ? '0px 1px 5px rgba(0, 0, 0, 0.2)'
              : '0px 1px 3px rgba(0, 0, 0, 0.1)',
            backgroundColor: mode === 'dark' ? '#1a1a1a' : undefined,
          },
        },
        defaultProps: {
          color: 'default',
          elevation: 0,
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: 8,
            },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 6,
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          head: {
            fontWeight: 600,
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundColor: mode === 'dark' ? '#1a1a1a' : undefined,
          },
        },
      },
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            scrollbarWidth: 'thin',
            '&::-webkit-scrollbar, & *::-webkit-scrollbar': {
              width: '0.4em',
              height: '0.4em',
            },
            '&::-webkit-scrollbar-track, & *::-webkit-scrollbar-track': {
              backgroundColor: mode === 'dark' ? '#333' : '#f5f5f5',
            },
            '&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb': {
              backgroundColor: mode === 'dark' ? '#555' : '#bdbdbd',
              borderRadius: 6,
            },
          },
        },
      },
    },
  });
};

// Export a default theme (light mode)
const theme = createAppTheme('light');
export default theme; 