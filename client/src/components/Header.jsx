import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Divider,
  Button,
  Avatar,
  ListItemIcon,
  Tooltip,
  useMediaQuery,
  Container,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  SwipeableDrawer,
  Switch,
  FormControlLabel
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { 
  Menu as MenuIcon,
  Dashboard,
  Assignment,
  QuestionAnswer,
  Quiz,
  Person,
  Notifications,
  Settings,
  Logout,
  AdminPanelSettings,
  Help,
  LightMode,
  DarkMode,
  Close,
  LocalPharmacy
} from '@mui/icons-material';
import { toggleDarkMode } from '../features/ui/uiSlice';
import { logout } from '../features/auth/authSlice';
import { APP_INFO, NAVIGATION } from '../utils/constants';

const Header = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const { user } = useSelector(state => state.auth);
  const { darkMode } = useSelector(state => state.ui);
  
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationAnchorEl, setNotificationAnchorEl] = useState(null);
  
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleNotificationMenuOpen = (event) => {
    setNotificationAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationMenuClose = () => {
    setNotificationAnchorEl(null);
  };

  const handleLogout = () => {
    dispatch(logout());
    handleMenuClose();
    navigate('/login');
  };

  const handleNavigate = (path) => {
    navigate(path);
    if (isMobile) {
      setMobileOpen(false);
    }
    handleMenuClose();
  };

  const handleThemeToggle = () => {
    dispatch(toggleDarkMode());
  };

  // Filter navigation items based on user role
  const getNavItems = (navItems) => {
    if (!user) return [];
    return navItems.filter(item => 
      item.roles.includes(user.role)
    );
  };

  const mainNavItems = getNavItems(NAVIGATION.MAIN);

  // Map icons to components
  const getIcon = (iconName) => {
    const icons = {
      'Dashboard': <Dashboard />,
      'Assignment': <Assignment />,
      'QuestionAnswer': <QuestionAnswer />,
      'Quiz': <Quiz />,
      'Person': <Person />,
      'Settings': <Settings />,
      'Help': <Help />,
      'AdminPanelSettings': <AdminPanelSettings />
    };
    return icons[iconName] || null;
  };

  const mobileDrawer = (
    <Box sx={{ width: 280, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <LocalPharmacy sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="h6" component="div">
            {APP_INFO.NAME}
          </Typography>
        </Box>
        <IconButton onClick={handleDrawerToggle}>
          <Close />
        </IconButton>
      </Box>
      
      <Divider />
      
      <List sx={{ flexGrow: 1 }}>
        {mainNavItems.map((item) => (
          <ListItem key={item.id} disablePadding>
            <ListItemButton onClick={() => handleNavigate(item.path)}>
              <ListItemIcon>{getIcon(item.icon)}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      
      <Divider />
      
      <Box sx={{ p: 2 }}>
        <FormControlLabel
          control={
            <Switch
              checked={darkMode}
              onChange={handleThemeToggle}
              color="primary"
            />
          }
          label={darkMode ? "Dark Mode" : "Light Mode"}
        />
      </Box>
      
      <Divider />
      
      {user && (
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
          <Avatar sx={{ width: 32, height: 32, mr: 1 }}>
            {user.firstName?.charAt(0) || 'U'}
          </Avatar>
          <Box>
            <Typography variant="body2" fontWeight="bold">
              {user.firstName} {user.lastName}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
            </Typography>
          </Box>
        </Box>
      )}
    </Box>
  );

  return (
    <>
      <AppBar position="fixed" color="default" elevation={0} sx={{ zIndex: theme.zIndex.drawer + 1 }}>
        <Container maxWidth="xl">
          <Toolbar disableGutters>
            {/* Logo and title */}
            <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
              <LocalPharmacy sx={{ mr: 1, color: 'primary.main' }} />
              <Typography
                variant="h6"
                noWrap
                component="div"
                sx={{ 
                  mr: 2, 
                  display: { xs: 'none', md: 'flex' },
                  fontWeight: 700,
                  letterSpacing: '.1rem'
                }}
              >
                {APP_INFO.NAME}
              </Typography>
            </Box>

            {/* Mobile menu button */}
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { md: 'none' } }}
            >
              <MenuIcon />
            </IconButton>

            {/* Mobile title */}
            <Typography
              variant="h6"
              noWrap
              component="div"
              sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}
            >
              {APP_INFO.NAME}
            </Typography>

            {/* Desktop navigation */}
            <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
              {user && mainNavItems.map((item) => (
                <Button
                  key={item.id}
                  onClick={() => handleNavigate(item.path)}
                  sx={{ 
                    my: 2, 
                    color: 'text.primary', 
                    display: 'flex', 
                    alignItems: 'center',
                    mr: 1 
                  }}
                  startIcon={getIcon(item.icon)}
                >
                  {item.label}
                </Button>
              ))}
            </Box>

            {/* Right side icons */}
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {/* Theme toggle */}
              <Tooltip title={darkMode ? "Switch to light mode" : "Switch to dark mode"}>
                <IconButton sx={{ ml: 1 }} onClick={handleThemeToggle} color="inherit">
                  {darkMode ? <LightMode /> : <DarkMode />}
                </IconButton>
              </Tooltip>

              {/* Notifications */}
              {user && (
                <Tooltip title="Notifications">
                  <IconButton 
                    color="inherit"
                    onClick={handleNotificationMenuOpen}
                  >
                    <Badge badgeContent={3} color="error">
                      <Notifications />
                    </Badge>
                  </IconButton>
                </Tooltip>
              )}

              {/* Profile menu */}
              {user ? (
                <Tooltip title="Account settings">
                  <IconButton
                    onClick={handleProfileMenuOpen}
                    size="small"
                    edge="end"
                    aria-haspopup="true"
                    color="inherit"
                    sx={{ ml: 1 }}
                  >
                    <Avatar sx={{ width: 32, height: 32 }}>
                      {user.firstName?.charAt(0) || 'U'}
                    </Avatar>
                  </IconButton>
                </Tooltip>
              ) : (
                <Button 
                  variant="contained" 
                  color="primary"
                  onClick={() => navigate('/login')}
                  sx={{ ml: 1 }}
                >
                  Login
                </Button>
              )}
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Profile Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{
          elevation: 0,
          sx: {
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.1))',
            mt: 1.5,
            width: 200,
          },
        }}
      >
        <MenuItem onClick={() => handleNavigate('/profile')}>
          <ListItemIcon>
            <Person fontSize="small" />
          </ListItemIcon>
          Profile
        </MenuItem>
        
        <MenuItem onClick={() => handleNavigate('/settings')}>
          <ListItemIcon>
            <Settings fontSize="small" />
          </ListItemIcon>
          Settings
        </MenuItem>
        
        <MenuItem onClick={() => handleNavigate('/help')}>
          <ListItemIcon>
            <Help fontSize="small" />
          </ListItemIcon>
          Help Center
        </MenuItem>
        
        <Divider />
        
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <Logout fontSize="small" />
          </ListItemIcon>
          Logout
        </MenuItem>
      </Menu>

      {/* Notifications Menu */}
      <Menu
        anchorEl={notificationAnchorEl}
        open={Boolean(notificationAnchorEl)}
        onClose={handleNotificationMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{
          elevation: 0,
          sx: {
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.1))',
            mt: 1.5,
            width: 320,
          },
        }}
      >
        <Box sx={{ p: 2, pb: 1 }}>
          <Typography variant="subtitle1" fontWeight="bold">Notifications</Typography>
        </Box>
        
        <Divider />
        
        <MenuItem>
          <Box sx={{ py: 0.5 }}>
            <Typography variant="body2" fontWeight="bold">New case submission</Typography>
            <Typography variant="caption" color="text.secondary">John Doe submitted a new case for review</Typography>
          </Box>
        </MenuItem>
        
        <MenuItem>
          <Box sx={{ py: 0.5 }}>
            <Typography variant="body2" fontWeight="bold">Test results available</Typography>
            <Typography variant="caption" color="text.secondary">Results for Pharmacology 101 are now available</Typography>
          </Box>
        </MenuItem>
        
        <MenuItem>
          <Box sx={{ py: 0.5 }}>
            <Typography variant="body2" fontWeight="bold">Query response</Typography>
            <Typography variant="caption" color="text.secondary">Dr. Smith responded to your clinical query</Typography>
          </Box>
        </MenuItem>
        
        <Divider />
        
        <MenuItem>
          <Typography variant="body2" color="primary" sx={{ width: '100%', textAlign: 'center' }}>
            View all notifications
          </Typography>
        </MenuItem>
      </Menu>

      {/* Mobile Navigation Drawer */}
      <SwipeableDrawer
        variant="temporary"
        open={mobileOpen}
        onOpen={() => setMobileOpen(true)}
        onClose={() => setMobileOpen(false)}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 280 },
        }}
      >
        {mobileDrawer}
      </SwipeableDrawer>
    </>
  );
};

export default Header; 