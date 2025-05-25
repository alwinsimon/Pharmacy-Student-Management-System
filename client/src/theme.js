import { createTheme } from '@mui/material/styles';
import { THEME_SETTINGS } from './utils/constants';

// Create theme based on mode
export const createAppTheme = (mode) => {
  const isDark = mode === THEME_SETTINGS.DARK.name;
  
  return createTheme({
    palette: {
      mode,
      primary: {
        main: isDark ? '#90caf9' : '#3f51b5',
        light: isDark ? '#c3fdff' : '#757de8',
        dark: isDark ? '#5d99c6' : '#002984',
        contrastText: isDark ? '#000' : '#fff',
      },
      secondary: {
        main: isDark ? '#f48fb1' : '#f50057',
        light: isDark ? '#ffc1e3' : '#ff4081',
        dark: isDark ? '#bf5f82' : '#c51162',
        contrastText: isDark ? '#000' : '#fff',
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
        main: isDark ? '#29b6f6' : '#2196f3',
        light: isDark ? '#4fc3f7' : '#64b5f6',
        dark: isDark ? '#0288d1' : '#1976d2',
        50: 'rgba(33, 150, 243, 0.05)',
      },
      background: {
        default: isDark ? '#121212' : '#f5f5f5',
        paper: isDark ? '#1e1e1e' : '#ffffff',
        subtle: isDark ? '#2c2c2c' : '#f0f0f0',
      },
      text: {
        primary: isDark ? '#ffffff' : 'rgba(0, 0, 0, 0.87)',
        secondary: isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)',
        disabled: isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.38)',
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
      h1: {
        fontWeight: 700,
        fontSize: '2.5rem',
        lineHeight: 1.2,
        '@media (min-width:600px)': {
          fontSize: '3.5rem',
        },
      },
      h2: {
        fontWeight: 700,
        fontSize: '2rem',
        lineHeight: 1.2,
        '@media (min-width:600px)': {
          fontSize: '3rem',
        },
      },
      h3: {
        fontWeight: 600,
        fontSize: '1.75rem',
        lineHeight: 1.3,
        '@media (min-width:600px)': {
          fontSize: '2.5rem',
        },
      },
      h4: {
        fontWeight: 600,
        fontSize: '1.5rem',
        lineHeight: 1.4,
      },
      h5: {
        fontWeight: 600,
        fontSize: '1.25rem',
        lineHeight: 1.4,
      },
      h6: {
        fontWeight: 600,
        fontSize: '1rem',
        lineHeight: 1.4,
      },
      subtitle1: {
        fontWeight: 600,
        fontSize: '1rem',
      },
      body1: {
        lineHeight: 1.7,
      },
      button: {
        fontWeight: 600,
      },
    },
    shape: {
      borderRadius: 8,
    },
    shadows: [
      'none',
      '0px 2px 4px rgba(0,0,0,0.05)',
      '0px 3px 6px rgba(0,0,0,0.08)',
      '0px 4px 8px rgba(0,0,0,0.1)',
      '0px 5px 10px rgba(0,0,0,0.12)',
      '0px 6px 12px rgba(0,0,0,0.14)',
      '0px 7px 14px rgba(0,0,0,0.16)',
      '0px 8px 16px rgba(0,0,0,0.18)',
      '0px 9px 18px rgba(0,0,0,0.2)',
      '0px 10px 20px rgba(0,0,0,0.22)',
      '0px 11px 22px rgba(0,0,0,0.24)',
      '0px 12px 24px rgba(0,0,0,0.26)',
      '0px 13px 26px rgba(0,0,0,0.28)',
      '0px 14px 28px rgba(0,0,0,0.3)',
      '0px 15px 30px rgba(0,0,0,0.32)',
      '0px 16px 32px rgba(0,0,0,0.34)',
      '0px 17px 34px rgba(0,0,0,0.36)',
      '0px 18px 36px rgba(0,0,0,0.38)',
      '0px 19px 38px rgba(0,0,0,0.4)',
      '0px 20px 40px rgba(0,0,0,0.42)',
      '0px 21px 42px rgba(0,0,0,0.44)',
      '0px 22px 44px rgba(0,0,0,0.46)',
      '0px 23px 46px rgba(0,0,0,0.48)',
      '0px 24px 48px rgba(0,0,0,0.5)',
    ],
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            borderRadius: 8,
            padding: '8px 16px',
            fontWeight: 600,
          },
          contained: {
            boxShadow: isDark ? '0px 3px 5px rgba(0, 0, 0, 0.3)' : '0px 3px 5px rgba(0, 0, 0, 0.1)'
          }
        },
        defaultProps: {
          disableElevation: true
        }
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
            borderRadius: 12,
            boxShadow: isDark 
              ? '0px 3px 5px rgba(0, 0, 0, 0.2)' 
              : '0px 2px 4px rgba(0, 0, 0, 0.05)',
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            boxShadow: isDark
              ? '0px 1px 5px rgba(0, 0, 0, 0.2)'
              : '0px 1px 3px rgba(0, 0, 0, 0.1)',
            backgroundColor: isDark ? '#1a1a1a' : undefined,
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
            backgroundColor: isDark ? '#1a1a1a' : undefined,
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
              backgroundColor: isDark ? '#333' : '#f5f5f5',
            },
            '&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb': {
              backgroundColor: isDark ? '#555' : '#bdbdbd',
              borderRadius: 6,
            },
          },
        },
      },
      MuiAvatar: {
        styleOverrides: {
          root: {
            fontSize: '1rem',
            fontWeight: 600,
          },
        },
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.9)',
            color: isDark ? 'rgba(0, 0, 0, 0.87)' : '#fff',
            fontSize: '0.75rem',
            padding: '8px 12px',
            borderRadius: 4,
          },
        },
      },
    },
  });
};

// Export a default theme (light mode)
const theme = createAppTheme(THEME_SETTINGS.LIGHT.name);
export default theme; 